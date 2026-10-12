import { InjectionToken } from '@angular/core';

export interface OrderRegistrationConfiguration {
  enableRemoteOrderRegistration: boolean;
}

export const ORDER_REGISTRATION_CONFIGURATION =
  new InjectionToken<OrderRegistrationConfiguration>('ORDER_REGISTRATION_CONFIGURATION');
