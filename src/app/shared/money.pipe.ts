import { Pipe, PipeTransform, inject } from '@angular/core';
import { PricingService } from '../core/pricing.service';

/** Formats a number as INR currency (₹, en-IN, no fraction digits). */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  private readonly pricing = inject(PricingService);

  transform(value: number | null | undefined): string {
    return this.pricing.money(value ?? 0);
  }
}
