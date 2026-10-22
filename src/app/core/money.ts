/* ============================================================
   Marigold — money formatting (INR via Intl, en-IN, no decimals)
   Kept as a free function so any service can format currency
   without creating DI cycles.
   ============================================================ */
import { CurrencyConfig } from '../data/models';

export function makeMoneyFormatter(currency: CurrencyConfig): (n: number) => string {
  const formatter = new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    maximumFractionDigits: 0,
  });
  return (n: number) => formatter.format(n);
}
