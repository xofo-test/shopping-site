import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CartStore } from '../core/cart-store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, NgIcon],
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" routerLink="/"><span class="brand-mark" aria-hidden="true">❖</span> Marigold</a>
        <nav class="site-nav" aria-label="Primary">
          <a
            routerLink="/"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            #shopLink="routerLinkActive"
            [attr.aria-current]="shopLink.isActive ? 'page' : null"
            >Shop</a
          >
          <a routerLink="/cart" routerLinkActive="active" #cartLink="routerLinkActive" [attr.aria-current]="cartLink.isActive ? 'page' : null">Cart</a>
          <a routerLink="/checkout" routerLinkActive="active" #coLink="routerLinkActive" [attr.aria-current]="coLink.isActive ? 'page' : null">Checkout</a>
        </nav>
        <a class="cart-link" routerLink="/cart" aria-label="View cart">
          <ng-icon name="phosphorShoppingCartSimple" aria-hidden="true" />
          <span class="badge">{{ store.itemCount() }}</span>
        </a>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly store = inject(CartStore);
}
