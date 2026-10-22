import { TestBed } from '@angular/core/testing';
import { CartStore } from './cart-store';

describe('CartStore (pricing & coupon engine)', () => {
  let store: CartStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(CartStore);
  });

  it('adds lines keyed by product + variant identity', () => {
    store.add('p1', 'Midnight Black');
    store.add('p1', 'Cloud White');
    store.add('p1', 'Midnight Black');
    expect(store.itemCount()).toBe(3);
    expect(store.lines().length).toBe(2);
    expect(store.lines().find((l) => l.id === 'p1|Midnight Black')?.qty).toBe(2);
  });

  it('treats a product without variants as a single default line', () => {
    store.add('p3', null);
    store.add('p3', null);
    expect(store.lines().length).toBe(1);
    expect(store.lines()[0].id).toBe('p3|default');
    expect(store.lines()[0].qty).toBe(2);
  });

  it('removes a line when quantity drops to zero', () => {
    store.add('p3', null);
    store.setQty('p3|default', 1);
    store.setQty('p3|default', 0);
    expect(store.lines().length).toBe(0);
  });

  it('removes individual lines and clears the whole cart', () => {
    store.add('p1', 'Midnight Black');
    store.add('p5', 'M');
    store.remove('p1|Midnight Black');
    expect(store.lines().length).toBe(1);
    store.clear();
    expect(store.itemCount()).toBe(0);
    expect(store.couponCode()).toBeNull();
  });

  it('computes subtotal, delivery, tax and total without a coupon', () => {
    store.add('p1', 'Midnight Black'); // ₹4,999
    const t = store.totals();
    expect(t.subtotal).toBe(4999);
    expect(t.discount).toBe(0);
    expect(t.delivery).toBe(79);
    expect(t.tax).toBe(Math.round(4999 * 0.12)); // 600
    expect(t.total).toBe(4999 + 79 + 600);
  });

  it('waives delivery and totals zero on an empty cart', () => {
    const t = store.totals();
    expect(t.delivery).toBe(0);
    expect(t.total).toBe(0);
  });

  it('applies a valid percent coupon', () => {
    store.add('p1', 'Midnight Black'); // ₹4,999 ≥ ₹999 minimum
    const result = store.applyCoupon('save10');
    expect(result.ok).toBe(true);
    const t = store.totals();
    expect(t.coupon.applied).toBe(true);
    expect(t.discount).toBe(Math.round(4999 * 0.1)); // 500
    expect(t.total).toBe(4999 - 500 + 79 + Math.round(4499 * 0.12));
  });

  it('rejects an unknown coupon', () => {
    store.add('p1', 'Midnight Black');
    const result = store.applyCoupon('NOPE');
    expect(result.ok).toBe(false);
    expect(result.message).toContain('not a valid coupon code');
  });

  it('rejects an expired coupon with the expiry date', () => {
    store.add('p1', 'Midnight Black');
    const result = store.applyCoupon('WELCOME500');
    expect(result.ok).toBe(false);
    expect(result.message).toContain('expired');
  });

  it('rejects a coupon below the minimum order with the shortfall', () => {
    store.add('p5', 'M'); // ₹899 < ₹1,499 minimum for FLAT250
    const result = store.applyCoupon('FLAT250');
    expect(result.ok).toBe(false);
    expect(result.message).toContain('600 more');
  });

  it('keeps a stored coupon but stops applying it when the cart shrinks below the minimum', () => {
    store.add('p5', 'M');
    store.add('p5', 'M'); // ₹1,798 ≥ ₹1,499 minimum
    expect(store.applyCoupon('FLAT250').ok).toBe(true);
    expect(store.totals().discount).toBe(250);
    store.setQty('p5|M', 1); // ₹899 — below the minimum, but not empty
    const t = store.totals();
    expect(t.coupon.code).toBe('FLAT250');
    expect(t.coupon.applied).toBe(false);
    expect(t.discount).toBe(0);
    expect(t.coupon.reason).toContain('minimum order');
  });

  it('clears the stored coupon with the cart', () => {
    store.add('p1', 'Midnight Black');
    store.applyCoupon('SAVE10');
    expect(store.couponCode()).toBe('SAVE10');
    store.clear();
    expect(store.couponCode()).toBeNull();
  });

  it('persists cart lines and coupon to localStorage', () => {
    store.add('p1', 'Steel Blue');
    store.applyCoupon('SAVE10');
    const raw = JSON.parse(localStorage.getItem('marigold.cart.v1') ?? '[]');
    expect(raw.length).toBe(1);
    expect(raw[0].productId).toBe('p1');
    expect(localStorage.getItem('marigold.coupon.v1')).toBe('SAVE10');
  });
});
