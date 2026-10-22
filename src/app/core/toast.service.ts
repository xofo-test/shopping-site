/* ============================================================
   Marigold — toast notifications
   ============================================================ */
import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  leaving: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<ToastMessage[]>([]);

  show(message: string): void {
    const id = ++this.nextId;
    this.toasts.update((list) => [...list, { id, message, leaving: false }]);
    setTimeout(() => {
      this.toasts.update((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    }, 2200);
    setTimeout(() => {
      this.toasts.update((list) => list.filter((t) => t.id !== id));
    }, 2500);
  }
}
