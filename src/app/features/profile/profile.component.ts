/* ============================================================
   Marigold — profile page
   Editable name / phone / address form, styled exactly like the
   checkout form (fieldset, form-grid, alerts, primary button).
   ============================================================ */
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProfileStore } from '../../core/profile-store';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  private readonly store = inject(ProfileStore);
  private readonly toast = inject(ToastService);

  /** False when localStorage is blocked — drives the storage-unavailable warning. */
  protected readonly persistent = this.store.persistent;

  /** Editable copy of the saved profile, pre-filled on revisit.
   *  Deliberately a one-shot snapshot: the profile has no cross-tab
   *  storage sync (per the approved flow), so the `profile` signal only
   *  ever changes through this page's own save, which goes through
   *  `form` itself. If cross-tab sync ever lands, re-sync `form` here. */
  protected form = { ...this.store.profile() };

  protected formError = signal<string | null>(null);

  protected save(): void {
    const missing: string[] = [];
    if (!this.form.name.trim()) missing.push('your name');
    if (!this.form.phone.trim()) missing.push('your phone number');
    if (missing.length) {
      this.formError.set('Please enter ' + missing.join(' and ') + '.');
      return;
    }
    this.formError.set(null);
    this.store.save(this.form.name, this.form.phone, this.form.address);
    this.toast.show('Profile saved.');
  }
}
