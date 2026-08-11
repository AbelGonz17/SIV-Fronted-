import { ref } from 'vue'
import { defineStore } from 'pinia'
import { authService } from '../services/authService'
import type { UserDTO } from '../models/AuthDTO'
import { getErrorMessage } from '../services/apiClient'

// 1. Función parseJwt protegida contra nulos / tipos no válidos
function parseJwt(token: string | null): Record<string, any> | null {
  if (!token || typeof token !== 'string') {
    console.error('El token provisto es inválido o indefinido:', token)
    return null
  }

  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('El formato del token JWT no es válido (debe tener 3 partes).')
      return null
    }

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('No se pudo decodificar el token JWT:', e)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Inicializar estado leyendo de localStorage o sessionStorage para persistir sesión
  const savedUser = localStorage.getItem('skyflow_user') || sessionStorage.getItem('skyflow_user')
  const savedToken = localStorage.getItem('skyflow_token') || sessionStorage.getItem('skyflow_token')
  
  const user = ref<UserDTO | null>(JSON.parse(savedUser || 'null'))
  const isAuthenticated = ref<boolean>(!!savedToken)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Función para iniciar sesión conectándose a la API a través del servicio
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    loading.value = true
    error.value = null
    
    // Obtener la IP pública del cliente (con fallback a localhost en caso de error)
    let ipAddress = '127.0.0.1'
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json')
      if (ipResponse.ok) {
        const ipData = await ipResponse.json()
        ipAddress = ipData.ip || '127.0.0.1'
      }
    } catch (ipErr) {
      console.warn('No se pudo obtener la IP pública del cliente, usando 127.0.0.1 por defecto.', ipErr)
    }

    try {
      // Usar el servicio de consumo de API (Desacoplado)
      const data = await authService.login({
        correo: email,
        contrasena: password,
        ipAddress,
        recordarme: rememberMe
      })

      // Extraer el token según las variaciones habituales de respuesta
      const token = data.accessToken || data.token || data.value?.accessToken || data.value?.token || data.data?.accessToken || data.data?.token

      if (!token) {
        throw new Error('No se recibió un token válido en la respuesta.')
      }

      // Decodificar claims del JWT
      const claims = parseJwt(token)
      
      let id: string | null = null
      let name = 'Usuario SkyFlow'
      let userEmail = email
      let role = 'Coordinator'

      if (claims) {
        id = claims['sub'] || claims['nameid'] || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || id
        name = claims['name'] || claims['unique_name'] || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || name
        userEmail = claims['email'] || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || userEmail
        role = claims['role'] || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] || role
      }

      const userData: UserDTO = {
        id,
        name,
        email: userEmail,
        role
      }

      user.value = userData
      isAuthenticated.value = true

      // Persistencia en storage (según rememberMe)
      const storage = rememberMe ? localStorage : sessionStorage
      
      storage.setItem('skyflow_user', JSON.stringify(userData))
      storage.setItem('skyflow_token', token)
      
      const refreshToken = data.refreshToken || data.value?.refreshToken || data.data?.refreshToken
      if (refreshToken) {
        storage.setItem('skyflow_refresh_token', refreshToken)
      }
      return true

    } catch (err: any) {
      error.value = getErrorMessage(err)
      return false
    } finally {
      loading.value = false
    }
  }

  // Función para cerrar sesión
  const logout = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('skyflow_refresh_token') || sessionStorage.getItem('skyflow_refresh_token')

    // Notificar al backend de manera asíncrona para invalidar el token
    if (refreshToken) {
      try {
        await authService.logout(refreshToken)
      } catch (err) {
        console.error('Error al notificar cierre de sesión al servidor:', err)
      }
    }

    // Limpiar estado y storage localmente en el cliente
    user.value = null
    isAuthenticated.value = false
    error.value = null
    
    localStorage.removeItem('skyflow_user')
    localStorage.removeItem('skyflow_token')
    localStorage.removeItem('skyflow_refresh_token')
    
    sessionStorage.removeItem('skyflow_user')
    sessionStorage.removeItem('skyflow_token')
    sessionStorage.removeItem('skyflow_refresh_token')
  }

  // Función para cambiar contraseña
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    loading.value = true
    error.value = null
    try {
      await authService.changePassword({
        contrasenaActual: currentPassword,
        nuevaContrasena: newPassword
      })
      return true
    } catch (err: any) {
      error.value = getErrorMessage(err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    changePassword
  }
})
