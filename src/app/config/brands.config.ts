import { InjectionToken } from '@angular/core';
import { Brand } from '../models/marca.model';

export interface BrandsConfiguration {
  enableRemoteBrands: boolean;
  localBrands: Brand[];
}

export const BRANDS_CONFIGURATION =
  new InjectionToken<BrandsConfiguration>('BRANDS_CONFIGURATION');
