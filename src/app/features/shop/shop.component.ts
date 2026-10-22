import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CartStore } from '../../core/cart-store';
import { ToastService } from '../../core/toast.service';
import { ProductService } from '../../core/product.service';
import { Product } from '../../data/models';
import { MoneyPipe } from '../../shared/money.pipe';

@Component({
  selector: 'app-shop',
  imports: [FormsModule, MoneyPipe],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent {
  private readonly cart = inject(CartStore);
  private readonly toast = inject(ToastService);

  protected readonly productService = inject(ProductService);
  protected readonly products = this.productService.products;

  /** Currently selected variant per product id (defaults to the first option). */
  protected readonly selected: Record<string, string> = {};

  constructor() {
    for (const p of this.products) {
      if (p.variants) this.selected[p.id] = p.variants.options[0];
    }
  }

  protected off(p: Product): number {
    return Math.round((1 - p.price / p.mrp) * 100);
  }

  protected reviewsText(n: number): string {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n);
  }

  protected add(p: Product): void {
    const variant = p.variants ? (this.selected[p.id] ?? p.variants.options[0]) : null;
    this.cart.add(p.id, variant);
    this.toast.show('Added “' + p.name + (variant ? ' · ' + variant : '') + '” to your cart');
  }
}
