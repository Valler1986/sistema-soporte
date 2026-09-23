export type OrderStatus = 'Registrado' | 'En taller' | 'Listo' | 'Entregado';

export interface Order {
  id: number;
  clientName: string;
  equipment: string;
  status: OrderStatus;
  date: string;
  total: number;
}
