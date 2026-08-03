import apiClient from './apiClient'
import type { 
  OperacionReportDTO, 
  CambiosOperativosReportDTO, 
  SeguimientoReportDTO 
} from '../models/InfraDTO'

export const reportsService = {
  async fetchOperacionReport(fechaInicio: string, fechaFin: string): Promise<OperacionReportDTO> {
    const params = new URLSearchParams()
    if (fechaInicio) params.append('fechaInicio', fechaInicio)
    if (fechaFin) params.append('fechaFin', fechaFin)
    
    const response = await apiClient.get('/Reportes/operacion', { params })
    return response.data?.value || response.data
  },

  async fetchCambiosOperativos(fechaInicio: string, fechaFin: string): Promise<CambiosOperativosReportDTO> {
    const params = new URLSearchParams()
    if (fechaInicio) params.append('fechaInicio', fechaInicio)
    if (fechaFin) params.append('fechaFin', fechaFin)

    const response = await apiClient.get('/Reportes/cambios-operativos', { params })
    return response.data?.value || response.data
  },

  async fetchSeguimientoReport(top: number = 10): Promise<SeguimientoReportDTO> {
    const response = await apiClient.get('/Reportes/seguimiento', { 
      params: { top } 
    })
    return response.data?.value || response.data
  }
}
