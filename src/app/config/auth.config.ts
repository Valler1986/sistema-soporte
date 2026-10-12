import { InjectionToken } from '@angular/core';
import { AuthenticatedUser } from '../models/auth.model';

export interface AuthConfiguration {
  enableRemoteLogin: boolean;
  localLogin: {
    username: string;
    password: string;
    user: Omit<AuthenticatedUser, 'username'>;
  };
}

export const AUTH_CONFIGURATION = new InjectionToken<AuthConfiguration>('AUTH_CONFIGURATION');
