/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_CREATE_ORDER_URL } from '../config/api.config';
import {
  ORDER_REGISTRATION_CONFIGURATION,
  OrderRegistrationConfiguration
} from '../config/order-registration.config';
import { CreateOrderRequest } from '../models/orden-request.model';
import { OrderService } from './orden.service';
import { RegistroOrdenService } from './registro-orden.service';

describe('RegistroOrdenService', () => {
  let service: RegistroOrdenService;
  let httpMock: HttpTestingController;

  const request: CreateOrderRequest = {
    nombre: 'Guillermo',
    apellidos: 'Valle',
    dni: '43537422',
    tipoId: 2,
    marcaId: 1,
    nombreEquipo: 'Lavadora LG',
    nSerie: 'SN-987654321',
    anhoFabricacion: 2024,
    descripcionProblema: 'No centrifuga ni desagua correctamente',
    diagnostico: 'Bomba de drenaje obstruida',
    fecha: '2026-10-12',
    fechaEntrega: '2026-10-15',
    costoTotal: 280
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RegistroOrdenService,
        OrderService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ORDER_REGISTRATION_CONFIGURATION,
          useValue: { enableRemoteOrderRegistration: true } satisfies OrderRegistrationConfiguration
        }
      ]
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts the request body to the remote order endpoint', () => {
    service = TestBed.inject(RegistroOrdenService);
    httpMock = TestBed.inject(HttpTestingController);
    let mode = '';

    service.registerOrder(request, request).subscribe((result) => {
      mode = result.mode;
    });

    const httpRequest = httpMock.expectOne(API_CREATE_ORDER_URL);
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.body).toEqual(request);
    httpRequest.flush({ statusCode: 201, message: 'Orden creada' });

    expect(mode).toBe('remote');
  });

  it('stores the order locally without calling the API when remote mode is disabled', () => {
    TestBed.overrideProvider(ORDER_REGISTRATION_CONFIGURATION, {
      useValue: { enableRemoteOrderRegistration: false } satisfies OrderRegistrationConfiguration
    });
    service = TestBed.inject(RegistroOrdenService);
    httpMock = TestBed.inject(HttpTestingController);
    let localId: number | undefined;

    service.registerOrder(request, request).subscribe((result) => {
      localId = result.localOrderId;
    });

    expect(localId).toBe(129);
    expect(TestBed.inject(OrderService).getAllOrders()[0].equipment).toBe('Lavadora LG');
    httpMock.expectNone(API_CREATE_ORDER_URL);
  });

  it('turns a failed status in an API Gateway envelope into an error', () => {
    service = TestBed.inject(RegistroOrdenService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedError: unknown;

    service.registerOrder(request, request).subscribe({
      error: (error: unknown) => {
        receivedError = error;
      }
    });
    httpMock.expectOne(API_CREATE_ORDER_URL).flush({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 400, message: 'DNI inválido' })
    });

    expect(receivedError).toEqual(jasmine.any(HttpErrorResponse));
    expect((receivedError as HttpErrorResponse).status).toBe(400);
  });
});
