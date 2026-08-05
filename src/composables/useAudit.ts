import { ref } from 'vue'
import type { AuditLogDTO } from '../models/InfraDTO'
import api from '../services/apiClient' 

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
      const response = await api.get('/Auditoria/logs', { params })
      
      if (response.data && response.data.value && response.data.value.items) {
        logs.value = response.data.value.items
        totalCount.value = response.data.value.totalCount
        totalPages.value = response.data.value.totalPages
        currentPage.value = response.data.value.pageNumber
      } else if (response.data && response.data.items) {
        logs.value = response.data.items
        totalCount.value = response.data.totalCount
        totalPages.value = response.data.totalPages
        currentPage.value = response.data.pageNumber
      } else {
        logs.value = []
        totalCount.value = 0
        totalPages.value = 1
        currentPage.value = 1
      }
      
    } catch (err: any) {
      error.value = err.message || 'Error al obtener los logs de auditoría'
      throw err
    } finally {
      loading.value = false
    }
  }

  const exportLogsCsv = async (params: any = {}) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/Auditoria/logs/exportar', { 
        params,
        responseType: 'blob' 
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `auditoria_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      error.value = err.message || 'Error al exportar los logs'
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
