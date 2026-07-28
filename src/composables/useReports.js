import { ref } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5242/api'

export function useReports() {
  const loading = ref(false)
  const error = ref(null)

  const fetchOperacionReport = async (fechaInicio, fechaFin) => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('skyflow_token')
      const response = await fetch(`${API_URL}/Reportes/operacion?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Error al obtener el reporte de operación')
      return await response.json()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCambiosOperativos = async (fechaInicio, fechaFin) => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('skyflow_token')
      const response = await fetch(`${API_URL}/Reportes/cambios-operativos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Error al obtener los cambios operativos')
      return await response.json()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchSeguimientoReport = async (top = 10) => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('skyflow_token')
      const response = await fetch(`${API_URL}/Reportes/seguimiento?top=${top}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error('Error al obtener el reporte de seguimiento')
      return await response.json()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportReportCsv = async (tipo, fechaInicio = null, fechaFin = null) => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('skyflow_token')
      const queryParams = new URLSearchParams()
      if (fechaInicio) queryParams.append('fechaInicio', fechaInicio)
      if (fechaFin) queryParams.append('fechaFin', fechaFin)
      
      const response = await fetch(`${API_URL}/Reportes/exportar/${tipo}?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (!response.ok) throw new Error(`Error al exportar el reporte ${tipo}`)

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Reporte_${tipo}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (err) {
      error.value = err.message
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
