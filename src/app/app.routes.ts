import { Routes } from '@angular/router';
import { ShopComponent } from './features/shop/shop.component';
import { CartComponent } from './features/cart/cart.component';
import { CheckoutComponent } from './features/checkout/checkout.component';

export const routes: Routes = [
  { path: '', component: ShopComponent, title: 'Shop Everyday Essentials | Marigold' },
  { path: 'cart', component: CartComponent, title: 'Your Cart | Marigold' },
  { path: 'checkout', component: CheckoutComponent, title: 'Checkout | Marigold' },
  { path: '**', redirectTo: '' },
];
