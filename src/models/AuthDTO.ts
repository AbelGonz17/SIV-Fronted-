export interface LoginRequestDTO {
  correo: string;
  contrasena: string;
  ipAddress?: string;
}

export interface RegisterRequestDTO {
  nombre: string;
  correo: string;
  contrasena: string;
}

export interface ChangePasswordRequestDTO {
  contrasenaActual: string;
  nuevaContrasena: string;
}

export interface AuthResponseDTO {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  value?: {
    accessToken?: string;
    refreshToken?: string;
  };
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
  errorMessage?: string;
}

export interface UserDTO {
  id: string | null;
  name: string;
  email: string;
  role: string;
}
