export interface Brand {
  id: number;
  nombre: string;
}

export interface BrandsResponse {
  statusCode: number;
  data: Brand[];
}
