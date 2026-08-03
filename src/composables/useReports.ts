import { ref } from 'vue'
import { reportsService } from '../services/reportsService'
import type { 
  OperacionReportDTO, 
  CambiosOperativosReportDTO, 
  SeguimientoReportDTO 
} from '../models/InfraDTO'

export function useReports() {
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchOperacionReport = async (fechaInicio: string, fechaFin: string): Promise<OperacionReportDTO> => {
    loading.value = true
    error.value = null
    try {
      return await reportsService.fetchOperacionReport(fechaInicio, fechaFin)
    } catch (err: any) {
      console.error('Error fetching operacion report:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al obtener el reporte de operación'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCambiosOperativos = async (fechaInicio: string, fechaFin: string): Promise<CambiosOperativosReportDTO> => {
    loading.value = true
    error.value = null
    try {
      return await reportsService.fetchCambiosOperativos(fechaInicio, fechaFin)
    } catch (err: any) {
      console.error('Error fetching cambios operativos:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al obtener los cambios operativos'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchSeguimientoReport = async (top: number = 10): Promise<SeguimientoReportDTO> => {
    loading.value = true
    error.value = null
    try {
      return await reportsService.fetchSeguimientoReport(top)
    } catch (err: any) {
      console.error('Error fetching seguimiento report:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al obtener el reporte de seguimientos'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchOperacionReport,
    fetchCambiosOperativos,
    fetchSeguimientoReport
  }
}
