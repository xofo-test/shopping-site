import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CartStore } from '../../core/cart-store';
import { ToastService } from '../../core/toast.service';
import { OrderSummaryComponent } from '../../shared/order-summary.component';
import { MoneyPipe } from '../../shared/money.pipe';

interface PlacedOrder {
  orderId: string;
  total: number;
  payment: string;
  eta: string;
  name: string;
  pin: string;
}

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, FormsModule, MoneyPipe, OrderSummaryComponent, NgIcon],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  private readonly store = inject(CartStore);
  private readonly toast = inject(ToastService);

  protected readonly t = computed(() => this.store.totals());
  protected readonly placed = signal<PlacedOrder | null>(null);

  protected readonly states = [
    'Karnataka',
    'Maharashtra',
    'Delhi',
    'Tamil Nadu',
    'Telangana',
    'Gujarat',
    'West Bengal',
    'Kerala',
  ];

  protected form = {
    name: '',
    phone: '',
    address: '',
    city: '',
    state: 'Karnataka',
    pin: '',
    payment: 'UPI',
  };

  protected formError = signal<string | null>(null);

  protected async placeOrder(): Promise<void> {
    const snapshot = this.store.totals();
    if (snapshot.lines.length === 0) return;

    const missing: string[] = [];
    if (!this.form.name.trim()) missing.push('full name');
    if (!this.form.address.trim()) missing.push('address');
    if (!/^\d{6}$/.test(this.form.pin.trim())) missing.push('a valid 6-digit PIN code');
    if (missing.length) {
      this.formError.set('Please enter your ' + missing.join(', ') + '.');
      return;
    }
    this.formError.set(null);

    const orderId = 'MG-' + (100000 + Math.floor(Math.random() * 900000));
    const eta = new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });

    this.placed.set({
      orderId,
      total: snapshot.total,
      payment: this.form.payment,
      eta,
      name: this.form.name.trim(),
      pin: this.form.pin.trim(),
    });

    this.store.clear(); // empties cart + coupon
    this.toast.show('Order ' + orderId + ' placed');
  }
}
