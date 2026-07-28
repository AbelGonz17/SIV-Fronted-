import { ref } from 'vue'
import * as signalR from '@microsoft/signalr'

// Singleton instance to avoid multiple connections
let connection = null
const isConnected = ref(false)

// Listeners array for custom events
const listeners = {
  'RecibirCambioVuelo': [],
  'RecibirAlertaPersonalizada': []
}

export function useSignalR() {
  const startConnection = async () => {
    if (connection && isConnected.value) return
    if (connection && connection.state === signalR.HubConnectionState.Connecting) return

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://localhost:7273/api'
      const hubUrl = baseUrl.replace(/\/api\/?$/, '/vuelosHub')
      
      connection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => localStorage.getItem('skyflow_token')
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000]) // Retry immediately, 2s, 10s, 30s
        .configureLogging(signalR.LogLevel.Information)
        .build()

      // Register global handlers that delegate to registered callbacks
      connection.on('RecibirCambioVuelo', (payload) => {
        console.log('[SignalR] RecibirCambioVuelo:', payload)
        listeners['RecibirCambioVuelo'].forEach(cb => cb(payload))
      })

      connection.on('RecibirAlertaPersonalizada', (mensaje) => {
        console.log('[SignalR] RecibirAlertaPersonalizada:', mensaje)
        listeners['RecibirAlertaPersonalizada'].forEach(cb => cb(mensaje))
      })

      connection.onreconnecting((error) => {
        console.warn('[SignalR] Reconectando...', error)
        isConnected.value = false
      })

      connection.onreconnected((connectionId) => {
        console.log('[SignalR] Reconectado con ID:', connectionId)
        isConnected.value = true
      })

      connection.onclose((error) => {
        console.error('[SignalR] Conexión cerrada.', error)
        isConnected.value = false
      })

      await connection.start()
      isConnected.value = true
      console.log('[SignalR] Conectado exitosamente.')
    } catch (error) {
      console.error('[SignalR] Error al conectar:', error)
      isConnected.value = false
    }
  }

  const stopConnection = async () => {
    if (connection) {
      await connection.stop()
      isConnected.value = false
      connection = null
    }
  }

  const onFlightChanged = (callback) => {
    if (!listeners['RecibirCambioVuelo'].includes(callback)) {
      listeners['RecibirCambioVuelo'].push(callback)
    }
  }

  const offFlightChanged = (callback) => {
    listeners['RecibirCambioVuelo'] = listeners['RecibirCambioVuelo'].filter(cb => cb !== callback)
  }

  const onPersonalAlert = (callback) => {
    if (!listeners['RecibirAlertaPersonalizada'].includes(callback)) {
      listeners['RecibirAlertaPersonalizada'].push(callback)
    }
  }

  const offPersonalAlert = (callback) => {
    listeners['RecibirAlertaPersonalizada'] = listeners['RecibirAlertaPersonalizada'].filter(cb => cb !== callback)
  }

  return {
    isConnected,
    startConnection,
    stopConnection,
    onFlightChanged,
    offFlightChanged,
    onPersonalAlert,
    offPersonalAlert
  }
}
