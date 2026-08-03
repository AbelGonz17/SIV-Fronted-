export interface AirportDTO {
  id: string;
  nombre: string;
  codigoIATA?: string;
  ciudad?: string;
  pais?: string;
  activo?: boolean;
}

export interface CreateAirportRequestDTO {
  nombre: string;
  codigoIATA: string;
  ciudad: string;
  pais: string;
}

export interface UpdateAirportRequestDTO {
  nombre: string;
  codigoIATA: string;
  ciudad: string;
  pais: string;
}
