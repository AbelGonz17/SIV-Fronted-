import { ref } from 'vue'
import { visitorService } from '../services/visitorService'
import type { NotificationDTO, TrackedFlightDTO } from '../models/VisitorDTO'

// Estado compartido singleton
const myFlights = ref<TrackedFlightDTO[]>([])
const notifications = ref<NotificationDTO[]>([])
const loadingFlights = ref<boolean>(false)
const loadingNotifications = ref<boolean>(false)
const error = ref<string | null>(null)

export function useVisitor() {
  const fetchMyFlights = async () => {
    loadingFlights.value = true
    error.value = null
    try {
      myFlights.value = await visitorService.getMyTrackedFlights()
    } catch (err: any) {
      console.error('fetchMyFlights:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al obtener vuelos seguidos.'
    } finally {
      loadingFlights.value = false
    }
  }

  const followFlight = async (vueloId: string) => {
    try {
      return await visitorService.followFlight(vueloId)
    } catch (err: any) {
      console.error('followFlight:', err)
      throw new Error(err.response?.data?.errorMessage || 'Error al seguir el vuelo.')
    }
  }

  const unfollowFlight = async (vueloId: string) => {
    try {
      return await visitorService.unfollowFlight(vueloId)
    } catch (err: any) {
      console.error('unfollowFlight:', err)
      throw new Error(err.response?.data?.errorMessage || 'Error al dejar de seguir.')
    }
  }

  const fetchNotifications = async () => {
    loadingNotifications.value = true
    try {
      notifications.value = await visitorService.getMyNotifications()
    } catch (err: any) {
      console.error('fetchNotifications:', err)
    } finally {
      loadingNotifications.value = false
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await visitorService.markNotificationAsRead(id)
      // Actualizar optimistamente en el estado local
      const notif = notifications.value.find(n => n.id === id)
      if (notif) notif.fueLeida = true
    } catch (err: any) {
      console.error('markAsRead:', err)
      throw new Error(err.response?.data?.errorMessage || 'Error al marcar notificación.')
    }
  }

  const addNotification = (mensaje: string) => {
    notifications.value.unshift({
      id: 'temp-' + Date.now(),
      mensaje,
      fueLeida: false,
      fechaHoraGenearicion: new Date().toISOString()
    })
  }

  return {
    myFlights,
    notifications,
    loadingFlights,
    loadingNotifications,
    error,
    fetchMyFlights,
    followFlight,
    unfollowFlight,
    fetchNotifications,
    markAsRead,
    addNotification
  }
}
