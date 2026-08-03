import apiClient from './apiClient'
import type { 
  AirportDTO, 
  CreateAirportRequestDTO, 
  UpdateAirportRequestDTO 
} from '../models/AirportDTO'

export const airportsService = {
  async getAll(): Promise<AirportDTO[]> {
    const response = await apiClient.get('/Aeropuertos')
    return response.data?.value || response.data || []
  },

  async createAirport(data: CreateAirportRequestDTO): Promise<any> {
    const response = await apiClient.post('/Aeropuertos', data)
    return response.data?.value || response.data
  },

  async updateAirport(id: string, data: UpdateAirportRequestDTO): Promise<any> {
    const response = await apiClient.put(`/Aeropuertos/${id}`, { ...data, id })
    return response.data?.value || response.data
  },

  async deleteAirport(id: string): Promise<any> {
    const response = await apiClient.delete(`/Aeropuertos/${id}`)
    return response.data?.value || response.data
  }
}
