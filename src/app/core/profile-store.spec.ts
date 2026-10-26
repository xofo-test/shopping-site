import { TestBed } from '@angular/core/testing';
import { ProfileStore } from './profile-store';

describe('ProfileStore', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('starts with an empty profile when nothing is stored', () => {
    const store = TestBed.inject(ProfileStore);
    expect(store.profile()).toEqual({ name: '', phone: '', address: '' });
  });

  it('loads a stored profile on init', () => {
    localStorage.setItem(
      'marigold.profile.v1',
      JSON.stringify({ name: 'Ananya Sharma', phone: '98765 43210', address: 'Indiranagar, Bengaluru' }),
    );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const store = TestBed.inject(ProfileStore);
    expect(store.profile()).toEqual({
      name: 'Ananya Sharma',
      phone: '98765 43210',
      address: 'Indiranagar, Bengaluru',
    });
  });

  it('ignores corrupt and foreign JSON and starts empty', () => {
    localStorage.setItem('marigold.profile.v1', '{not json');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(ProfileStore).profile()).toEqual({ name: '', phone: '', address: '' });

    localStorage.setItem('marigold.profile.v1', JSON.stringify({ cart: [] }));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(ProfileStore).profile()).toEqual({ name: '', phone: '', address: '' });

    localStorage.setItem('marigold.profile.v1', JSON.stringify({ name: 42, phone: '', address: '' }));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(ProfileStore).profile()).toEqual({ name: '', phone: '', address: '' });
  });

  it('trims values on save and round-trips across re-instantiation', () => {
    const store = TestBed.inject(ProfileStore);
    const saved = store.save('  Ananya Sharma  ', ' 98765 43210 ', ' Indiranagar ');
    expect(saved).toEqual({ name: 'Ananya Sharma', phone: '98765 43210', address: 'Indiranagar' });
    expect(store.profile()).toEqual(saved);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const fresh = TestBed.inject(ProfileStore);
    expect(fresh.profile()).toEqual(saved);
  });

  it('persists the exact { name, phone, address } shape to marigold.profile.v1', () => {
    const store = TestBed.inject(ProfileStore);
    store.save('Ananya Sharma', '98765 43210', 'Flat 402, Lotus Residency');
    expect(JSON.parse(localStorage.getItem('marigold.profile.v1') ?? '{}')).toEqual({
      name: 'Ananya Sharma',
      phone: '98765 43210',
      address: 'Flat 402, Lotus Residency',
    });
  });

  it('keeps the profile in memory when storage is unavailable', () => {
    const blocked = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
      clear: () => {
        throw new Error('blocked');
      },
      key: () => null,
      get length() {
        return 0;
      },
    };
    vi.stubGlobal('localStorage', blocked);
    try {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const store = TestBed.inject(ProfileStore);
      expect(store.persistent).toBe(false);
      expect(store.profile()).toEqual({ name: '', phone: '', address: '' });
      store.save('Ananya Sharma', '98765 43210', 'Indiranagar');
      expect(store.profile().name).toBe('Ananya Sharma');
    } finally {
      vi.unstubAllGlobals();
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
    }
  });
});
