export interface CreateOrderRequest {
  nombre: string;
  apellidos: string;
  dni: string;
  tipoId: number;
  marcaId: number;
  nombreEquipo: string;
  nSerie: string | null;
  anhoFabricacion: number | null;
  descripcionProblema: string;
  diagnostico: string | null;
  fecha: string;
  fechaEntrega: string;
  costoTotal: number;
}

export interface OrderRegistrationResult {
  mode: 'local' | 'remote';
  localOrderId?: number;
}
