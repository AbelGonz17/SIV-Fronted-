import { ref } from 'vue'

export function useAirlines() {
  const airlines = ref([])
  const loading = ref(false)
  const error = ref(null)

  const apiUrl = import.meta.env.VITE_API_URL

  const fetchAirlines = async () => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('skyflow_token')
      const headers = {
        'Accept': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${apiUrl}/Aerolineas`, {
        headers
      })

      if (!response.ok) {
        throw new Error(`Error al obtener aerolíneas (${response.status})`)
      }

      const data = await response.json()
      airlines.value = data.value || data || []
    } catch (err) {
      console.error('Error fetching airlines:', err)
      error.value = err.message || 'Error al cargar catálogo de aerolíneas.'
    } finally {
      loading.value = false
    }
  }

  const createAirline = async (command) => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('skyflow_token')
      const response = await fetch(`${apiUrl}/Aerolineas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(command)
      })

      if (!response.ok) {
        const errMsg = await response.text()
        throw new Error(errMsg || `Error al crear aerolínea (${response.status})`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error creating airline:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAirline = async (id, command) => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('skyflow_token')
      const response = await fetch(`${apiUrl}/Aerolineas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(command)
      })

      if (!response.ok) {
        const errMsg = await response.text()
        throw new Error(errMsg || `Error al actualizar aerolínea (${response.status})`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error updating airline:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAirline = async (id) => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('skyflow_token')
      const response = await fetch(`${apiUrl}/Aerolineas/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })

      if (!response.ok) {
        const errMsg = await response.text()
        throw new Error(errMsg || `Error al eliminar aerolínea (${response.status})`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error deleting airline:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    airlines,
    loading,
    error,
    fetchAirlines,
    createAirline,
    updateAirline,
    deleteAirline
  }
}
