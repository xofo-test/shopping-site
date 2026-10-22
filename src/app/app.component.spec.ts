import { TestBed } from '@angular/core/testing';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [...appConfig.providers],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the Marigold brand and header nav', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.brand')?.textContent).toContain('Marigold');
    const nav = el.querySelector('.site-nav')?.textContent ?? '';
    expect(nav).toContain('Shop');
    expect(nav).toContain('Cart');
    expect(nav).toContain('Checkout');
  });
});
