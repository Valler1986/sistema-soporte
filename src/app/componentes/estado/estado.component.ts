import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrderStatus } from '../../models/orden.model';
import { OrderService } from '../../services/orden.service';

type EstadoOrden = 'Registrado' | 'En taller' | 'Listo' | 'Entregado';

interface OrdenEstado {
  numero: string;
  cliente: string;
  equipo: string;
  estado: EstadoOrden;
  fecha: string;
}

@Component({
  selector: 'app-estado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estado.component.html',
  styleUrl: './estado.component.css'
})
export class EstadoComponent {
  readonly opcionesEstado: EstadoOrden[] = ['Registrado', 'En taller', 'Listo', 'Entregado'];

  ordenes: OrdenEstado[] = [];
  actualizadoEn = 'Hoy';

  constructor(private readonly orderService: OrderService) {
    this.syncOrders();
    this.orderService.orders$.subscribe(() => this.syncOrders());
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

  cambiarEstado(numero: string, nuevoEstado: EstadoOrden): void {
    const orden = this.ordenes.find((item) => item.numero === numero);

    if (orden) {
      orden.estado = nuevoEstado;
    }

    const orderId = Number(numero.replace('#', ''));
    this.orderService.updateOrderStatus(orderId, nuevoEstado as OrderStatus);
  }

  actualizarEstados(): void {
    this.syncOrders();
    this.actualizadoEn = new Date().toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private syncOrders(): void {
    this.ordenes = this.orderService.getAllOrders().map((order) => ({
      numero: `#${String(order.id).padStart(6, '0')}`,
      cliente: order.clientName,
      equipo: order.equipment,
      estado: order.status as EstadoOrden,
      fecha: order.date
    }));
  }
}
