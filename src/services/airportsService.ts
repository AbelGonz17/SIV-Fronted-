import apiClient from './apiClient'
import type { AirportDTO } from '../models/AirportDTO'

export const airportsService = {
  async getAll(): Promise<AirportDTO[]> {
    const response = await apiClient.get('/Aeropuertos')
    return response.data?.value || response.data || []
  }
}
