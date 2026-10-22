# shopping-site — Marigold shopping cart (RUN-1010)

Angular implementation of the approved "Marigold" shopping-cart module: a mock
product listing (Shop), a full cart with coupon validation and an auto-updating
order summary, and a mock checkout with an order-placed confirmation. No backend,
no payment — all data comes from typed mock JSON and the cart persists in
`localStorage`.

## Stack

- Angular `21.2` (standalone components, signals, zoneless), scaffolded with
  `@angular/cli@21.2.27` on Node `v24.11.0`, TypeScript `~5.9.2`.
- Tests run on the vitest-based `@angular/build:unit-test` builder (no browser needed):
  `npm test`.
- Production build: `npm run build`.

## Layout

- `src/app/data/` — typed models (`models.ts`) and mock JSON (`products.json`,
  `coupons.json`, `pricing.json`). This is the single place mock data lives.
- `src/app/core/` — data-access services that consume the JSON now and can be
  swapped for HTTP later without touching components: `ProductService`,
  `CouponService`, `PricingService` (pricing engine), plus the signal-based
  `CartStore` (localStorage persistence, cross-tab sync, coupon application),
  `ToastService` and `ConfirmService`.
- `src/app/shared/` — header with live cart-count badge, footer, toast host,
  in-app confirm dialog, shared order-summary component, `money` pipe (INR).
- `src/app/features/` — `shop`, `cart` and `checkout` pages routed at `/`,
  `/cart` and `/checkout`.
- `src/styles/` — SCSS design tokens (`_tokens.scss`) emitted as CSS custom
  properties; global styles in `src/styles.scss`.
- `prototype/` — the approved static prototype kept as a non-shipped reference.

## Design system

- Typeface: self-hosted [Outfit](https://fontsource.org/fonts/outfit) via
  `@fontsource/outfit` (weights 400-800), wired through `--font`.
- Colour: warm stone neutrals with a marigold amber accent (`#b45309` light /
  `#e8963e` dark), defined once in `_tokens.scss` as CSS custom properties.
  Dark mode follows `prefers-color-scheme` through token overrides only.
- Icons: [Phosphor](https://phosphoricons.com) via `@ng-icons/core` +
  `@ng-icons/phosphor-icons` (registered app-wide in `app.config.ts`).
- Imagery: seeded placeholder photography (picsum.photos) per product with an
  automatic offline SVG fallback (`ProductService.handleImageError`), so the
  full flow still demos with no network.
- Motion: subtle 0.15s transitions; everything collapses under
  `prefers-reduced-motion: reduce`.

## Pricing rules (carried over from the approved prototype)

- Flat ₹79 estimated delivery whenever the cart is non-empty.
- 12% GST applied to the discounted subtotal (`Math.round`).
- Coupons: expiry + minimum-order validation; flat discounts capped at the
  subtotal. Currency is INR (₹, `en-IN`, no fraction digits).

## Mock coupons

`SAVE10` (10% off ≥ ₹999), `FLAT250` (₹250 off ≥ ₹1,499), `NEW15` (15% off ≥
₹2,999) and an intentionally expired `WELCOME500` used to demo the expired path.
Expiry dates are reviewed before each demo so the valid/expired paths stay live.

## Replacing mocks with real APIs

Components only consume `ProductService` / `CouponService` / `PricingService` /
`CartStore`. Point those at real endpoints (returning the same typed shapes from
`src/app/data/models.ts`) and the UI needs no changes.
