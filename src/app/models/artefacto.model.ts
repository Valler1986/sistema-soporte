export interface ArtifactType {
  id: number;
  nombre: string;
}

export interface ArtifactTypesResponse {
  statusCode: number;
  data: ArtifactType[];
}
