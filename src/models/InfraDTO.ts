export interface AuditLogDTO {
  id: number;
  fechaHora: string;
  usuario: string;
  accion: string;
  entidadAfectada: string;
  entidadId: string;
  detalles: string;
}

export interface PaginatedAuditResponse {
  items: AuditLogDTO[];
  totalCount: number;
  totalPages: number;
}

export interface OperacionReportDTO {
  totalVuelos: number;
  vuelosCompletados: number;
  vuelosCancelados: number;
  vuelosRetrasados: number;
  aerolineaMasActiva: string;
  rutaMasFrecuente: string;
}

export interface CambiosOperativosReportDTO {
  totalCambiosEstado: number;
  totalRetrasosRegistrados: number;
  totalAdelantosRegistrados: number;
  tiempoPromedioRetraso: string; // Puede ser string formato TimeSpan o number
  aerolineaConMasRetrasos: string;
}

export interface SeguimientoReportDTO {
  vuelosMasSeguidos: any[]; // Detalles varían según la API
  totalUsuariosActivos: number;
  promedioSeguimientosPorUsuario: number;
}
