export interface InternalUserDTO {
  id: string;
  nombre: string;
  correo: string; // Puede venir como correo o correoElectronico
  correoElectronico?: string;
  rol: string;
  activo: boolean;
}

export interface PublicUserDTO {
  id: string;
  nombre: string;
  correo: string;
  activo: boolean;
}

export interface CreateInternalUserRequestDTO {
  nombre: string;
  correoElectronico: string;
  contrasena: string;
  rol: string;
}

export interface UpdateInternalUserRequestDTO {
  nombre: string;
  rol: string;
}
