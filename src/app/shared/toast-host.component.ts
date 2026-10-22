import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-host',
  imports: [],
  template: `
    <div class="toast-host" aria-live="polite">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class.leaving]="t.leaving">{{ t.message }}</div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  protected readonly toast = inject(ToastService);
}
