export interface AirportDTO {
  id: string;
  nombre: string;
  codigo?: string;
  codigoIATA?: string;
  ciudad?: string;
  pais?: string;
  activo?: boolean;
}

export interface CreateAirportRequestDTO {
  nombre: string;
  codigo?: string;
  codigoIATA?: string;
  ciudad?: string;
  pais?: string;
}

export interface UpdateAirportRequestDTO {
  nombre: string;
  codigo?: string;
  codigoIATA?: string;
  ciudad?: string;
  pais?: string;
}
