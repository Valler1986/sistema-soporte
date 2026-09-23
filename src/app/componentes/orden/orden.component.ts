import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/orden.service';

interface OrdenForm {
  nombre: string;
  apellidos: string;
  dni: string;
  tipo: string;
  marca: string;
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
export class OrdenComponent {
  successMessage = '';
  errorMessage = '';

  order: OrdenForm = {
    nombre: '',
    apellidos: '',
    dni: '',
    tipo: '',
    marca: '',
    serie: '',
    anio: '',
    problema: '',
    diagnostico: '',
    fecha: new Date().toISOString().slice(0, 10),
    fechaEntrega: '',
    costo: ''
  };

  constructor(private readonly orderService: OrderService) {}

  guardarOrden(): void {
    const error = this.validarOrden();

    if (error) {
      this.errorMessage = error;
      this.successMessage = '';
      return;
    }

    this.errorMessage = '';
    const nombreCompleto = `${this.order.nombre} ${this.order.apellidos}`.trim();

    const nuevaOrden = this.orderService.addOrder({
      clientName: nombreCompleto || 'Cliente sin nombre',
      equipment: `${this.order.tipo} ${this.order.marca ? `- ${this.order.marca}` : ''}`.trim(),
      date: this.order.fecha || new Date().toISOString().slice(0, 10),
      total: Number(this.order.costo || 0)
    });

    this.successMessage = `Orden #${nuevaOrden.id.toString().padStart(6, '0')} registrada correctamente.`;
    this.resetForm();
  }

  private validarOrden(): string | null {
    if (!this.order.nombre?.trim()) return 'El nombre del cliente es obligatorio.';
    if (!this.order.apellidos?.trim()) return 'Los apellidos del cliente son obligatorios.';
    if (!/^\d{8}$/.test(this.order.dni || '')) return 'El DNI debe tener exactamente 8 dígitos.';
    if (!this.order.tipo) return 'Debes seleccionar el tipo de artefacto.';
    if (!this.order.marca?.trim()) return 'La marca del artefacto es obligatoria.';
    if (!this.order.problema?.trim()) return 'Debes describir el problema del artefacto.';
    if (!this.order.fecha) return 'La fecha de ingreso es obligatoria.';
    if (!this.order.fechaEntrega) return 'La fecha de entrega es obligatoria.';
    if (Number(this.order.costo) <= 0) return 'El costo total debe ser mayor a cero.';

    const fechaIngreso = new Date(this.order.fecha);
    const fechaEntrega = new Date(this.order.fechaEntrega);

    if (fechaEntrega < fechaIngreso) return 'La fecha de entrega no puede ser anterior a la fecha de ingreso.';

    return null;
  }

  private resetForm(): void {
    this.order = {
      nombre: '',
      apellidos: '',
      dni: '',
      tipo: '',
      marca: '',
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
