import { ref } from 'vue'
import { defineStore } from 'pinia'

// 1. Función parseJwt protegida contra nulos / tipos no válidos
function parseJwt(token) {
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
  // Inicializar estado leyendo de localStorage para persistir sesión
  const user = ref(JSON.parse(localStorage.getItem('skyflow_user') || 'null'))
  const isAuthenticated = ref(!!localStorage.getItem('skyflow_token'))
  const loading = ref(false)
  const error = ref(null)

  // URL base de la API definida en el archivo .env
  const apiUrl = import.meta.env.VITE_API_URL

  // Función para iniciar sesión conectándose a la API real
  const login = async (email, password) => {
    loading.value = true
    error.value = null
    
    // 1. Obtener la IP pública del cliente (con fallback a localhost en caso de error)
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
      // 2. Realizar petición POST a la API del backend
      const response = await fetch(`${apiUrl}/Usuarios/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          correo: email,
          contrasena: password,
          ipAddress: ipAddress
        })
      })

      // 3. Manejo de respuesta exitosa (200 OK)
      if (response.ok) {
        const data = await response.json()
        
        // Imprimir en consola para verificar la estructura exacta si sigue dando problemas
        // console.log('Respuesta API:', data)

        // Extraer el token según las variaciones habituales de respuesta
        const token = data.accessToken || data.token || data.value?.accessToken || data.value?.token || data.data?.accessToken || data.data?.token

        // Decodificar claims del JWT
        const claims = parseJwt(token)
        
        let id = null
        let name = 'Usuario SkyFlow'
        let userEmail = email
        let role = 'Coordinator'

        if (claims) {
          id = claims['sub'] || claims['nameid'] || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || id
          name = claims['name'] || claims['unique_name'] || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || name
          userEmail = claims['email'] || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || userEmail
          role = claims['role'] || claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] || role
        }

        const userData = {
          id,
          name,
          email: userEmail,
          role
        }

        user.value = userData
        isAuthenticated.value = true

        // Persistencia en localStorage
        localStorage.setItem('skyflow_user', JSON.stringify(userData))
        localStorage.setItem('skyflow_token', token)
        
        const refreshToken = data.refreshToken || data.value?.refreshToken || data.data?.refreshToken
        if (refreshToken) {
          localStorage.setItem('skyflow_refresh_token', refreshToken)
        }
        return true
      } 
      // 4. Manejo de errores de petición (400 Bad Request u otros)
      else {
        try {
          const errorData = await response.json()
          error.value = errorData.errorMessage || 'Ocurrió un error al intentar iniciar sesión.'
        } catch (jsonErr) {
          error.value = `Error en el servidor de autenticación (${response.status}).`
        }
        return false
      }
    } catch (err) {
      error.value = 'No se pudo conectar con el servidor de autenticación. Verifica tu conexión de red o si el servidor local está activo.'
      return false
    } finally {
      loading.value = false
    }
  }

  // Función para cerrar sesión
  const logout = async () => {
    const token = localStorage.getItem('skyflow_token')
    const refreshToken = localStorage.getItem('skyflow_refresh_token')

    // Notificar al backend de manera asíncrona para invalidar el token
    if (refreshToken) {
      try {
        const headers = {
          'Content-Type': 'application/json'
        }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        await fetch(`${apiUrl}/Usuarios/cerrar-sesion`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            refreshToken
          })
        })
      } catch (err) {
        console.error('Error al notificar cierre de sesión al servidor:', err)
      }
    }

    // Limpiar estado y localStorage localmente en el cliente
    user.value = null
    isAuthenticated.value = false
    error.value = null
    
    localStorage.removeItem('skyflow_user')
    localStorage.removeItem('skyflow_token')
    localStorage.removeItem('skyflow_refresh_token')
  }

  // Función para cambiar contraseña
  const changePassword = async (currentPassword, newPassword) => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('skyflow_token')
      const response = await fetch(`${apiUrl}/Usuarios/cambiar-contrasena`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contrasenaActual: currentPassword,
          nuevaContrasena: newPassword
        })
      })

      if (response.ok) {
        return true
      } else {
        try {
          const errorData = await response.json()
          error.value = errorData.errorMessage || errorData.detail || 'Error al cambiar la contraseña.'
        } catch (jsonErr) {
          error.value = `Error en el servidor (${response.status}).`
        }
        return false
      }
    } catch (err) {
      error.value = 'Error de red al intentar cambiar la contraseña.'
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
