import { Component, ElementRef, Injector, afterNextRender, effect, inject, viewChild } from '@angular/core';
import { ConfirmService } from '../core/confirm.service';

/** In-app replacement for the prototype's native confirm() dialog. */
@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  host: {
    // Escape dismisses the dialog no matter where focus currently sits.
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    @if (confirm.state(); as c) {
      <div class="dialog-backdrop" (click)="confirm.answer(false)">
        <div class="dialog panel" role="dialog" aria-modal="true" aria-label="Please confirm" (click)="$event.stopPropagation()">
          <h2>{{ c.title }}</h2>
          <p class="dialog-message">{{ c.message }}</p>
          <div class="dialog-actions">
            <button #cancel type="button" class="btn btn-ghost" (click)="confirm.answer(false)">Cancel</button>
            <button type="button" class="btn btn-danger-solid" (click)="confirm.answer(true)">{{ c.confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);

  private readonly injector = inject(Injector);
  private readonly cancelBtn = viewChild<ElementRef<HTMLButtonElement>>('cancel');

  constructor() {
    // Keyboard/focus pass (per plan): when the dialog opens, move initial
    // focus to the safe Cancel action once the dialog has rendered.
    effect(() => {
      if (this.confirm.state()) {
        afterNextRender(() => this.cancelBtn()?.nativeElement.focus(), { injector: this.injector });
      }
    });
  }

  protected onEscape(): void {
    if (this.confirm.state()) this.confirm.answer(false);
  }
}
