import { ref } from 'vue'
import { usersService } from '../services/usersService'
import type { InternalUserDTO, PublicUserDTO } from '../models/UserManagementDTO'

export function useUsers() {
  const internalUsers = ref<InternalUserDTO[]>([])
  const publicUsers = ref<PublicUserDTO[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchInternalUsers = async () => {
    loading.value = true
    error.value = null
    try {
      internalUsers.value = await usersService.getInternalUsers()
    } catch (err: any) {
      console.error('Error fetching internal users:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al obtener usuarios internos.'
    } finally {
      loading.value = false
    }
  }

  const fetchPublicUsers = async () => {
    loading.value = true
    error.value = null
    try {
      publicUsers.value = await usersService.getPublicUsers()
    } catch (err: any) {
      console.error('Error fetching public users:', err)
      error.value = err.response?.data?.errorMessage || err.message || 'Error al obtener usuarios públicos.'
    } finally {
      loading.value = false
    }
  }

  const createInternalUser = async (command: any) => {
    loading.value = true
    error.value = null
    try {
      return await usersService.createInternalUser(command)
    } catch (err: any) {
      console.error('Error creating internal user:', err)
      error.value = err.response?.data?.errorMessage || err.response?.data || 'Error al crear usuario.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateInternalUser = async (id: string, command: any) => {
    loading.value = true
    error.value = null
    try {
      return await usersService.updateInternalUser(id, command)
    } catch (err: any) {
      console.error('Error updating internal user:', err)
      error.value = err.response?.data?.errorMessage || err.response?.data || 'Error al actualizar usuario.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deactivateUser = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      return await usersService.deactivateUser(id)
    } catch (err: any) {
      console.error('Error deactivating user:', err)
      error.value = err.response?.data?.errorMessage || err.response?.data || 'Error al desactivar usuario.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const activateUser = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      return await usersService.activateUser(id)
    } catch (err: any) {
      console.error('Error activating user:', err)
      error.value = err.response?.data?.errorMessage || err.response?.data || 'Error al activar usuario.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    internalUsers,
    publicUsers,
    loading,
    error,
    fetchInternalUsers,
    fetchPublicUsers,
    createInternalUser,
    updateInternalUser,
    deactivateUser,
    activateUser
  }
}
