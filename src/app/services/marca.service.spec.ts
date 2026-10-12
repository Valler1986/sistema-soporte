/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { API_BRANDS_URL } from '../config/api.config';
import { BRANDS_CONFIGURATION, BrandsConfiguration } from '../config/brands.config';
import { MarcaService } from './marca.service';

describe('MarcaService', () => {
  let service: MarcaService;
  let httpMock: HttpTestingController;
  const localBrands = [
    { id: 1, nombre: 'LG' },
    { id: 2, nombre: 'Samsung' },
    { id: 3, nombre: 'Sony' },
    { id: 4, nombre: 'Lenovo' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MarcaService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: BRANDS_CONFIGURATION,
          useValue: {
            enableRemoteBrands: true,
            localBrands
          } satisfies BrandsConfiguration
        }
      ]
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads and validates brand data from the remote API', () => {
    service = TestBed.inject(MarcaService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedBrands: Array<{ id: number; nombre: string }> = [];

    service.getBrands().subscribe((brands) => {
      receivedBrands = brands;
    });

    const request = httpMock.expectOne(API_BRANDS_URL);
    expect(request.request.method).toBe('GET');
    request.flush({
      statusCode: 200,
      data: localBrands
    });

    expect(receivedBrands).toEqual(localBrands);
  });

  it('uses local brands without calling the API when remote mode is disabled', () => {
    TestBed.overrideProvider(BRANDS_CONFIGURATION, {
      useValue: {
        enableRemoteBrands: false,
        localBrands
      } satisfies BrandsConfiguration
    });
    service = TestBed.inject(MarcaService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedBrands: Array<{ id: number; nombre: string }> = [];

    service.getBrands().subscribe((brands) => {
      receivedBrands = brands;
    });

    expect(receivedBrands).toEqual(localBrands);
    httpMock.expectNone(API_BRANDS_URL);
  });

  it('reports invalid remote catalog responses', () => {
    service = TestBed.inject(MarcaService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedError: unknown;

    service.getBrands().subscribe({
      error: (error: unknown) => {
        receivedError = error;
      }
    });
    httpMock.expectOne(API_BRANDS_URL).flush({
      statusCode: 200,
      data: [{ id: '1', nombre: 'LG' }]
    });

    expect(receivedError).toEqual(jasmine.any(Error));
  });
});
