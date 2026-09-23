import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Order, OrderStatus } from '../../models/orden.model';
import { OrderService } from '../../services/orden.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  searchTerm = '';
  statusFilter: 'Todos' | OrderStatus = 'Todos';
  statusOptions: Array<'Todos' | OrderStatus> = ['Todos', 'Registrado', 'En taller', 'Listo', 'Entregado'];

  constructor(private readonly orderService: OrderService) {
    this.orderService.orders$.subscribe(() => {
      // El reporte se refresca desde la misma fuente de verdad.
    });
  }

  ngOnInit(): void {
    this.resetFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'Todos';
  }

  getInProgressOrders(): Order[] {
    return this.orderService.getInProgressOrders();
  }

  getIncomeOrders(): Order[] {
    return this.orderService.getIncomeByOrders();
  }

  getDeliveredOrdersCount(): number {
    return this.orderService.getDeliveredOrders().length;
  }

  getFilteredHistorical(): Order[] {
    return this.orderService.getHistoricalOrders(this.searchTerm, this.statusFilter);
  }

  get totalIncome(): number {
    return this.getIncomeOrders().reduce((sum, order) => sum + order.total, 0);
  }

  get allOrdersCount(): number {
    return this.orderService.getAllOrders().length;
  }

  getStatusClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      Registrado: 'pending',
      'En taller': 'in-repair',
      Listo: 'ready',
      Entregado: 'delivered'
    };

    return map[status] ?? 'pending';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value);
  }
}
