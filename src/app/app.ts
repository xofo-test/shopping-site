import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header.component';
import { FooterComponent } from './shared/footer.component';
import { ToastHostComponent } from './shared/toast-host.component';
import { ConfirmDialogComponent } from './shared/confirm-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastHostComponent, ConfirmDialogComponent],
  template: `
    <app-header />
    <main class="container page">
      <router-outlet />
    </main>
    <app-footer />
    <app-toast-host />
    <app-confirm-dialog />
  `,
  styleUrl: './app.scss',
})
export class App {}
