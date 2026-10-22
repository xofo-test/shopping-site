import { Component, ElementRef, ViewChild, afterNextRender, inject } from '@angular/core';
import { ConfirmService } from '../core/confirm.service';

/** In-app replacement for the prototype's native confirm() dialog. */
@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  template: `
    @if (confirm.state(); as c) {
      <div class="dialog-backdrop" (click)="confirm.answer(false)">
        <div class="dialog panel" role="dialog" aria-modal="true" aria-label="Please confirm" (click)="$event.stopPropagation()">
          <h2>{{ c.title }}</h2>
          <p class="dialog-message">{{ c.message }}</p>
          <div class="dialog-actions">
            <button type="button" class="btn btn-ghost" (click)="confirm.answer(false)">Cancel</button>
            <button type="button" class="btn btn-danger-solid" (click)="confirm.answer(true)">{{ c.confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);
}
