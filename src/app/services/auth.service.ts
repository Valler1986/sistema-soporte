import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { API_LOGIN_URL } from '../config/api.config';
import { LoginCredentials, LoginResponse } from '../models/auth.model';

const ACCESS_TOKEN_KEY = 'tecfix_access_token';

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
  constructor(private readonly http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<unknown>(API_LOGIN_URL, credentials).pipe(
      map(normalizeLoginResponse),
      tap((response) => {
        sessionStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
      })
    );
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null;
  }

  logout(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}
