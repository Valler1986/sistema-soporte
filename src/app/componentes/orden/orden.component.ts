import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ArtefactoService } from '../../services/artefacto.service';
import { ArtifactType } from '../../models/artefacto.model';
import { Brand } from '../../models/marca.model';
import { CreateOrderRequest, OrderRegistrationResult } from '../../models/orden-request.model';
import { MarcaService } from '../../services/marca.service';
import { RegistroOrdenService } from '../../services/registro-orden.service';

interface OrdenForm {
  nombre: string;
  apellidos: string;
  dni: string;
  tipoId: number | null;
  marcaId: number | null;
  serie: string;
  anio: string;
  problema: string;
  diagnostico: string;
  fecha: string;
  fechaEntrega: string;
  costo: number | string;
}

@Component({
  selector: 'app-orden',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orden.component.html',
  styleUrl: './orden.component.css'
})
export class OrdenComponent implements OnInit {
  successMessage = '';
  errorMessage = '';
  isSaving = false;
  artifactTypes: ArtifactType[] = [];
  isLoadingArtifactTypes = false;
  artifactTypesError = '';
  brands: Brand[] = [];
  isLoadingBrands = false;
  brandsError = '';

  order: OrdenForm = {
    nombre: '',
    apellidos: '',
    dni: '',
    tipoId: null,
    marcaId: null,
    serie: '',
    anio: '',
    problema: '',
    diagnostico: '',
    fecha: new Date().toISOString().slice(0, 10),
    fechaEntrega: '',
    costo: ''
  };

  constructor(
    private readonly artefactoService: ArtefactoService,
    private readonly marcaService: MarcaService,
    private readonly registroOrdenService: RegistroOrdenService
  ) {}

  ngOnInit(): void {
    this.isLoadingArtifactTypes = true;
    this.artifactTypesError = '';

    this.artefactoService.getArtifactTypes().subscribe({
      next: (artifactTypes) => {
        this.artifactTypes = artifactTypes;
        this.isLoadingArtifactTypes = false;
      },
      error: (error: unknown) => {
        console.error('No fue posible cargar los tipos de artefacto.', error);
        this.artifactTypesError = 'No fue posible cargar los tipos de artefacto. Verifique la conexión e inténtelo nuevamente.';
        this.isLoadingArtifactTypes = false;
      }
    });

    this.isLoadingBrands = true;
    this.brandsError = '';

    this.marcaService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
        this.isLoadingBrands = false;
      },
      error: (error: unknown) => {
        console.error('No fue posible cargar las marcas.', error);
        this.brandsError = 'No fue posible cargar las marcas. Verifique la conexión e inténtelo nuevamente.';
        this.isLoadingBrands = false;
      }
    });
  }

  guardarOrden(): void {
    if (this.isSaving) {
      return;
    }

    const error = this.validarOrden();

    if (error) {
      this.errorMessage = error;
      this.successMessage = '';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const artifactType = this.artifactTypes.find((item) => item.id === this.order.tipoId);
    const brand = this.brands.find((item) => item.id === this.order.marcaId);
    if (!artifactType || !brand) {
      this.errorMessage = 'Seleccione un tipo de artefacto y una marca válidos.';
      return;
    }

    const request: CreateOrderRequest = {
      nombre: this.order.nombre.trim(),
      apellidos: this.order.apellidos.trim(),
      dni: this.order.dni,
      tipoId: artifactType.id,
      marcaId: brand.id,
      nombreEquipo: `${artifactType.nombre} ${brand.nombre}`,
      nSerie: this.order.serie.trim() || null,
      anhoFabricacion: this.order.anio === '' ? null : Number(this.order.anio),
      descripcionProblema: this.order.problema.trim(),
      diagnostico: this.order.diagnostico.trim() || null,
      fecha: this.order.fecha,
      fechaEntrega: this.order.fechaEntrega,
      costoTotal: Number(this.order.costo)
    };

    this.isSaving = true;
    this.registroOrdenService.registerOrder(request, request).subscribe({
      next: (result: OrderRegistrationResult) => {
        this.isSaving = false;
        this.successMessage = result.mode === 'local' && result.localOrderId !== undefined
          ? `Orden #${result.localOrderId.toString().padStart(6, '0')} registrada localmente.`
          : 'Orden registrada correctamente en el servidor.';
        this.resetForm();
      },
      error: (requestError: unknown) => {
        console.error('No fue posible registrar la orden.', requestError);
        this.errorMessage = this.getRegistrationErrorMessage(requestError);
        this.isSaving = false;
      }
    });
  }

  private validarOrden(): string | null {
    if (!this.order.nombre?.trim()) return 'El nombre del cliente es obligatorio.';
    if (!this.order.apellidos?.trim()) return 'Los apellidos del cliente son obligatorios.';
    if (!/^\d{8}$/.test(this.order.dni || '')) return 'El DNI debe tener exactamente 8 dígitos.';
    if (this.order.tipoId === null) return 'Debes seleccionar el tipo de artefacto.';
    if (this.order.marcaId === null) return 'Debes seleccionar la marca del artefacto.';
    if (!this.order.problema?.trim()) return 'Debes describir el problema del artefacto.';
    if (!this.order.fecha) return 'La fecha de ingreso es obligatoria.';
    if (!this.order.fechaEntrega) return 'La fecha de entrega es obligatoria.';
    if (!Number.isFinite(Number(this.order.costo)) || Number(this.order.costo) <= 0) return 'El costo total debe ser mayor a cero.';
    if (
      this.order.anio !== '' &&
      (!Number.isInteger(Number(this.order.anio)) || Number(this.order.anio) < 1800 || Number(this.order.anio) > 2200)
    ) {
      return 'El año de fabricación debe ser un número entre 1800 y 2200.';
    }

    const fechaIngreso = new Date(this.order.fecha);
    const fechaEntrega = new Date(this.order.fechaEntrega);

    if (fechaEntrega < fechaIngreso) return 'La fecha de entrega no puede ser anterior a la fecha de ingreso.';

    return null;
  }

  private getRegistrationErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el servicio de órdenes. Verifique la conexión y la configuración CORS.';
      }
      if (error.status === 400) {
        return 'La API rechazó los datos de la orden. Revise los campos ingresados.';
      }
      if (error.status === 401 || error.status === 403) {
        return 'No tiene autorización para registrar órdenes. Inicie sesión nuevamente.';
      }
      if (error.status >= 500) {
        return 'El servidor no pudo registrar la orden. Inténtelo nuevamente más tarde.';
      }
    }

    return 'No fue posible registrar la orden. Inténtelo nuevamente.';
  }

  private resetForm(): void {
    this.order = {
      nombre: '',
      apellidos: '',
      dni: '',
      tipoId: null,
      marcaId: null,
      serie: '',
      anio: '',
      problema: '',
      diagnostico: '',
      fecha: new Date().toISOString().slice(0, 10),
      fechaEntrega: '',
      costo: ''
    };
  }
}
