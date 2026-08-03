export interface NotificationDTO {
  id: string;
  mensaje: string;
  fueLeida: boolean;
  fechaHoraGenearicion: string; // ISO date string
}

export interface TrackedFlightDTO {
  vueloId: string;
  numeroVuelo: string;
  origen: string;
  destino: string;
  aerolinea: string;
  estadoActual: string;
  horarioEstimado: string;
  puerta: string;
}
