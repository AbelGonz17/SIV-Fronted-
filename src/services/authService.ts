import apiClient from './apiClient'
import type { 
  LoginRequestDTO, 
  RegisterRequestDTO, 
  ChangePasswordRequestDTO, 
  AuthResponseDTO,
  ForgotPasswordRequestDTO,
  ResetPasswordRequestDTO
} from '../models/AuthDTO'

export const authService = {
  async login(payload: LoginRequestDTO): Promise<AuthResponseDTO> {
    const response = await apiClient.post<AuthResponseDTO>('/Usuarios/login', payload)
    return response.data
  },

  async register(payload: RegisterRequestDTO): Promise<AuthResponseDTO> {
    const response = await apiClient.post<AuthResponseDTO>('/Usuarios/registrar', payload)
    return response.data
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/Usuarios/cerrar-sesion', { refreshToken })
  },

  async changePassword(payload: ChangePasswordRequestDTO): Promise<void> {
    await apiClient.patch('/Usuarios/cambiar-contrasena', payload)
  },

  async forgotPassword(payload: ForgotPasswordRequestDTO): Promise<void> {
    await apiClient.post('/Usuarios/olvide-contrasena', payload)
  },

  async resetPassword(payload: ResetPasswordRequestDTO): Promise<void> {
    await apiClient.post('/Usuarios/restablecer-contrasena', payload)
  }
}
