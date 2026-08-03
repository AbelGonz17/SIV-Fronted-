import { ref } from 'vue'
import { airlinesService } from '../services/airlinesService'
import type { AirlineDTO, CreateAirlineRequestDTO, UpdateAirlineRequestDTO } from '../models/AirlineDTO'

export function useAirlines() {
  const airlines = ref<AirlineDTO[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchAirlines = async () => {
    loading.value = true
    error.value = null
    try {
      airlines.value = await airlinesService.getAll()
    } catch (err: any) {
      console.error('Error fetching airlines:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al cargar catálogo de aerolíneas.'
    } finally {
      loading.value = false
    }
  }

  const createAirline = async (command: CreateAirlineRequestDTO) => {
    loading.value = true
    error.value = null
    try {
      return await airlinesService.createAirline(command)
    } catch (err: any) {
      console.error('Error creating airline:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al crear aerolínea.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAirline = async (id: string, command: UpdateAirlineRequestDTO) => {
    loading.value = true
    error.value = null
    try {
      return await airlinesService.updateAirline(id, command)
    } catch (err: any) {
      console.error('Error updating airline:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al actualizar aerolínea.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAirline = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      return await airlinesService.deleteAirline(id)
    } catch (err: any) {
      console.error('Error deleting airline:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al eliminar aerolínea.'
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
