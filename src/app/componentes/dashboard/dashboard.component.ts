import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Order, OrderStatus } from '../../models/orden.model';
import { OrderService } from '../../services/orden.service';
import { UltimasOrdenesService } from '../../services/ultimas-ordenes.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  readonly systemName = 'TecFix S.A.';
  lastOrders: Order[] = [];
  isLoadingLastOrders = false;
  lastOrdersError = '';

  constructor(
    private readonly orderService: OrderService,
    private readonly router: Router,
    private readonly recentOrdersService: UltimasOrdenesService
  ) {}

  ngOnInit(): void {
    this.isLoadingLastOrders = true;
    this.lastOrdersError = '';

    this.recentOrdersService.getRecentOrders().subscribe({
      next: (orders) => {
        this.lastOrders = orders;
        this.isLoadingLastOrders = false;
      },
      error: (error: unknown) => {
        console.error('No fue posible cargar las últimas órdenes.', error);
        this.lastOrdersError = 'No fue posible cargar las últimas órdenes. Verifique la conexión e inténtelo nuevamente.';
        this.isLoadingLastOrders = false;
      }
    });
  }

  get totalOrders(): number {
    return this.orderService.getTotalOrders();
  }

  get pendingOrders(): number {
    return this.orderService.getPendingOrders().length;
  }

  get inRepairOrders(): number {
    return this.orderService.getInRepairOrders().length;
  }

  get readyOrders(): number {
    return this.orderService.getReadyOrders().length;
  }

  get deliveredOrders(): number {
    return this.orderService.getDeliveredOrders().length;
  }

  verTodas(): void {
    this.router.navigate(['/principal/reportes']);
  }

  get totalIncome(): number {
    return this.orderService.getTotalIncome();
  }

  get monthlyIncome(): Array<{ label: string; value: number }> {
    return this.orderService.getMonthlyIncomeData();
  }

  getIncomeBarHeight(value: number): number {
    if (value === 0) {
      return 10;
    }

    return Math.min((value / this.totalIncome) * 100, 100);
  }

  getStatusClass(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      Registrado: 'pendiente-badge',
      'En taller': 'reparacion-badge',
      Listo: 'listo-badge',
      Entregado: 'entregado-badge'
    };

    return map[status] ?? 'pendiente-badge';
  }
}
