/* ============================================================
   Marigold — cart store
   Signal-based store mirroring prototype/cart.js: localStorage
   persistence (`marigold.cart.v1` / `marigold.coupon.v1`),
   cross-tab sync via the storage event, and an in-memory
   fallback when storage is unavailable (private browsing).
   This store is the seam where a server-side cart API plugs in.
   ============================================================ */
import { Injectable, computed, inject, signal } from '@angular/core';
import { CartLine, CouponResult } from '../data/models';
import { CouponService } from './coupon.service';
import { PricingService } from './pricing.service';

const CART_KEY = 'marigold.cart.v1';
const COUPON_KEY = 'marigold.coupon.v1';

function storageAvailable(): boolean {
  try {
    const k = '__marigold_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  private readonly pricing = inject(PricingService);
  private readonly couponService = inject(CouponService);

  /** False when localStorage is blocked (private browsing) — cart stays in memory. */
  readonly persistent = storageAvailable();

  private readonly _lines = signal<CartLine[]>([]);
  private readonly _couponCode = signal<string | null>(null);

  /** Cart lines — read-only view. */
  readonly lines = this._lines.asReadonly();
  /** Stored coupon code (may be present but not currently applicable). */
  readonly couponCode = this._couponCode.asReadonly();
  /** Auto-updating order summary, recomputed on every cart/coupon change. */
  readonly totals = computed(() => this.pricing.totals(this._lines(), this._couponCode()));
  readonly itemCount = computed(() => this.totals().itemCount);

  constructor() {
    this._lines.set(this.persistent ? readJson<CartLine[]>(CART_KEY, []) : []);
    this._couponCode.set(this.persistent ? readJson<string | null>(COUPON_KEY, null) : null);

    if (this.persistent) {
      window.addEventListener('storage', (e) => {
        if (e.key === CART_KEY) this._lines.set(readJson<CartLine[]>(CART_KEY, []));
        if (e.key === COUPON_KEY) this._couponCode.set(readJson<string | null>(COUPON_KEY, null));
      });
    }
  }

  /** Add a product (optionally with a selected variant); repeat adds increment qty. */
  add(productId: string, variant: string | null): void {
    const v = variant && variant.trim() !== '' ? variant : null;
    const id = productId + '|' + (v ?? 'default');
    this._lines.update((lines) => {
      const line = lines.find((l) => l.id === id);
      if (line) {
        return lines.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l));
      }
      return [...lines, { id, productId, variant: v, qty: 1 }];
    });
    this.persist();
  }

  /** Set a line's quantity; qty <= 0 removes the line. */
  setQty(lineId: string, qty: number): void {
    if (qty <= 0) {
      this.remove(lineId);
      return;
    }
    this._lines.update((lines) => lines.map((l) => (l.id === lineId ? { ...l, qty } : l)));
    this.persist();
  }

  remove(lineId: string): void {
    this._lines.update((lines) => lines.filter((l) => l.id !== lineId));
    this.persist();
  }

  /** Empty the cart and drop the stored coupon. */
  clear(): void {
    this._lines.set([]);
    this._couponCode.set(null);
    this.persist();
  }

  /** Validate and store a coupon code; returns a user-facing message. */
  applyCoupon(code: string): CouponResult {
    const subtotal = this.pricing.subtotalOf(this._lines());
    const coupon = this.couponService.find(code);
    if (!coupon) {
      return { ok: false, message: '“' + String(code).trim().toUpperCase() + '” is not a valid coupon code.' };
    }
    const check = this.couponService.check(coupon, subtotal);
    if (!check.valid) {
      if (check.reason && check.reason.startsWith('expired')) {
        return { ok: false, message: 'This coupon ' + check.reason + '.' };
      }
      const shortfall = coupon.minOrder - subtotal;
      return {
        ok: false,
        message:
          'Add ₹' + shortfall.toLocaleString('en-IN') + ' more to use this coupon (' + check.reason + ').',
      };
    }
    this._couponCode.set(coupon.code);
    this.persistCoupon();
    return { ok: true, message: 'Coupon ' + coupon.code + ' applied — ' + this.couponService.describe(coupon) + '.' };
  }

  clearCoupon(): void {
    this._couponCode.set(null);
    this.persistCoupon();
  }

  private persist(): void {
    if (!this.persistent) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(this._lines()));
    } catch {
      /* storage full/blocked — cart stays in memory */
    }
    this.persistCoupon();
  }

  private persistCoupon(): void {
    if (!this.persistent) return;
    try {
      const code = this._couponCode();
      if (code) localStorage.setItem(COUPON_KEY, code);
      else localStorage.removeItem(COUPON_KEY);
    } catch {
      /* ignore */
    }
  }
}
