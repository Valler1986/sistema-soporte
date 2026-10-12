import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { API_RECENT_ORDERS_URL } from '../config/api.config';
import {
  RECENT_ORDERS_CONFIGURATION,
  RecentOrdersConfiguration
} from '../config/recent-orders.config';
import { Order, OrderStatus } from '../models/orden.model';
import { OrderService } from './orden.service';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' &&
    ['Registrado', 'En taller', 'Listo', 'Entregado'].includes(value);
}

function parseJson(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    throw new Error('El servidor devolvió un body que no contiene JSON válido.');
  }
}

function parseOrderId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/^#/, ''));
    return Number.isInteger(parsed) ? parsed : null;
  }

  return null;
}

function parseOrderTotal(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function parseRecentOrders(response: unknown): Order[] {
  if (!isRecord(response) || typeof response['statusCode'] !== 'number') {
    throw new Error('La respuesta de últimas órdenes no tiene el formato esperado.');
  }

  const payload = parseJson(response['body'] ?? response);
  if (response['statusCode'] < 200 || response['statusCode'] >= 300) {
    throw new Error('El servidor no pudo consultar las últimas órdenes.');
  }

  if (!isRecord(payload)) {
    throw new Error('La respuesta de últimas órdenes no tiene el formato esperado.');
  }

  const orders = payload['ordenes'] ?? payload['data'];
  if (!Array.isArray(orders)) {
    throw new Error('La respuesta de últimas órdenes no contiene una lista.');
  }

  return orders.map((item: unknown) => {
    if (!isRecord(item)) {
      throw new Error('La respuesta contiene una orden reciente inválida.');
    }

    const id = parseOrderId(item['id'] ?? item['idOrden']);
    const clientName = item['clientName'] ?? item['cliente'];
    const equipment = item['equipment'] ?? item['artefacto'];
    const status = item['status'] ?? item['estado'];
    const date = item['date'] ?? item['fecha'];
    const total = parseOrderTotal(item['total'] ?? item['costo']);

    if (
      id === null ||
      typeof clientName !== 'string' ||
      typeof equipment !== 'string' ||
      !isOrderStatus(status) ||
      typeof date !== 'string' ||
      total === null
    ) {
      throw new Error('La respuesta contiene una orden reciente inválida.');
    }

    return {
      id,
      clientName,
      equipment,
      status,
      date,
      total
    };
  });
}

@Injectable({
  providedIn: 'root'
})
export class UltimasOrdenesService {
  constructor(
    private readonly http: HttpClient,
    private readonly orderService: OrderService,
    @Inject(RECENT_ORDERS_CONFIGURATION)
    private readonly configuration: RecentOrdersConfiguration
  ) {}

  getRecentOrders(): Observable<Order[]> {
    if (!this.configuration.enableRemoteLatestOrders) {
      return of(this.orderService.getAllOrders().slice(0, 4));
    }

    return this.http.get<unknown>(API_RECENT_ORDERS_URL).pipe(
      map(parseRecentOrders)
    );
  }
}
