/* ============================================================
   Marigold — in-app confirm dialog service
   Replaces the prototype's native window.confirm().
   ============================================================ */
import { Injectable, signal } from '@angular/core';

export interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  resolve: (ok: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmState | null>(null);

  confirm(message: string, confirmLabel = 'Confirm', title = 'Are you sure?'): Promise<boolean> {
    return new Promise((resolve) => this.state.set({ title, message, confirmLabel, resolve }));
  }

  answer(ok: boolean): void {
    const s = this.state();
    this.state.set(null);
    s?.resolve(ok);
  }
}
