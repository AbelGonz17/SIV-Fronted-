import apiClient from './apiClient'
import type { AirlineDTO } from '../models/AirlineDTO'

export const airlinesService = {
  async getAll(): Promise<AirlineDTO[]> {
    const response = await apiClient.get('/Aerolineas')
    // Asumiendo que la API envuelve las colecciones en un `value` si es un Result de ASP.NET Core
    return response.data?.value || response.data || []
  }
}
