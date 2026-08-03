import { ref } from 'vue'
import { airportsService } from '../services/airportsService'
import type { AirportDTO, CreateAirportRequestDTO, UpdateAirportRequestDTO } from '../models/AirportDTO'

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
      error.value = err.response?.data?.errorMessage || err.message || 'Error al cargar catálogo de aeropuertos.'
    } finally {
      loading.value = false
    }
  }

  const createAirport = async (command: CreateAirportRequestDTO) => {
    loading.value = true
    error.value = null
    try {
      return await airportsService.createAirport(command)
    } catch (err: any) {
      console.error('Error creating airport:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al crear aeropuerto.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAirport = async (id: string, command: UpdateAirportRequestDTO) => {
    loading.value = true
    error.value = null
    try {
      return await airportsService.updateAirport(id, command)
    } catch (err: any) {
      console.error('Error updating airport:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al actualizar aeropuerto.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAirport = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      return await airportsService.deleteAirport(id)
    } catch (err: any) {
      console.error('Error deleting airport:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al eliminar aeropuerto.'
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
