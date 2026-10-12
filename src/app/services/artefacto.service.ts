import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { ARTIFACT_TYPES_CONFIGURATION, ArtifactTypesConfiguration } from '../config/artifact-types.config';
import { API_ARTIFACT_TYPES_URL } from '../config/api.config';
import { ArtifactType } from '../models/artefacto.model';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseArtifactTypes(response: unknown): ArtifactType[] {
  if (!isRecord(response) || response['statusCode'] !== 200 || !Array.isArray(response['data'])) {
    throw new Error('La respuesta del catálogo de artefactos no tiene el formato esperado.');
  }

  return response['data'].map((item: unknown) => {
    if (
      !isRecord(item) ||
      typeof item['id'] !== 'number' ||
      typeof item['nombre'] !== 'string' ||
      !item['nombre'].trim()
    ) {
      throw new Error('El catálogo contiene un tipo de artefacto inválido.');
    }

    return {
      id: item['id'],
      nombre: item['nombre']
    };
  });
}

@Injectable({
  providedIn: 'root'
})
export class ArtefactoService {
  constructor(
    private readonly http: HttpClient,
    @Inject(ARTIFACT_TYPES_CONFIGURATION)
    private readonly configuration: ArtifactTypesConfiguration
  ) {}

  getArtifactTypes(): Observable<ArtifactType[]> {
    if (!this.configuration.enableRemoteArtifactTypes) {
      return of(this.configuration.localArtifactTypes.map((artifactType) => ({ ...artifactType })));
    }

    return this.http.get<unknown>(API_ARTIFACT_TYPES_URL).pipe(
      map(parseArtifactTypes)
    );
  }
}
