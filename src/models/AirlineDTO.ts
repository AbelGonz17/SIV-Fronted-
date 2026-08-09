export interface AirlineDTO {
  id: string;
  nombre: string;
  codigo?: string;
  codigoIATA?: string;
  activo?: boolean;
}

export interface CreateAirlineRequestDTO {
  nombre: string;
  codigo?: string;
  codigoIATA?: string;
}

export interface UpdateAirlineRequestDTO {
  nombre: string;
  codigo?: string;
  codigoIATA?: string;
}
