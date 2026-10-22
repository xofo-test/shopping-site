/* ============================================================
   Marigold — typed models for the mock data layer
   These shapes are the contract the UI consumes; when the mock
   JSON is later replaced by real backend APIs, the services in
   src/app/core keep returning these types.
   ============================================================ */

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
}

export interface PricingFile {
  currency: CurrencyConfig;
  /** Flat estimated delivery charge (₹), applied only when the cart is non-empty. */
  deliveryFee: number;
  /** GST rate applied to the discounted subtotal. */
  taxRate: number;
  taxLabel: string;
}

export interface Variants {
  label: string;
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  blurb: string;
  icon: string;
  tone: [string, string];
  variants: Variants | null;
  /** Product-matched stock photography URL (swap for a real product CDN later). */
  photoUrl: string;
  /** Offline SVG artwork data URI (fallback when photos can't load), added by ProductService. */
  image: string;
}

export type CouponType = 'percent' | 'flat';

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  /** ISO date (yyyy-mm-dd) — last day the coupon is usable. */
  expiresOn: string;
  description: string;
}

export interface CartLine {
  /** Line identity: `${productId}|${variant ?? 'default'}`. */
  id: string;
  productId: string;
  variant: string | null;
  qty: number;
}

export interface CouponInfo {
  code: string | null;
  applied: boolean;
  reason: string | null;
}

export interface Totals {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  discount: number;
  coupon: CouponInfo;
  delivery: number;
  tax: number;
  total: number;
}

export interface CouponCheck {
  valid: boolean;
  reason: string | null;
}

export interface CouponResult {
  ok: boolean;
  message: string;
}
