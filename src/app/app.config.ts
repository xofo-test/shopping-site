import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import {
  phosphorArrowLeft,
  phosphorBasket,
  phosphorCheck,
  phosphorCreditCard,
  phosphorDeviceMobile,
  phosphorMinus,
  phosphorMoney,
  phosphorPiggyBank,
  phosphorPlus,
  phosphorShoppingCartSimple,
  phosphorTag,
  phosphorTrash,
} from '@ng-icons/phosphor-icons/regular';
import { phosphorStarFill } from '@ng-icons/phosphor-icons/fill';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideIcons({
      phosphorArrowLeft,
      phosphorBasket,
      phosphorCheck,
      phosphorCreditCard,
      phosphorDeviceMobile,
      phosphorMinus,
      phosphorMoney,
      phosphorPiggyBank,
      phosphorPlus,
      phosphorShoppingCartSimple,
      phosphorStarFill,
      phosphorTag,
      phosphorTrash,
    }),
  ],
};
