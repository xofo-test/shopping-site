import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="site-footer">
      <div class="container">
        <p class="small muted">
          Marigold — prototype storefront for the online shopping cart module. Prices in INR (₹). No real orders are
          placed.
        </p>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
