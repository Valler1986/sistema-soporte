import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { AUTH_CONFIGURATION } from './config/auth.config';
import { ARTIFACT_TYPES_CONFIGURATION } from './config/artifact-types.config';
import { BRANDS_CONFIGURATION } from './config/brands.config';
import { ORDER_REGISTRATION_CONFIGURATION } from './config/order-registration.config';
import { ORDER_STATUS_CONFIGURATION } from './config/order-status.config';
import { RECENT_ORDERS_CONFIGURATION } from './config/recent-orders.config';
import { authInterceptor } from './interceptors/auth.interceptor';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: AUTH_CONFIGURATION, useValue: environment },
    { provide: ARTIFACT_TYPES_CONFIGURATION, useValue: environment },
    { provide: BRANDS_CONFIGURATION, useValue: environment },
    { provide: ORDER_REGISTRATION_CONFIGURATION, useValue: environment },
    { provide: ORDER_STATUS_CONFIGURATION, useValue: environment },
    { provide: RECENT_ORDERS_CONFIGURATION, useValue: environment }
  ]
};
