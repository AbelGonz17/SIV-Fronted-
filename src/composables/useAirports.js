import { ref } from 'vue'

export function useAirports() {
  const airports = ref([])
  const loading = ref(false)
  const error = ref(null)

  const apiUrl = import.meta.env.VITE_API_URL

  const fetchAirports = async () => {
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

      const response = await fetch(`${apiUrl}/Aeropuertos`, {
        headers
      })

      if (!response.ok) {
        throw new Error(`Error al obtener aeropuertos (${response.status})`)
      }

      const data = await response.json()
      airports.value = data.value || data || []
    } catch (err) {
      console.error('Error fetching airports:', err)
      error.value = err.message || 'Error al cargar catálogo de aeropuertos.'
    } finally {
      loading.value = false
    }
  }

  const createAirport = async (command) => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('skyflow_token')
      const response = await fetch(`${apiUrl}/Aeropuertos`, {
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
        throw new Error(errMsg || `Error al crear aeropuerto (${response.status})`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error creating airport:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAirport = async (id, command) => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('skyflow_token')
      const response = await fetch(`${apiUrl}/Aeropuertos/${id}`, {
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
        throw new Error(errMsg || `Error al actualizar aeropuerto (${response.status})`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error updating airport:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAirport = async (id) => {
    loading.value = true
    error.value = null
    try {
      const token = localStorage.getItem('skyflow_token')
      const response = await fetch(`${apiUrl}/Aeropuertos/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      })

      if (!response.ok) {
        const errMsg = await response.text()
        throw new Error(errMsg || `Error al eliminar aeropuerto (${response.status})`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error deleting airport:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    airports,
    loading,
    error,
    fetchAirports,
    createAirport,
    updateAirport,
    deleteAirport
  }
}
