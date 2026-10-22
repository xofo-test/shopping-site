/* ============================================================
   Marigold — coupon data access & validation
   Validation scope (per project decision): expiry + minimum
   order only. Reads mock JSON today; the same interface serves
   a real coupon API later.
   ============================================================ */
import { Injectable } from '@angular/core';
import { Coupon, CouponCheck } from '../data/models';
import COUPONS_JSON from '../data/coupons.json';

@Injectable({ providedIn: 'root' })
export class CouponService {
  readonly coupons: Coupon[] = COUPONS_JSON as Coupon[];

  find(code: string): Coupon | null {
    const c = String(code ?? '').trim().toUpperCase();
    return this.coupons.find((x) => x.code === c) ?? null;
  }

  /** Expiry + minimum-order check for a coupon against a subtotal. */
  check(coupon: Coupon, subtotal: number): CouponCheck {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (today > new Date(coupon.expiresOn + 'T23:59:59')) {
      return { valid: false, reason: 'expired on ' + this.formatDate(coupon.expiresOn) };
    }
    if (subtotal < coupon.minOrder) {
      return { valid: false, reason: 'needs a minimum order of ₹' + coupon.minOrder.toLocaleString('en-IN') };
    }
    return { valid: true, reason: null };
  }

  /** Coupon codes that have not expired yet — for the "Try:" hint. */
  validCodes(): string[] {
    return this.coupons.filter((c) => new Date(c.expiresOn + 'T23:59:59') >= new Date()).map((c) => c.code);
  }

  describe(c: Coupon): string {
    return c.type === 'percent' ? c.value + '% off' : '₹' + c.value.toLocaleString('en-IN') + ' off';
  }

  formatDate(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
}
