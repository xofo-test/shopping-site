import { Component, inject, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { Totals } from '../data/models';
import { ProductService } from '../core/product.service';
import { PricingService } from '../core/pricing.service';
import { MoneyPipe } from './money.pipe';

/**
 * Shared auto-updating order summary used by the Cart and Checkout pages.
 * - Cart: coupon chip inside the discount row + savings note (`showChip`).
 * - Checkout: compact product lines + plain "Discount (CODE)" row (`showLines`).
 */
@Component({
  selector: 'app-order-summary',
  imports: [MoneyPipe, NgIcon],
  styles: `
    .summary-rows {
      margin: 0 0 var(--space-4);
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      gap: var(--space-3);
      padding: 6px 0;
      font-size: 0.95rem;
    }
    .summary-row dt {
      color: var(--text-muted);
    }
    .summary-row dd {
      margin: 0;
      font-weight: 600;
    }
    .summary-row .neg {
      color: var(--success);
    }
    .total-row {
      border-top: 1px solid var(--border);
      margin-top: var(--space-2);
      padding-top: var(--space-3);
      font-size: 1.05rem;
    }
    .total-row dt {
      color: var(--text);
      font-weight: 700;
    }
    .total-row dd {
      font-size: 1.2rem;
      font-weight: 800;
    }
    .coupon-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--success-soft);
      color: var(--success);
      font-weight: 700;
      font-size: 0.75rem;
      padding: 1px 8px;
      border-radius: 999px;
    }
    .coupon-chip button {
      border: none;
      background: none;
      color: inherit;
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0 2px;
      line-height: 1;
    }
    .savings-note {
      color: var(--success);
      font-weight: 600;
      font-size: 0.85rem;
      margin: var(--space-2) 0 0;
      display: inline-flex;
      align-items: center;
      gap: 5px;

      ng-icon {
        font-size: 15px;
      }
    }
    .compact-line {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2) 0;
    }
    .compact-line img {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-sm);
      object-fit: cover;
    }
    .compact-line .grow {
      flex: 1;
      min-width: 0;
    }
    .compact-line .name {
      font-weight: 600;
      font-size: 0.9rem;
    }
    .compact-line .amt {
      font-weight: 700;
      font-size: 0.9rem;
      white-space: nowrap;
    }
  `,
  template: `
    @if (showLines()) {
      @for (l of totals().lines; track l.id) {
        @if (productOf(l.productId); as p) {
          <div class="compact-line">
            <img [src]="p.photoUrl" alt="" width="44" height="44" loading="lazy" (error)="productService.handleImageError($event, p)" />
            <div class="grow">
              <div class="name">{{ p.name }}@if (l.variant) {<span> · {{ l.variant }}</span>}</div>
              <div class="muted small">Qty {{ l.qty }} × {{ p.price | money }}</div>
            </div>
            <div class="amt">{{ p.price * l.qty | money }}</div>
          </div>
        }
      }
    }
    <dl class="summary-rows">
      <div class="summary-row">
        <dt>Subtotal</dt>
        <dd>{{ totals().subtotal | money }}</dd>
      </div>
      @if (totals().coupon.applied) {
        <div class="summary-row">
          <dt>
            Discount
            @if (showChip()) {
              <span class="coupon-chip">
                {{ totals().coupon.code }}
                <button type="button" (click)="couponRemove.emit()" aria-label="Remove coupon">×</button>
              </span>
            } @else {
              ({{ totals().coupon.code }})
            }
          </dt>
          <dd class="neg">−{{ totals().discount | money }}</dd>
        </div>
      } @else if (totals().coupon.code && !showChip()) {
        <div class="summary-row">
          <dt class="muted small">Coupon {{ totals().coupon.code }} not applied ({{ totals().coupon.reason }})</dt>
          <dd></dd>
        </div>
      }
      <div class="summary-row">
        <dt>Estimated delivery</dt>
        <dd>{{ totals().delivery | money }}</dd>
      </div>
      <div class="summary-row">
        <dt>{{ pricing.taxLabel }}</dt>
        <dd>{{ totals().tax | money }}</dd>
      </div>
      <div class="summary-row total-row">
        <dt>Total</dt>
        <dd>{{ totals().total | money }}</dd>
      </div>
    </dl>
    @if (showSavings() && totals().discount > 0) {
      <p class="savings-note"><ng-icon name="phosphorPiggyBank" aria-hidden="true" /> You are saving {{ totals().discount | money }} on this order.</p>
    }
  `,
})
export class OrderSummaryComponent {
  protected readonly productService = inject(ProductService);

  protected readonly pricing = inject(PricingService);

  readonly totals = input.required<Totals>();
  readonly showChip = input(false);
  readonly showLines = input(false);
  readonly showSavings = input(true);
  readonly couponRemove = output<void>();

  protected productOf(id: string) {
    return this.productService.productOf(id);
  }
}
