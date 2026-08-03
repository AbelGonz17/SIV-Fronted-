import apiClient from './apiClient'
import type { 
  InternalUserDTO, 
  PublicUserDTO, 
  CreateInternalUserRequestDTO, 
  UpdateInternalUserRequestDTO 
} from '../models/UserManagementDTO'

export const usersService = {
  async getInternalUsers(): Promise<InternalUserDTO[]> {
    const response = await apiClient.get('/Usuarios/internos')
    return response.data?.value || response.data || []
  },

  async getPublicUsers(): Promise<PublicUserDTO[]> {
    const response = await apiClient.get('/Usuarios/publicos')
    return response.data?.value || response.data || []
  },

  async createInternalUser(data: CreateInternalUserRequestDTO): Promise<any> {
    const response = await apiClient.post('/Usuarios/crear-interno', data)
    return response.data?.value || response.data
  },

  async updateInternalUser(id: string, data: UpdateInternalUserRequestDTO): Promise<any> {
    const response = await apiClient.put(`/Usuarios/${id}/interno`, { ...data, id })
    return response.data?.value || response.data
  },

  async deactivateUser(id: string): Promise<any> {
    const response = await apiClient.patch(`/Usuarios/${id}/desactivar`)
    return response.data?.value || response.data
  },

  async activateUser(id: string): Promise<any> {
    const response = await apiClient.patch(`/Usuarios/${id}/activar`)
    return response.data?.value || response.data
  }
}
