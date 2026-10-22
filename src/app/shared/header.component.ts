import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartStore } from '../core/cart-store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
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
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 4h2.5l2.2 10.5h10.1L20 7H7" />
            <circle cx="9.5" cy="19" r="1.6" />
            <circle cx="16.5" cy="19" r="1.6" />
          </svg>
          <span class="badge">{{ store.itemCount() }}</span>
        </a>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly store = inject(CartStore);
}
