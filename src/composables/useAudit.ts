import { ref } from 'vue'
import type { AuditLogDTO } from '../models/InfraDTO'

export function useAudit() {
  const logs = ref<AuditLogDTO[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const totalCount = ref<number>(0)
  const totalPages = ref<number>(0)
  const currentPage = ref<number>(1)

  const fetchLogs = async (params: any = {}) => {
    loading.value = true
    error.value = null
    try {
      // Simular retraso de red
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // MOCK DATA
      let mockLogs: AuditLogDTO[] = [
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
      
      if (params.accion) {
        mockLogs = mockLogs.filter(l => l.accion === params.accion)
      }

      logs.value = mockLogs
      totalCount.value = mockLogs.length
      totalPages.value = 1
      currentPage.value = 1
      
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportLogsCsv = async (params: any = {}) => {
    loading.value = true
    error.value = null
    try {
      // Simulate export for now since it's mocked
      await new Promise(resolve => setTimeout(resolve, 800))
      console.log('Mock export completed for params:', params)
      alert('Mock export: El archivo CSV ha sido generado correctamente en consola.')
    } catch (err: any) {
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
