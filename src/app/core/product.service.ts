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

/** Seeded placeholder photography (swap the URL template for a real CDN later). */
const PHOTO_URL = (seed: string) => `https://picsum.photos/seed/${seed}/640/640`;

@Injectable({ providedIn: 'root' })
export class ProductService {
  /** Mock catalogue with placeholder photos plus offline SVG fallback artwork. */
  readonly products: Product[] = (PRODUCTS_JSON as Product[]).map((p) => ({
    ...p,
    photoUrl: PHOTO_URL(p.photoSeed),
    image: svgArt(p.icon, p.tone[0], p.tone[1]),
  }));

  productOf(id: string): Product | null {
    return this.products.find((p) => p.id === id) ?? null;
  }

  /** Shared <img> error handler: fall back to offline artwork, never a broken image. */
  handleImageError(ev: Event, product: Product): void {
    const img = ev.target as HTMLImageElement;
    img.src = product.image;
  }
}
