import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CartLine } from '../../data/models';
import { CartStore } from '../../core/cart-store';
import { CouponService } from '../../core/coupon.service';
import { ConfirmService } from '../../core/confirm.service';
import { ToastService } from '../../core/toast.service';
import { ProductService } from '../../core/product.service';
import { OrderSummaryComponent } from '../../shared/order-summary.component';
import { MoneyPipe } from '../../shared/money.pipe';

interface LineView {
  line: CartLine;
  name: string;
  photoUrl: string;
  fallback: string;
  variantText: string;
  unitPrice: number;
  subtotal: number;
}

@Component({
  selector: 'app-cart',
  imports: [RouterLink, FormsModule, MoneyPipe, OrderSummaryComponent, NgIcon],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  protected readonly store = inject(CartStore);
  private readonly productService = inject(ProductService);
  private readonly couponService = inject(CouponService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  /** Auto-updating totals straight from the store. */
  protected readonly t = this.store.totals;

  /** Render-ready view models for the cart lines. */
  protected readonly views = computed<LineView[]>(() =>
    this.store
      .lines()
      .map((l) => this.lineView(l))
      .filter((v): v is LineView => v !== null),
  );

  /** Last coupon form message; cleared when the applied coupon is removed/invalid. */
  protected readonly couponMsg = signal<{ ok: boolean; text: string } | null>(null);
  protected couponInput = '';

  protected readonly validCodes = this.couponService.validCodes().join(', ');

  protected lineView(l: CartLine): LineView | null {
    const p = this.productService.productOf(l.productId);
    if (!p) return null;
    return {
      line: l,
      name: p.name,
      photoUrl: p.photoUrl,
      fallback: p.image,
      variantText: l.variant ? (p.variants ? p.variants.label + ': ' : '') + l.variant : p.category,
      unitPrice: p.price,
      subtotal: p.price * l.qty,
    };
  }

  protected onImgError(ev: Event, v: LineView): void {
    (ev.target as HTMLImageElement).src = v.fallback;
  }

  protected step(l: CartLine, delta: number): void {
    this.store.setQty(l.id, l.qty + delta);
  }

  protected async clearCart(): Promise<void> {
    const ok = await this.confirm.confirm(
      'This removes every item and any applied coupon.',
      'Clear cart',
      'Clear the whole cart?',
    );
    if (ok) {
      this.store.clear();
      this.toast.show('Cart cleared');
    }
  }

  protected removeCoupon(): void {
    this.store.clearCoupon();
    this.couponMsg.set(null);
  }

  protected applyCoupon(): void {
    const code = this.couponInput.trim();
    if (!code) {
      this.couponMsg.set({ ok: false, text: 'Enter a coupon code to apply.' });
      return;
    }
    const result = this.store.applyCoupon(code);
    this.couponMsg.set({ ok: result.ok, text: result.message });
  }
}
