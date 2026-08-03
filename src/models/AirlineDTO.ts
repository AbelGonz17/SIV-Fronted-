export interface AirlineDTO {
  id: string;
  nombre: string;
  codigoIATA?: string;
  activo?: boolean;
}

export interface CreateAirlineRequestDTO {
  nombre: string;
  codigoIATA: string;
}

export interface UpdateAirlineRequestDTO {
  nombre: string;
  codigoIATA: string;
}
