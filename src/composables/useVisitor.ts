import { ref } from 'vue'
import { visitorService } from '../services/visitorService'
import type { NotificationDTO, TrackedFlightDTO } from '../models/VisitorDTO'
import { getErrorMessage } from '../services/apiClient'

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
      error.value = getErrorMessage(err)
    } finally {
      loadingFlights.value = false
    }
  }

  const followFlight = async (vueloId: string) => {
    try {
      return await visitorService.followFlight(vueloId)
    } catch (err: any) {
      console.error('followFlight:', err)
      throw new Error(getErrorMessage(err))
    }
  }

  const unfollowFlight = async (vueloId: string) => {
    try {
      return await visitorService.unfollowFlight(vueloId)
    } catch (err: any) {
      console.error('unfollowFlight:', err)
      throw new Error(getErrorMessage(err))
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
      throw new Error(getErrorMessage(err))
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
