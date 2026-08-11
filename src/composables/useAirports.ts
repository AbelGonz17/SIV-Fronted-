import { ref } from 'vue'
import { airportsService } from '../services/airportsService'
import type { AirportDTO, CreateAirportRequestDTO, UpdateAirportRequestDTO } from '../models/AirportDTO'
import { getErrorMessage } from '../services/apiClient'

export function useAirports() {
  const airports = ref<AirportDTO[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchAirports = async () => {
    loading.value = true
    error.value = null
    try {
      airports.value = await airportsService.getAll()
    } catch (err: any) {
      console.error('Error fetching airports:', err)
      error.value = getErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  const createAirport = async (command: CreateAirportRequestDTO) => {
    try {
      return await airportsService.createAirport(command)
    } catch (err: any) {
      console.error('Error creating airport:', err)
      throw new Error(getErrorMessage(err))
    }
  }

  const updateAirport = async (id: string, command: UpdateAirportRequestDTO) => {
    try {
      return await airportsService.updateAirport(id, command)
    } catch (err: any) {
      console.error('Error updating airport:', err)
      throw new Error(getErrorMessage(err))
    }
  }

  const deleteAirport = async (id: string) => {
    try {
      return await airportsService.deleteAirport(id)
    } catch (err: any) {
      console.error('Error deleting airport:', err)
      throw new Error(getErrorMessage(err))
    }
  }

  const activateAirport = async (id: string) => {
    try {
      return await airportsService.activateAirport(id)
    } catch (err: any) {
      console.error('Error activating airport:', err)
      throw new Error(getErrorMessage(err))
    }
  }

  return {
    airports,
    loading,
    error,
    fetchAirports,
    createAirport,
    updateAirport,
    deleteAirport,
    activateAirport
  }
}
