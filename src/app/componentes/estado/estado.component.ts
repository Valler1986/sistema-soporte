import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderStatus } from '../../models/orden.model';
import { OrderService } from '../../services/orden.service';
import { UltimasOrdenesService } from '../../services/ultimas-ordenes.service';
import { EstadoOrdenService } from '../../services/estado-orden.service';
import { HttpErrorResponse } from '@angular/common/http';

type EstadoOrden = OrderStatus;

interface OrdenEstado {
  id: number;
  numero: string;
  cliente: string;
  equipo: string;
  estado: EstadoOrden;
  estadoSeleccionado: EstadoOrden;
  fecha: string;
  actualizando: boolean;
}

@Component({
  selector: 'app-estado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estado.component.html',
  styleUrl: './estado.component.css'
})
export class EstadoComponent implements OnInit {
  readonly opcionesEstado: EstadoOrden[] = ['Registrado', 'En taller', 'Listo', 'Entregado'];

  ordenes: OrdenEstado[] = [];
  actualizadoEn = 'Hoy';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly orderService: OrderService,
    private readonly recentOrdersService: UltimasOrdenesService,
    private readonly estadoOrdenService: EstadoOrdenService
  ) {}

  ngOnInit(): void {
    this.consultarEstados();
  }

  get pendientes(): number {
    return this.ordenes.filter((orden) => orden.estado === 'Registrado').length;
  }

  get enReparacion(): number {
    return this.ordenes.filter((orden) => orden.estado === 'En taller').length;
  }

  get listas(): number {
    return this.ordenes.filter((orden) => orden.estado === 'Listo').length;
  }

  get entregadas(): number {
    return this.ordenes.filter((orden) => orden.estado === 'Entregado').length;
  }

  cambiarEstado(orderId: number, nuevoEstado: EstadoOrden): void {
    const orden = this.ordenes.find((item) => item.id === orderId);
    if (orden) {
      orden.estadoSeleccionado = nuevoEstado;
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  actualizarEstado(orden: OrdenEstado): void {
    if (orden.actualizando || orden.estadoSeleccionado === orden.estado) {
      return;
    }

    orden.actualizando = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.estadoOrdenService.updateStatus(orden.id, orden.estadoSeleccionado).subscribe({
      next: () => {
        orden.estado = orden.estadoSeleccionado;
        orden.actualizando = false;
        this.orderService.updateOrderStatus(orden.id, orden.estado);
        this.successMessage = `Estado de la orden ${orden.numero} actualizado.`;
        this.actualizadoEn = this.getCurrentTimestamp();
      },
      error: (error: unknown) => {
        console.error(`No fue posible actualizar el estado de la orden ${orden.numero}.`, error);
        orden.actualizando = false;
        this.errorMessage = this.getUpdateErrorMessage(error);
      }
    });
  }

  consultarEstados(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.recentOrdersService.getRecentOrders().subscribe({
      next: (orders) => {
        this.ordenes = orders.map((order) => ({
          id: order.id,
          numero: `#${String(order.id).padStart(6, '0')}`,
          cliente: order.clientName,
          equipo: order.equipment,
          estado: order.status,
          estadoSeleccionado: order.status,
          fecha: order.date,
          actualizando: false
        }));
        this.isLoading = false;
        this.actualizadoEn = this.getCurrentTimestamp();
      },
      error: (error: unknown) => {
        console.error('No fue posible consultar las órdenes.', error);
        this.errorMessage = 'No fue posible consultar las órdenes. Verifique la conexión e inténtelo nuevamente.';
        this.isLoading = false;
      }
    });
  }

  private getCurrentTimestamp(): string {
    return new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getUpdateErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el servicio para actualizar el estado.';
      }
      if (error.status === 400) {
        return 'La API rechazó el estado seleccionado para esta orden.';
      }
      if (error.status === 401 || error.status === 403) {
        return 'No tiene autorización para actualizar órdenes.';
      }
      if (error.status >= 500) {
        return 'El servidor no pudo actualizar el estado. Inténtelo más tarde.';
      }
    }

    return 'No fue posible actualizar el estado de la orden.';
  }
}
