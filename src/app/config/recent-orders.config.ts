import { InjectionToken } from '@angular/core';

export interface RecentOrdersConfiguration {
  enableRemoteLatestOrders: boolean;
}

export const RECENT_ORDERS_CONFIGURATION =
  new InjectionToken<RecentOrdersConfiguration>('RECENT_ORDERS_CONFIGURATION');
