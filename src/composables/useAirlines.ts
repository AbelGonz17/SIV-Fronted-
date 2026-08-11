import { ref } from 'vue'
import { airlinesService } from '../services/airlinesService'
import type { AirlineDTO, CreateAirlineRequestDTO, UpdateAirlineRequestDTO } from '../models/AirlineDTO'
import { getErrorMessage } from '../services/apiClient'

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
      error.value = getErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  const createAirline = async (command: CreateAirlineRequestDTO) => {
    try {
      return await airlinesService.createAirline(command)
    } catch (err: any) {
      console.error('Error creating airline:', err)
      throw new Error(getErrorMessage(err))
    }
  }

  const updateAirline = async (id: string, command: UpdateAirlineRequestDTO) => {
    try {
      return await airlinesService.updateAirline(id, command)
    } catch (err: any) {
      console.error('Error updating airline:', err)
      throw new Error(getErrorMessage(err))
    }
  }

  const deleteAirline = async (id: string) => {
    try {
      return await airlinesService.deleteAirline(id)
    } catch (err: any) {
      console.error('Error deleting airline:', err)
      throw new Error(getErrorMessage(err))
    }
  }

  const activateAirline = async (id: string) => {
    try {
      return await airlinesService.activateAirline(id)
    } catch (err: any) {
      console.error('Error activating airline:', err)
      throw new Error(getErrorMessage(err))
    }
  }

  return {
    airlines,
    loading,
    error,
    fetchAirlines,
    createAirline,
    updateAirline,
    deleteAirline,
    activateAirline
  }
}
