/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ARTIFACT_TYPES_CONFIGURATION, ArtifactTypesConfiguration } from '../config/artifact-types.config';
import { API_ARTIFACT_TYPES_URL } from '../config/api.config';
import { ArtefactoService } from './artefacto.service';

describe('ArtefactoService', () => {
  let service: ArtefactoService | undefined;
  let httpMock: HttpTestingController | undefined;
  const localTypes = [
    { id: 1, nombre: 'Refrigeradora' },
    { id: 2, nombre: 'Lavadora' },
    { id: 3, nombre: 'Televisor' },
    { id: 4, nombre: 'Microondas' },
    { id: 5, nombre: 'Cocina' },
    { id: 6, nombre: 'Computadora' },
    { id: 7, nombre: 'Otro' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArtefactoService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ARTIFACT_TYPES_CONFIGURATION,
          useValue: {
            enableRemoteArtifactTypes: true,
            localArtifactTypes: localTypes
          } satisfies ArtifactTypesConfiguration
        }
      ]
    });
  });

  afterEach(() => {
    httpMock?.verify();
  });

  it('returns the local hardcoded catalog without calling the API when remote mode is disabled', () => {
    TestBed.overrideProvider(ARTIFACT_TYPES_CONFIGURATION, {
      useValue: {
        enableRemoteArtifactTypes: false,
        localArtifactTypes: localTypes
      } satisfies ArtifactTypesConfiguration
    });
    service = TestBed.inject(ArtefactoService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedTypes: Array<{ id: number; nombre: string }> = [];

    service.getArtifactTypes().subscribe((types) => {
      receivedTypes = types;
    });

    expect(receivedTypes).toEqual(localTypes);
    httpMock.expectNone(API_ARTIFACT_TYPES_URL);
  });

  it('loads and maps the artifact types returned by the API', () => {
    service = TestBed.inject(ArtefactoService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedTypes: Array<{ id: number; nombre: string }> = [];

    service.getArtifactTypes().subscribe((types) => {
      receivedTypes = types;
    });

    const request = httpMock.expectOne(API_ARTIFACT_TYPES_URL);
    expect(request.request.method).toBe('GET');
    request.flush({
      statusCode: 200,
      data: [
        { id: 1, nombre: 'Refrigeradora' },
        { id: 8, nombre: 'Laptop' }
      ]
    });

    expect(receivedTypes).toEqual([
      { id: 1, nombre: 'Refrigeradora' },
      { id: 8, nombre: 'Laptop' }
    ]);
  });

  it('reports an invalid API response instead of returning a success-shaped fallback', () => {
    service = TestBed.inject(ArtefactoService);
    httpMock = TestBed.inject(HttpTestingController);
    let receivedError: unknown;

    service.getArtifactTypes().subscribe({
      error: (error: unknown) => {
        receivedError = error;
      }
    });
    httpMock.expectOne(API_ARTIFACT_TYPES_URL).flush({
      statusCode: 200,
      data: [{ id: '1', nombre: 'Refrigeradora' }]
    });

    expect(receivedError).toEqual(jasmine.any(Error));
  });
});
