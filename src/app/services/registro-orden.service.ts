import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { API_CREATE_ORDER_URL } from '../config/api.config';
import {
  ORDER_REGISTRATION_CONFIGURATION,
  OrderRegistrationConfiguration
} from '../config/order-registration.config';
import { CreateOrderRequest, OrderRegistrationResult } from '../models/orden-request.model';
import { OrderService } from './orden.service';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJson(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function assertSuccessfulResponse(response: unknown): unknown {
  if (!isRecord(response) || typeof response['statusCode'] !== 'number') {
    return response;
  }

  const payload = parseJson(response['body']);
  if (response['statusCode'] < 200 || response['statusCode'] >= 300) {
    throw new HttpErrorResponse({
      status: response['statusCode'],
      statusText: 'No fue posible registrar la orden',
      error: payload
    });
  }

  if (isRecord(payload) && typeof payload['statusCode'] === 'number') {
    if (payload['statusCode'] < 200 || payload['statusCode'] >= 300) {
      throw new HttpErrorResponse({
        status: payload['statusCode'],
        statusText: 'No fue posible registrar la orden',
        error: payload
      });
    }
  }

  return response;
}

@Injectable({
  providedIn: 'root'
})
export class RegistroOrdenService {
  constructor(
    private readonly http: HttpClient,
    private readonly orderService: OrderService,
    @Inject(ORDER_REGISTRATION_CONFIGURATION)
    private readonly configuration: OrderRegistrationConfiguration
  ) {}

  registerOrder(
    request: CreateOrderRequest,
    localOrder: Pick<CreateOrderRequest, 'nombre' | 'apellidos' | 'nombreEquipo' | 'fecha' | 'costoTotal'>
  ): Observable<OrderRegistrationResult> {
    if (!this.configuration.enableRemoteOrderRegistration) {
      const order = this.orderService.addOrder({
        clientName: `${localOrder.nombre} ${localOrder.apellidos}`.trim(),
        equipment: localOrder.nombreEquipo,
        date: localOrder.fecha,
        total: localOrder.costoTotal
      });

      return of({ mode: 'local', localOrderId: order.id });
    }

    return this.http.post<unknown>(API_CREATE_ORDER_URL, request).pipe(
      map((response) => {
        assertSuccessfulResponse(response);
        return { mode: 'remote' as const };
      })
    );
  }
}
