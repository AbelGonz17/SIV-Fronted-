import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de petición: inyecta el token de acceso
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skyflow_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de respuesta: manejo global de errores (400, 401, 404, 500)
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response) {
      const status = error.response.status

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
        // Lógica para refresh token (simplificada)
        // Podríamos invocar un método de authService aquí si no hubiera dependencia circular
        // Por ahora, simplemente cerraremos la sesión o intentaremos refrescar si aplica
        
        const refreshToken = localStorage.getItem('skyflow_refresh_token')
        if (refreshToken) {
            // Aquí iría la llamada a refrescar el token
            // axios.post(baseURL + '/Usuarios/refrescar', { token, refreshToken }) ...
        } else {
            // No hay refresh token, cerrar sesión
            localStorage.removeItem('skyflow_token')
            localStorage.removeItem('skyflow_refresh_token')
            window.location.href = '/login'
        }
      }

      if (status === 403) {
        console.error('No tienes permisos para esta acción.')
      }
      
      if (status >= 500) {
        console.error('Error del servidor:', error.response.data)
      }
    } else {
      console.error('Error de red o CORS:', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient
