import { ref } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5242/api'

export function useAudit() {
  const logs = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalCount = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)

  const fetchLogs = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // MOCK DATA
      logs.value = [
        {
          id: 1,
          fechaHora: new Date(new Date().getTime() - 1000 * 60 * 5).toISOString(),
          usuario: 'Abel Gonzalez',
          accion: 'EditarVuelo',
          entidadAfectada: 'Vuelo',
          entidadId: 'VUE-2023',
          detalles: 'Cambio de horario planificado'
        },
        {
          id: 2,
          fechaHora: new Date(new Date().getTime() - 1000 * 60 * 60 * 2).toISOString(),
          usuario: 'Maria Lopez',
          accion: 'RegistrarRetraso',
          entidadAfectada: 'Vuelo',
          entidadId: 'AA-1002',
          detalles: 'Se registró retraso por mal clima'
        },
        {
          id: 3,
          fechaHora: new Date(new Date().getTime() - 1000 * 60 * 60 * 24).toISOString(),
          usuario: 'Abel Gonzalez',
          accion: 'CrearUsuario',
          entidadAfectada: 'Usuario',
          entidadId: 'maria.lopez',
          detalles: 'Creación de nuevo usuario con rol Operador'
        },
        {
          id: 4,
          fechaHora: new Date(new Date().getTime() - 1000 * 60 * 60 * 25).toISOString(),
          usuario: 'Sistema',
          accion: 'ActivarUsuario',
          entidadAfectada: 'Usuario',
          entidadId: 'juan.perez',
          detalles: 'El usuario ha activado su cuenta exitosamente'
        }
      ]
      
      // Filtrar mock data por accion si es que se pasó (opcional para que funcione el filtro básico)
      if (params.accion) {
        logs.value = logs.value.filter(l => l.accion === params.accion)
      }

      totalCount.value = logs.value.length
      totalPages.value = 1
      currentPage.value = 1
      
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportLogsCsv = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('skyflow_token')
      const queryParams = new URLSearchParams()
      
      if (params.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio)
      if (params.fechaFin) queryParams.append('fechaFin', params.fechaFin)
      if (params.accion) queryParams.append('accion', params.accion)

      const response = await fetch(`${API_URL}/Auditoria/exportar?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al exportar los logs')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `auditoria_${new Date().toISOString().split('T')[0]}.csv`
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
    logs,
    loading,
    error,
    totalCount,
    totalPages,
    currentPage,
    fetchLogs,
    exportLogsCsv
  }
}
