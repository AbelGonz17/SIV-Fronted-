export interface FlightDTO {
  id: string;
  numeroVuelo: string;
  origen: string;
  destino: string;
  horarioPlanificado: string; // ISO String
  horarioEstimado: string;    // ISO String
  estado: string;
  aerolineaId: string;
  aerolineaNombre: string;
  precioBase?: number;
  puertaEmbarque?: string;
  uiStatus?: string;          // Usado internamente en UI
  uiType?: 'Arrival' | 'Departure'; // Usado internamente en UI
  uiTime?: string;            // Usado internamente en UI
}

export interface FlightFilterDTO {
  pageNumber: number;
  pageSize: number;
  esLlegada?: string; // '' (todos), 'true' (llegadas), 'false' (salidas)
  estado?: string;
  aerolineaId?: string;
  fecha?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

export interface CreateFlightRequestDTO {
  numeroVuelo: string;
  aerolineaId: string;
  origen: string;
  destino: string;
  horarioPlanificado: string;
  precioBase: number;
}

export interface UpdateFlightBasicRequestDTO {
  horarioPlanificado: string;
  precioBase: number;
}

export interface ChangeFlightStatusRequestDTO {
  vueloId: string;
  nuevoEstado: string;
}

export interface DelayFlightRequestDTO {
  vueloId: string;
  nuevoHorarioEstimado: string;
  motivo: string;
}

export interface AdvanceFlightRequestDTO {
  vueloId: string;
  nuevoHorarioEstimado: string;
  motivo: string;
}

export interface CancelFlightRequestDTO {
  vueloId: string;
  motivo: string;
}
