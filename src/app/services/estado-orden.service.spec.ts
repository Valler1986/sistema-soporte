/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_UPDATE_ORDER_STATUS_URL } from '../config/api.config';
import {
  ORDER_STATUS_CONFIGURATION,
  OrderStatusConfiguration
} from '../config/order-status.config';
import { OrderService } from './orden.service';
import { EstadoOrdenService } from './estado-orden.service';

describe('EstadoOrdenService', () => {
  let service: EstadoOrdenService;
  let orderService: OrderService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EstadoOrdenService,
        OrderService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ORDER_STATUS_CONFIGURATION,
          useValue: { enableRemoteOrderStatusUpdates: true } satisfies OrderStatusConfiguration
        }
      ]
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('sends a PUT request with the order and status IDs in remote mode', () => {
    service = TestBed.inject(EstadoOrdenService);
    httpMock = TestBed.inject(HttpTestingController);

    service.updateStatus(128, 'Listo').subscribe();

    const request = httpMock.expectOne(API_UPDATE_ORDER_STATUS_URL);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      ordenId: 128,
      estadoId: 3,
      notas: 'Se cambió a Listo desde el panel de control'
    });
    request.flush({ statusCode: 200, message: 'Estado actualizado' });
  });

  it('updates the local order without calling API Gateway when remote mode is disabled', () => {
    TestBed.overrideProvider(ORDER_STATUS_CONFIGURATION, {
      useValue: { enableRemoteOrderStatusUpdates: false } satisfies OrderStatusConfiguration
    });
    service = TestBed.inject(EstadoOrdenService);
    orderService = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);

    service.updateStatus(128, 'Listo').subscribe();

    expect(orderService.getAllOrders().find((order) => order.id === 128)?.status).toBe('Listo');
    httpMock.expectNone(API_UPDATE_ORDER_STATUS_URL);
  });

  it('converts an unsuccessful status inside the API Gateway body into an error', () => {
    service = TestBed.inject(EstadoOrdenService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedStatus = 0;

    service.updateStatus(128, 'Listo').subscribe({
      error: (error: { status: number }) => {
        receivedStatus = error.status;
      }
    });
    httpMock.expectOne(API_UPDATE_ORDER_STATUS_URL).flush({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 400, message: 'Estado inválido' })
    });

    expect(receivedStatus).toBe(400);
  });
});
