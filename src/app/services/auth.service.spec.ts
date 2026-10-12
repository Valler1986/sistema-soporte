/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AUTH_CONFIGURATION, AuthConfiguration } from '../config/auth.config';
import { API_LOGIN_URL } from '../config/api.config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let httpMock: HttpTestingController;
  const remoteConfiguration: AuthConfiguration = {
    enableRemoteLogin: true,
    localLogin: {
      username: 'dev',
      password: 'dev-password',
      user: { id: 'local-dev', name: 'Usuario local', role: 'admin' }
    }
  };

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AUTH_CONFIGURATION, useValue: remoteConfiguration }
      ]
    });
  });

  afterEach(() => {
    httpMock?.verify();
    sessionStorage.clear();
  });

  it('sends credentials and stores the token on successful login', () => {
    const service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedToken = '';
    service.login({ username: 'operator', password: 'secret' }).subscribe((response) => {
      receivedToken = response.accessToken ?? '';
    });

    const request = httpMock.expectOne(API_LOGIN_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ username: 'operator', password: 'secret' });
    request.flush({
      statusCode: 200,
      body: JSON.stringify({
        accessToken: 'test-token',
        user: {
          id: '1',
          username: 'operator',
          name: 'Operador',
          role: 'admin'
        }
      })
    });

    expect(receivedToken).toBe('test-token');
    expect(sessionStorage.getItem('tecfix_access_token')).toBe('test-token');
  });

  it('turns the API 200 error envelope into an HTTP 401 error', () => {
    const service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedError: unknown;
    service.login({ username: 'invalid', password: 'invalid' }).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      }
    });

    httpMock.expectOne(API_LOGIN_URL).flush({
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Credenciales inválidas' })
    });

    expect(receivedError).toEqual(jasmine.any(HttpErrorResponse));
    expect((receivedError as HttpErrorResponse).status).toBe(401);
  });

  it('keeps remote mode fail-closed when the API is unavailable', () => {
    const service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    const warning = spyOn(console, 'warn');
    let receivedError: unknown;

    service.login({ username: 'dev', password: 'dev-password' }).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      }
    });
    httpMock.expectOne(API_LOGIN_URL).flush('Unavailable', {
      status: 503,
      statusText: 'Service Unavailable'
    });

    expect(receivedError).toEqual(jasmine.any(HttpErrorResponse));
    expect(service.isAuthenticated()).toBeFalse();
    expect(warning).toHaveBeenCalled();
    httpMock.expectNone(API_LOGIN_URL);
  });

  it('authenticates with configured credentials and does not create a bearer token in local mode', () => {
    TestBed.overrideProvider(AUTH_CONFIGURATION, {
      useValue: {
        ...remoteConfiguration,
        enableRemoteLogin: false
      } satisfies AuthConfiguration
    });
    const service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedUsername = '';

    service.login({ username: 'dev', password: 'dev-password' }).subscribe((response) => {
      receivedUsername = response.user.username;
    });

    expect(receivedUsername).toBe('dev');
    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getAccessToken()).toBeNull();
    expect(sessionStorage.getItem('tecfix_access_token')).toBeNull();
    httpMock.expectNone(API_LOGIN_URL);
  });

  it('rejects invalid local credentials without requesting the remote API', () => {
    TestBed.overrideProvider(AUTH_CONFIGURATION, {
      useValue: {
        ...remoteConfiguration,
        enableRemoteLogin: false
      } satisfies AuthConfiguration
    });
    const service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedError: unknown;

    service.login({ username: 'dev', password: 'wrong' }).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      }
    });

    expect(receivedError).toEqual(jasmine.any(HttpErrorResponse));
    expect((receivedError as HttpErrorResponse).status).toBe(401);
    expect(service.isAuthenticated()).toBeFalse();
    httpMock.expectNone(API_LOGIN_URL);
  });
});
