/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  RECENT_ORDERS_CONFIGURATION,
  RecentOrdersConfiguration
} from '../config/recent-orders.config';
import { API_RECENT_ORDERS_URL } from '../config/api.config';
import { OrderService } from './orden.service';
import { UltimasOrdenesService } from './ultimas-ordenes.service';

describe('UltimasOrdenesService', () => {
  let service: UltimasOrdenesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UltimasOrdenesService,
        OrderService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: RECENT_ORDERS_CONFIGURATION,
          useValue: { enableRemoteLatestOrders: true } satisfies RecentOrdersConfiguration
        }
      ]
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('returns local demo orders without calling the API when remote mode is disabled', () => {
    TestBed.overrideProvider(RECENT_ORDERS_CONFIGURATION, {
      useValue: { enableRemoteLatestOrders: false } satisfies RecentOrdersConfiguration
    });
    service = TestBed.inject(UltimasOrdenesService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedOrders = 0;

    service.getRecentOrders().subscribe((orders) => {
      receivedOrders = orders.length;
    });

    expect(receivedOrders).toBe(4);
    httpMock.expectNone(API_RECENT_ORDERS_URL);
  });

  it('parses the API Gateway proxy body format and maps its Spanish fields', () => {
    service = TestBed.inject(UltimasOrdenesService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedOrders: Array<{
      id: number;
      clientName: string;
      equipment: string;
      status: string;
      date: string;
      total: number;
    }> = [];

    service.getRecentOrders().subscribe((orders) => {
      receivedOrders = orders;
    });

    const request = httpMock.expectOne(API_RECENT_ORDERS_URL);
    expect(request.request.method).toBe('GET');
    request.flush({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        totalOrdenes: 4,
        ordenes: [
          {
            idOrden: '#000128',
            cliente: 'Juan Pérez',
            artefacto: 'Lavadora LG',
            fecha: '2026-09-23',
            estado: 'En taller',
            costo: 'S/ 280.00'
          },
          {
            idOrden: '#000127',
            cliente: 'María López',
            artefacto: 'Refrigeradora Samsung',
            fecha: '2026-09-23',
            estado: 'Listo',
            costo: 'S/ 410.00'
          }
        ]
      })
    });

    expect(receivedOrders).toEqual([
      {
        id: 128,
        clientName: 'Juan Pérez',
        equipment: 'Lavadora LG',
        status: 'En taller',
        date: '2026-09-23',
        total: 280
      },
      {
        id: 127,
        clientName: 'María López',
        equipment: 'Refrigeradora Samsung',
        status: 'Listo',
        date: '2026-09-23',
        total: 410
      }
    ]);
  });

  it('accepts a direct data response with normalized field names', () => {
    service = TestBed.inject(UltimasOrdenesService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedId: number | undefined;

    service.getRecentOrders().subscribe((orders) => {
      receivedId = orders[0]?.id;
    });
    httpMock.expectOne(API_RECENT_ORDERS_URL).flush({
      statusCode: 200,
      data: [{
        id: 128,
        clientName: 'Juan Pérez',
        equipment: 'Lavadora LG',
        status: 'En taller',
        date: '2026-09-23',
        total: 280
      }]
    });

    expect(receivedId).toBe(128);
  });

  it('reports malformed remote responses instead of silently using local data', () => {
    service = TestBed.inject(UltimasOrdenesService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedError: unknown;

    service.getRecentOrders().subscribe({
      error: (error: unknown) => {
        receivedError = error;
      }
    });
    httpMock.expectOne(API_RECENT_ORDERS_URL).flush({
      statusCode: 200,
      data: [{ id: '128' }]
    });

    expect(receivedError).toEqual(jasmine.any(Error));
  });
});
