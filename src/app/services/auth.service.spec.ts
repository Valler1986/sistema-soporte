/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_LOGIN_URL } from '../config/api.config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  it('sends credentials and stores the token on successful login', () => {
    let receivedToken = '';
    service.login({ username: 'operator', password: 'secret' }).subscribe((response) => {
      receivedToken = response.accessToken;
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
});
