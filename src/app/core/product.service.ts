/* ============================================================
   Marigold — product data access
   Currently reads the typed mock JSON; swap the body of
   `products`/`productOf` for an HTTP call later without
   touching any component.
   ============================================================ */
import { Injectable } from '@angular/core';
import { Product } from '../data/models';
import PRODUCTS_JSON from '../data/products.json';
import { svgArt } from './svg-art';

@Injectable({ providedIn: 'root' })
export class ProductService {
  /** Mock catalogue with offline SVG artwork rendered at load time. */
  readonly products: Product[] = (PRODUCTS_JSON as Product[]).map((p) => ({
    ...p,
    image: svgArt(p.icon, p.tone[0], p.tone[1]),
  }));

  productOf(id: string): Product | null {
    return this.products.find((p) => p.id === id) ?? null;
  }
}
