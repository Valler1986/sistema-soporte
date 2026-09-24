import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { OrderStatus } from '../../models/orden.model';
import { OrderService } from '../../services/orden.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  readonly systemName = 'TecFix S.A.';

  constructor(
    private readonly orderService: OrderService,
    private readonly router: Router
  ) {
    this.orderService.orders$.subscribe(() => {
      // El dashboard se actualiza cuando cambia la data compartida.
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

  get lastOrders(): Array<{ id: number; clientName: string; equipment: string; status: OrderStatus; date: string; total: number }> {
    return this.orderService.getAllOrders().slice(0, 4);
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

