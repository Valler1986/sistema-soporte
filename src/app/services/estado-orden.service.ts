import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { API_UPDATE_ORDER_STATUS_URL } from '../config/api.config';
import {
  ORDER_STATUS_CONFIGURATION,
  OrderStatusConfiguration
} from '../config/order-status.config';
import { OrderStatus } from '../models/orden.model';
import { OrderService } from './orden.service';

const ORDER_STATUS_IDS: Record<OrderStatus, number> = {
  Registrado: 1,
  'En taller': 2,
  Listo: 3,
  Entregado: 4
};

export interface UpdateOrderStatusRequest {
  ordenId: number;
  estadoId: number;
  notas: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseBody(body: unknown): unknown {
  if (typeof body !== 'string') {
    return body;
  }

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
}

function assertSuccessfulResponse(response: unknown): void {
  if (!isRecord(response) || typeof response['statusCode'] !== 'number') {
    return;
  }

  const payload = parseBody(response['body']);
  const applicationStatus = isRecord(payload) ? payload['statusCode'] : undefined;
  const statusCode = typeof applicationStatus === 'number'
    ? applicationStatus
    : response['statusCode'];

  if (statusCode < 200 || statusCode >= 300) {
    throw new HttpErrorResponse({
      status: statusCode,
      statusText: 'No fue posible actualizar el estado de la orden',
      error: payload
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class EstadoOrdenService {
  constructor(
    private readonly http: HttpClient,
    private readonly orderService: OrderService,
    @Inject(ORDER_STATUS_CONFIGURATION)
    private readonly configuration: OrderStatusConfiguration
  ) {}

  updateStatus(orderId: number, status: OrderStatus): Observable<void> {
    if (!this.configuration.enableRemoteOrderStatusUpdates) {
      this.orderService.updateOrderStatus(orderId, status);
      return of(undefined);
    }

    const request: UpdateOrderStatusRequest = {
      ordenId: orderId,
      estadoId: ORDER_STATUS_IDS[status],
      notas: `Se cambió a ${status} desde el panel de control`
    };

    return this.http.put<unknown>(API_UPDATE_ORDER_STATUS_URL, request).pipe(
      map((response) => {
        assertSuccessfulResponse(response);
        return undefined;
      })
    );
  }
}
