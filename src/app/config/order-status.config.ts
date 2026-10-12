import { InjectionToken } from '@angular/core';

export interface OrderStatusConfiguration {
  enableRemoteOrderStatusUpdates: boolean;
}

export const ORDER_STATUS_CONFIGURATION =
  new InjectionToken<OrderStatusConfiguration>('ORDER_STATUS_CONFIGURATION');
