/* ============================================================
   Marigold — profile store
   Signal-based store persisting the shopper's profile
   ({ name, phone, address }) to localStorage under
   `marigold.profile.v1`, with an in-memory fallback when
   storage is unavailable (private browsing). Mirrors CartStore
   conventions, minus cross-tab sync (the profile page is the
   simplest possible form).
   This store is the seam where a server-side profile API plugs in.
   ============================================================ */
import { Injectable, signal } from '@angular/core';

const PROFILE_KEY = 'marigold.profile.v1';

export interface Profile {
  name: string;
  phone: string;
  address: string;
}

const EMPTY_PROFILE: Profile = { name: '', phone: '', address: '' };

function storageAvailable(): boolean {
  try {
    const k = '__marigold_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function readJson<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value: unknown = JSON.parse(raw);
    return isValid(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

/** Shape guard so corrupt-but-valid JSON never enters the store. */
function isProfile(value: unknown): value is Profile {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  return typeof v['name'] === 'string' && typeof v['phone'] === 'string' && typeof v['address'] === 'string';
}

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  /** False when localStorage is blocked (private browsing) — profile stays in memory. */
  readonly persistent = storageAvailable();

  private readonly _profile = signal<Profile>(
    this.persistent ? readJson<Profile>(PROFILE_KEY, EMPTY_PROFILE, isProfile) : EMPTY_PROFILE,
  );

  /** Saved profile — read-only view. */
  readonly profile = this._profile.asReadonly();

  /** Trim and save the profile fields; in-memory only when storage is blocked. */
  save(name: string, phone: string, address: string): Profile {
    const next: Profile = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };
    this._profile.set(next);
    this.persist();
    return next;
  }

  private persist(): void {
    if (!this.persistent) return;
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(this._profile()));
    } catch {
      /* storage full/blocked — profile stays in memory */
    }
  }
}
