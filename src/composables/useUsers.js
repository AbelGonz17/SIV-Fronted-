import { ref } from 'vue'

export function useUsers() {
  const internalUsers = ref([])
  const publicUsers = ref([])
  const loading = ref(false)
  const error = ref(null)

  const apiUrl = import.meta.env.VITE_API_URL

  const getAuthHeaders = (withBody = false) => {
    const token = localStorage.getItem('skyflow_token')
    const headers = { 'Accept': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (withBody) headers['Content-Type'] = 'application/json'
    return headers
  }

  // GET /api/Usuarios/internos  — Administrador, Auditor
  const fetchInternalUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${apiUrl}/Usuarios/internos`, {
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error(`Error al obtener usuarios internos (${response.status})`)
      const data = await response.json()
      internalUsers.value = data.value || data || []
    } catch (err) {
      console.error('Error fetching internal users:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // GET /api/Usuarios/publicos  — Administrador, Auditor
  const fetchPublicUsers = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${apiUrl}/Usuarios/publicos`, {
        headers: getAuthHeaders()
      })
      if (!response.ok) throw new Error(`Error al obtener usuarios públicos (${response.status})`)
      const data = await response.json()
      publicUsers.value = data.value || data || []
    } catch (err) {
      console.error('Error fetching public users:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // POST /api/Usuarios/crear-interno  — Administrador
  const createInternalUser = async (command) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${apiUrl}/Usuarios/crear-interno`, {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify(command)
      })
      if (!response.ok) {
        const errMsg = await response.text()
        throw new Error(errMsg || `Error al crear usuario (${response.status})`)
      }
      return await response.json()
    } catch (err) {
      console.error('Error creating internal user:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // PUT /api/Usuarios/{id}/interno  — Administrador
  const updateInternalUser = async (id, command) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${apiUrl}/Usuarios/${id}/interno`, {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ ...command, Id: id })
      })
      if (!response.ok) {
        const errMsg = await response.text()
        throw new Error(errMsg || `Error al actualizar usuario (${response.status})`)
      }
      return await response.json()
    } catch (err) {
      console.error('Error updating internal user:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // PATCH /api/Usuarios/{id}/desactivar  — Administrador
  const deactivateUser = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${apiUrl}/Usuarios/${id}/desactivar`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      })
      if (!response.ok) {
        const errMsg = await response.text()
        throw new Error(errMsg || `Error al desactivar usuario (${response.status})`)
      }
      return await response.json()
    } catch (err) {
      console.error('Error deactivating user:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // PATCH /api/Usuarios/{id}/activar  — Administrador
  const activateUser = async (id) => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(`${apiUrl}/Usuarios/${id}/activar`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      })
      if (!response.ok) {
        const errMsg = await response.text()
        throw new Error(errMsg || `Error al activar usuario (${response.status})`)
      }
      return await response.json()
    } catch (err) {
      console.error('Error activating user:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    internalUsers,
    publicUsers,
    loading,
    error,
    fetchInternalUsers,
    fetchPublicUsers,
    createInternalUser,
    updateInternalUser,
    deactivateUser,
    activateUser
  }
}
