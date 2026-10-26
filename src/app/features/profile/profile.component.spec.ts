import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ToastService } from '../../core/toast.service';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(ProfileComponent);
    await fixture.whenStable();
    return fixture;
  }

  function typeIn(fixture: ComponentFixture<ProfileComponent>, selector: string, value: string) {
    const el = fixture.nativeElement as HTMLElement;
    const input = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    return fixture.whenStable();
  }

  async function submit(fixture: Awaited<ReturnType<typeof render>>) {
    const el = fixture.nativeElement as HTMLElement;
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  }

  it('renders the approved page: heading, three fields, info alert and Save button', async () => {
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Your profile');
    expect(el.querySelector('input[name="name"]')?.getAttribute('placeholder')).toBe('Ananya Sharma');
    expect(el.querySelector('input[name="phone"]')?.getAttribute('autocomplete')).toBe('tel');
    expect(el.querySelector('textarea[name="address"]')?.getAttribute('autocomplete')).toBe('street-address');
    expect(el.querySelector('fieldset legend')?.textContent).toContain('Personal details');
    expect(el.querySelector('.alert-info')?.textContent).toContain('Prototype only');
    const btn = el.querySelector<HTMLButtonElement>('button[type="submit"]');
    expect(btn?.textContent).toContain('Save profile');
  });

  it('pre-fills the form from a stored profile', async () => {
    localStorage.setItem(
      'marigold.profile.v1',
      JSON.stringify({ name: 'Ananya Sharma', phone: '98765 43210', address: 'Indiranagar' }),
    );
    const fixture = await render();
    const el = fixture.nativeElement as HTMLElement;
    expect((el.querySelector<HTMLInputElement>('input[name="name"]')!).value).toBe('Ananya Sharma');
    expect((el.querySelector<HTMLInputElement>('input[name="phone"]')!).value).toBe('98765 43210');
    expect((el.querySelector<HTMLTextAreaElement>('textarea[name="address"]')!).value).toBe('Indiranagar');
  });

  it('shows the error alert and saves nothing when name or phone are missing', async () => {
    const fixture = await render();
    await typeIn(fixture, 'input[name="name"]', 'Ananya Sharma');
    await submit(fixture);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.alert-error')?.textContent).toContain('Please enter your phone number.');
    expect(localStorage.getItem('marigold.profile.v1')).toBeNull();

    await typeIn(fixture, 'input[name="name"]', '  ');
    await typeIn(fixture, 'input[name="phone"]', '98765 43210');
    await submit(fixture);
    expect((fixture.nativeElement as HTMLElement).querySelector('.alert-error')?.textContent).toContain(
      'Please enter your name.',
    );
    expect(localStorage.getItem('marigold.profile.v1')).toBeNull();
  });

  it('saves a valid profile to the store and confirms with a toast', async () => {
    const fixture = await render();
    await typeIn(fixture, 'input[name="name"]', '  Ananya Sharma  ');
    await typeIn(fixture, 'input[name="phone"]', '98765 43210');
    await typeIn(fixture, 'textarea[name="address"]', ' Flat 402, Lotus Residency ');
    await submit(fixture);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.alert-error')).toBeNull();
    expect(JSON.parse(localStorage.getItem('marigold.profile.v1') ?? '{}')).toEqual({
      name: 'Ananya Sharma',
      phone: '98765 43210',
      address: 'Flat 402, Lotus Residency',
    });
    const toast = TestBed.inject(ToastService);
    expect(toast.toasts().some((t) => t.message === 'Profile saved.')).toBe(true);
  });

  it('reloads saved values on revisit', async () => {
    const first = await render();
    await typeIn(first, 'input[name="name"]', 'Ananya Sharma');
    await typeIn(first, 'input[name="phone"]', '98765 43210');
    await typeIn(first, 'textarea[name="address"]', 'Indiranagar');
    await submit(first);

    const second = await render();
    const el = second.nativeElement as HTMLElement;
    expect((el.querySelector<HTMLInputElement>('input[name="name"]')!).value).toBe('Ananya Sharma');
    expect((el.querySelector<HTMLTextAreaElement>('textarea[name="address"]')!).value).toBe('Indiranagar');
  });

  it('shows the storage warning only when storage is unavailable', async () => {
    const fixture = await render();
    expect((fixture.nativeElement as HTMLElement).querySelector('.alert-warning')).toBeNull();

    vi.stubGlobal('localStorage', {
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
    });
    try {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [ProfileComponent], providers: [provideRouter([])] });
      const blocked = await render();
      expect((blocked.nativeElement as HTMLElement).querySelector('.alert-warning')?.textContent).toContain(
        'Storage is unavailable',
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
