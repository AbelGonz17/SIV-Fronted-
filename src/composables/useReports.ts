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

  const exportReportCsv = async (tipo: string, fechaInicio: string, fechaFin: string) => {
    loading.value = true
    error.value = null
    try {
      const data = await reportsService.exportReportCsv(tipo, fechaInicio, fechaFin)
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      console.error('Error exporting report:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al exportar el reporte'
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
    fetchSeguimientoReport,
    exportReportCsv
  }
}
