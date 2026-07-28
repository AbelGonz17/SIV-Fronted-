import { ref } from 'vue'

// ─── Estado compartido singleton ─────────────────────────────────────────────
// Al igual que useTheme, el estado vive FUERA de la función para que todas
// las instancias (Sidebar, NotificationsView, etc.) compartan el mismo ref.
const myFlights = ref([])
const notifications = ref([])
const loadingFlights = ref(false)
const loadingNotifications = ref(false)
const error = ref(null)

// ─────────────────────────────────────────────────────────────────────────────

const apiUrl = import.meta.env.VITE_API_URL

const authHeaders = () => {
  const token = localStorage.getItem('skyflow_token')
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

// GET /api/Usuarios/mis-seguimientos
const fetchMyFlights = async () => {
  loadingFlights.value = true
  error.value = null
  try {
    const res = await fetch(`${apiUrl}/Usuarios/mis-seguimientos`, { headers: authHeaders() })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const data = await res.json()
    myFlights.value = data.value || data || []
  } catch (err) {
    console.error('fetchMyFlights:', err)
    error.value = err.message
  } finally {
    loadingFlights.value = false
  }
}

// POST /api/Usuarios/seguimientos/{vueloId}
const followFlight = async (vueloId) => {
  const res = await fetch(`${apiUrl}/Usuarios/seguimientos/${vueloId}`, {
    method: 'POST',
    headers: authHeaders()
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `Error al seguir el vuelo (${res.status})`)
  }
  return await res.json()
}

// DELETE /api/Usuarios/seguimientos/{vueloId}
const unfollowFlight = async (vueloId) => {
  const res = await fetch(`${apiUrl}/Usuarios/seguimientos/${vueloId}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `Error al dejar de seguir (${res.status})`)
  }
  return await res.json()
}

// GET /api/Usuarios/mis-notificaciones
const fetchNotifications = async () => {
  loadingNotifications.value = true
  try {
    const res = await fetch(`${apiUrl}/Usuarios/mis-notificaciones`, { headers: authHeaders() })
    if (!res.ok) throw new Error(`Error ${res.status}`)
    const data = await res.json()
    notifications.value = data.value || data || []
  } catch (err) {
    console.error('fetchNotifications:', err)
  } finally {
    loadingNotifications.value = false
  }
}

// PUT /api/Usuarios/notificaciones/{id}/marcar-leida
const markAsRead = async (id) => {
  const res = await fetch(`${apiUrl}/Usuarios/notificaciones/${id}/marcar-leida`, {
    method: 'PUT',
    headers: authHeaders()
  })
  if (!res.ok) throw new Error(`Error al marcar notificación (${res.status})`)
  // Actualizar optimistamente en el estado local sin esperar al servidor
  const notif = notifications.value.find(n => n.id === id)
  if (notif) notif.fueLeida = true
  return await res.json()
}

const addNotification = (mensaje) => {
  notifications.value.unshift({
    id: 'temp-' + Date.now(),
    mensaje,
    fueLeida: false,
    fechaHoraGenearicion: new Date().toISOString()
  })
}

export function useVisitor() {
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
