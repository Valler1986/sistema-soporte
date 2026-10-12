import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { API_BRANDS_URL } from '../config/api.config';
import { BRANDS_CONFIGURATION, BrandsConfiguration } from '../config/brands.config';
import { Brand } from '../models/marca.model';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseBrands(response: unknown): Brand[] {
  if (!isRecord(response) || response['statusCode'] !== 200 || !Array.isArray(response['data'])) {
    throw new Error('La respuesta del catálogo de marcas no tiene el formato esperado.');
  }

  return response['data'].map((item: unknown) => {
    if (
      !isRecord(item) ||
      typeof item['id'] !== 'number' ||
      typeof item['nombre'] !== 'string' ||
      !item['nombre'].trim()
    ) {
      throw new Error('El catálogo contiene una marca inválida.');
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
export class MarcaService {
  constructor(
    private readonly http: HttpClient,
    @Inject(BRANDS_CONFIGURATION)
    private readonly configuration: BrandsConfiguration
  ) {}

  getBrands(): Observable<Brand[]> {
    if (!this.configuration.enableRemoteBrands) {
      return of(this.configuration.localBrands.map((brand) => ({ ...brand })));
    }

    return this.http.get<unknown>(API_BRANDS_URL).pipe(
      map(parseBrands)
    );
  }
}
