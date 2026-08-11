import apiClient from './apiClient'
import type { 
  AirlineDTO, 
  CreateAirlineRequestDTO, 
  UpdateAirlineRequestDTO 
} from '../models/AirlineDTO'

export const airlinesService = {
  async getAll(): Promise<AirlineDTO[]> {
    const response = await apiClient.get('/Aerolineas')
    return response.data?.value || response.data || []
  },

  async createAirline(data: CreateAirlineRequestDTO): Promise<any> {
    const response = await apiClient.post('/Aerolineas', data)
    return response.data?.value || response.data
  },

  async updateAirline(id: string, data: UpdateAirlineRequestDTO): Promise<any> {
    const response = await apiClient.put(`/Aerolineas/${id}`, { ...data, id })
    return response.data?.value || response.data
  },

  async deleteAirline(id: string): Promise<any> {
    const response = await apiClient.delete(`/Aerolineas/${id}`)
    return response.data?.value || response.data
  },

  async activateAirline(id: string): Promise<any> {
    const response = await apiClient.patch(`/Aerolineas/${id}/activar`)
    return response.data?.value || response.data
  }
}
