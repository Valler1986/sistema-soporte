import { OrderService } from './orden.service';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    service = new OrderService();
  });

  it('should add a new order with default Registered status and increment the total', () => {
    const newOrder = service.addOrder({
      clientName: 'Laura Díaz',
      equipment: 'Televisor Sony',
      date: '2026-09-23',
      total: 450
    });

    expect(newOrder.status).toBe('Registrado');
    expect(service.getTotalOrders()).toBe(5);
    expect(service.getPendingOrders().length).toBe(2);
  });

  it('should emit updated orders when status changes', () => {
    const snapshot: string[] = [];
    service.orders$.subscribe((orders) => {
      snapshot.push(orders.length + ':' + orders[0].status);
    });

    service.updateOrderStatus(128, 'Listo');

    expect(snapshot).toContain('4:Listo');
  });
});
