import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { API_LOGIN_URL } from '../config/api.config';
import { AUTH_CONFIGURATION, AuthConfiguration } from '../config/auth.config';
import { LoginCredentials, LoginResponse } from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'tecfix_access_token';
const LOCAL_SESSION_KEY = 'tecfix_local_session';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseResponseBody(body: unknown): unknown {
  if (typeof body !== 'string') {
    return body;
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
}

function normalizeLoginResponse(response: unknown): LoginResponse {
  let payload = response;

  if (isRecord(response) && typeof response['statusCode'] === 'number' && 'body' in response) {
    payload = parseResponseBody(response['body']);

    if (response['statusCode'] < 200 || response['statusCode'] >= 300) {
      throw new HttpErrorResponse({
        status: response['statusCode'],
        statusText: 'Error en inicio de sesión',
        error: payload
      });
    }
  }

  if (
    !isRecord(payload) ||
    typeof payload['accessToken'] !== 'string' ||
    !isRecord(payload['user']) ||
    typeof payload['user']['id'] !== 'string' ||
    typeof payload['user']['username'] !== 'string' ||
    typeof payload['user']['name'] !== 'string' ||
    typeof payload['user']['role'] !== 'string'
  ) {
    throw new Error('La API respondió, pero el formato de inicio de sesión no es válido.');
  }

  return {
    accessToken: payload['accessToken'],
    tokenType: 'Bearer',
    user: {
      id: payload['user']['id'],
      username: payload['user']['username'],
      name: payload['user']['name'],
      role: payload['user']['role']
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    @Inject(AUTH_CONFIGURATION) private readonly configuration: AuthConfiguration
  ) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    this.clearSession();

    if (!this.configuration.enableRemoteLogin) {
      return this.loginLocally(credentials);
    }

    return this.http.post<unknown>(API_LOGIN_URL, credentials).pipe(
      map(normalizeLoginResponse),
      tap((response) => {
        if (response.accessToken) {
          sessionStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
        }
      }),
      catchError((error: unknown) => {
        if (!(error instanceof HttpErrorResponse) || error.status === 0 || error.status >= 500) {
          const status = error instanceof HttpErrorResponse ? error.status : 'desconocido';
          console.warn(
            `El inicio de sesión remoto falló (estado ${status}). No se usará autenticación local como respaldo.`
          );
        }

        return throwError(() => error);
      })
    );
  }

  getAccessToken(): string | null {
    if (sessionStorage.getItem(LOCAL_SESSION_KEY) === 'true') {
      return null;
    }

    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return sessionStorage.getItem(LOCAL_SESSION_KEY) === 'true' || this.getAccessToken() !== null;
  }

  logout(): void {
    this.clearSession();
  }

  private loginLocally(credentials: LoginCredentials): Observable<LoginResponse> {
    const localLogin = this.configuration.localLogin;
    if (
      !localLogin.username ||
      !localLogin.password ||
      credentials.username !== localLogin.username ||
      credentials.password !== localLogin.password
    ) {
      return throwError(() => new HttpErrorResponse({
        status: 401,
        statusText: 'Usuario o contraseña incorrectos'
      }));
    }

    sessionStorage.setItem(LOCAL_SESSION_KEY, 'true');
    return of({
      accessToken: null,
      tokenType: null,
      user: {
        ...localLogin.user,
        username: localLogin.username
      }
    });
  }

  private clearSession(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(LOCAL_SESSION_KEY);
  }
}
