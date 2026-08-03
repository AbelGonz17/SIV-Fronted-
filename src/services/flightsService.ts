import apiClient from './apiClient'
import type { 
  FlightDTO, 
  FlightFilterDTO, 
  PaginatedResponse,
  CreateFlightRequestDTO,
  UpdateFlightBasicRequestDTO,
  ChangeFlightStatusRequestDTO,
  DelayFlightRequestDTO,
  AdvanceFlightRequestDTO,
  CancelFlightRequestDTO
} from '../models/FlightDTO'

export const flightsService = {
  async getFids(filters: FlightFilterDTO): Promise<PaginatedResponse<FlightDTO>> {
    const params = new URLSearchParams()
    params.append('pageNumber', filters.pageNumber.toString())
    params.append('pageSize', filters.pageSize.toString())
    
    if (filters.esLlegada !== undefined && filters.esLlegada !== '') {
      params.append('esLlegada', filters.esLlegada)
    }
    if (filters.estado) {
      params.append('estado', filters.estado)
    }
    if (filters.aerolineaId) {
      params.append('aerolineaId', filters.aerolineaId)
    }
    if (filters.fecha) {
      params.append('fecha', filters.fecha)
    }

    const response = await apiClient.get('/Vuelos/fids', { params })
    return response.data?.value || response.data
  },

  async getDetails(id: string): Promise<any> {
    const response = await apiClient.get(`/Vuelos/${id}/detalle`)
    return response.data?.value || response.data
  },

  async register(data: CreateFlightRequestDTO): Promise<void> {
    await apiClient.post('/Vuelos/registrar', data)
  },

  async updateBasic(id: string, data: UpdateFlightBasicRequestDTO): Promise<void> {
    await apiClient.put(`/Vuelos/${id}/basico`, data)
  },

  async updateStatus(data: ChangeFlightStatusRequestDTO): Promise<void> {
    await apiClient.post('/Vuelos/actualizar-estado', data)
  },

  async registerDelay(data: DelayFlightRequestDTO): Promise<void> {
    await apiClient.post('/Vuelos/registrar-retraso', data)
  },

  async registerAdvance(data: AdvanceFlightRequestDTO): Promise<void> {
    await apiClient.post('/Vuelos/registrar-adelanto', data)
  },

  async cancel(data: CancelFlightRequestDTO): Promise<void> {
    await apiClient.post('/Vuelos/cancelar', data)
  }
}
