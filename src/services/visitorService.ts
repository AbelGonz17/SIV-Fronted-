import apiClient from './apiClient'
import type { NotificationDTO, TrackedFlightDTO } from '../models/VisitorDTO'

export const visitorService = {
  async getMyTrackedFlights(): Promise<TrackedFlightDTO[]> {
    const response = await apiClient.get('/Usuarios/mis-seguimientos')
    return response.data?.value || response.data || []
  },

  async followFlight(vueloId: string): Promise<any> {
    const response = await apiClient.post(`/Usuarios/seguimientos/${vueloId}`)
    return response.data?.value || response.data
  },

  async unfollowFlight(vueloId: string): Promise<any> {
    const response = await apiClient.delete(`/Usuarios/seguimientos/${vueloId}`)
    return response.data?.value || response.data
  },

  async getMyNotifications(): Promise<NotificationDTO[]> {
    const response = await apiClient.get('/Usuarios/mis-notificaciones')
    return response.data?.value || response.data || []
  },

  async markNotificationAsRead(id: string): Promise<any> {
    const response = await apiClient.put(`/Usuarios/notificaciones/${id}/marcar-leida`)
    return response.data?.value || response.data
  }
}
