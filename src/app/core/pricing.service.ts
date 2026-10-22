/* ============================================================
   Marigold — pricing engine
   Rules carried verbatim from the approved prototype:
   flat delivery fee when the cart is non-empty, GST applied to
   the discounted subtotal, flat-coupon discounts capped at the
   subtotal, Math.round on tax.
   ============================================================ */
import { Injectable, inject } from '@angular/core';
import { CartLine, CouponInfo, PricingFile, Totals } from '../data/models';
import PRICING_JSON from '../data/pricing.json';
import { CouponService } from './coupon.service';
import { ProductService } from './product.service';
import { makeMoneyFormatter } from './money';

@Injectable({ providedIn: 'root' })
export class PricingService {
  private readonly file: PricingFile = PRICING_JSON as PricingFile;
  readonly currency = this.file.currency;
  readonly deliveryFee = this.file.deliveryFee;
  readonly taxRate = this.file.taxRate;
  readonly taxLabel = this.file.taxLabel;

  private readonly format = makeMoneyFormatter(this.currency);
  private readonly coupons = inject(CouponService);
  private readonly products = inject(ProductService);

  money(n: number): string {
    return this.format(n);
  }

  subtotalOf(lines: CartLine[]): number {
    let subtotal = 0;
    for (const l of lines) {
      const p = this.products.productOf(l.productId);
      if (p) subtotal += p.price * l.qty;
    }
    return subtotal;
  }

  /** Full order summary for the given cart lines and stored coupon code. */
  totals(lines: CartLine[], couponCode: string | null): Totals {
    const subtotal = this.subtotalOf(lines);

    let discount = 0;
    let couponInfo: CouponInfo = { code: null, applied: false, reason: null };
    if (couponCode && subtotal > 0) {
      const coupon = this.coupons.find(couponCode);
      if (coupon) {
        const check = this.coupons.check(coupon, subtotal);
        if (check.valid) {
          discount =
            coupon.type === 'percent'
              ? Math.round((subtotal * coupon.value) / 100)
              : Math.min(coupon.value, subtotal);
          couponInfo = { code: coupon.code, applied: true, reason: null };
        } else {
          couponInfo = { code: coupon.code, applied: false, reason: check.reason };
        }
      }
    }

    const base = subtotal - discount;
    const delivery = subtotal > 0 ? this.deliveryFee : 0;
    const tax = Math.round(base * this.taxRate);
    const total = base + delivery + tax;

    return {
      lines,
      // Count only lines whose product still resolves, so the header badge
      // can never disagree with the (filtered) cart list after a catalogue change.
      itemCount: lines.reduce((s, l) => (this.products.productOf(l.productId) ? s + l.qty : s), 0),
      subtotal,
      discount,
      coupon: couponInfo,
      delivery,
      tax,
      total,
    };
  }
}
