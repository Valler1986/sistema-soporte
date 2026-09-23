import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Order, OrderStatus } from '../models/orden.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly ordersSubject = new BehaviorSubject<Order[]>([
    {
      id: 128,
      clientName: 'Juan Pérez',
      equipment: 'Lavadora LG',
      status: 'En taller',
      date: '2026-09-23',
      total: 280
    },
    {
      id: 127,
      clientName: 'María López',
      equipment: 'Refrigeradora Samsung',
      status: 'Listo',
      date: '2026-09-23',
      total: 410
    },
    {
      id: 126,
      clientName: 'Pedro Rojas',
      equipment: 'Televisor Sony',
      status: 'Registrado',
      date: '2026-09-22',
      total: 330
    },
    {
      id: 125,
      clientName: 'Ana Torres',
      equipment: 'Laptop Lenovo',
      status: 'Entregado',
      date: '2026-09-21',
      total: 540
    }
  ]);

  readonly orders$: Observable<Order[]> = this.ordersSubject.asObservable();

  private get orders(): Order[] {
    return this.ordersSubject.getValue();
  }

  private set orders(value: Order[]) {
    this.ordersSubject.next(value);
  }

  getAllOrders(): Order[] {
    return [...this.orders];
  }

  getTotalOrders(): number {
    return this.orders.length;
  }

  getOrdersByStatus(status: OrderStatus): Order[] {
    return this.orders.filter((order) => order.status === status);
  }

  getPendingOrders(): Order[] {
    return this.getOrdersByStatus('Registrado');
  }

  getInRepairOrders(): Order[] {
    return this.getOrdersByStatus('En taller');
  }

  getReadyOrders(): Order[] {
    return this.getOrdersByStatus('Listo');
  }

  getDeliveredOrders(): Order[] {
    return this.getOrdersByStatus('Entregado');
  }

  getInProgressOrders(): Order[] {
    return this.orders.filter((order) => order.status !== 'Entregado');
  }

  getIncomeByOrders(): Order[] {
    return [...this.orders].sort((a, b) => b.total - a.total);
  }

  getTotalIncome(): number {
    return this.orders.reduce((sum, order) => sum + order.total, 0);
  }

  getMonthlyIncomeData(): Array<{ label: string; value: number }> {
    const monthNames = ['Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep'];
    const totals = new Map<string, number>();

    monthNames.forEach((month) => totals.set(month, 0));

    this.orders.forEach((order) => {
      const shortMonth = new Date(order.date).toLocaleDateString('es-PE', { month: 'short' }).replace('.', '').slice(0, 3);
      const label = shortMonth.charAt(0).toUpperCase() + shortMonth.slice(1, 3);
      const key = monthNames.includes(label) ? label : 'Sep';
      totals.set(key, (totals.get(key) ?? 0) + Number(order.total));
    });

    return monthNames.map((label) => ({
      label,
      value: totals.get(label) ?? 0
    }));
  }

  getHistoricalOrders(searchTerm: string, statusFilter: string): Order[] {
    const term = searchTerm.trim().toLowerCase();

    return this.orders.filter((order) => {
      const matchesText =
        term.length === 0 ||
        order.clientName.toLowerCase().includes(term) ||
        order.equipment.toLowerCase().includes(term) ||
        String(order.id).includes(term);

      const matchesStatus =
        statusFilter === 'Todos' ||
        order.status === (statusFilter as OrderStatus);

      return matchesText && matchesStatus;
    });
  }

  addOrder(order: Partial<Order> & Pick<Order, 'clientName' | 'equipment' | 'date' | 'total'>): Order {
    const nextId = this.orders.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;

    const newOrder: Order = {
      id: nextId,
      clientName: order.clientName,
      equipment: order.equipment,
      status: 'Registrado',
      date: order.date,
      total: order.total
    };

    this.orders = [newOrder, ...this.orders];
    return newOrder;
  }

  updateOrderStatus(orderId: number, status: OrderStatus): void {
    const current = this.orders;
    const index = current.findIndex((item) => item.id === orderId);

    if (index >= 0) {
      const updated = [...current];
      updated[index] = { ...updated[index], status };
      this.orders = updated;
    }
  }
}
