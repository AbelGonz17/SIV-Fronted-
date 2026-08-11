import { ref } from 'vue'
import { usersService } from '../services/usersService'
import type { InternalUserDTO, PublicUserDTO } from '../models/UserManagementDTO'
import { getErrorMessage } from '../services/apiClient'

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
      error.value = getErrorMessage(err)
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
      error.value = getErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  const createInternalUser = async (command: any) => {
    try {
      return await usersService.createInternalUser(command)
    } catch (err: any) {
      console.error('Error creating internal user:', err)
      throw new Error(getErrorMessage(err))
    }
  }

  const updateInternalUser = async (id: string, command: any) => {
    try {
      return await usersService.updateInternalUser(id, command)
    } catch (err: any) {
      console.error('Error updating internal user:', err)
      throw new Error(getErrorMessage(err))
    }
  }

  const deactivateUser = async (id: string) => {
    try {
      return await usersService.deactivateUser(id)
    } catch (err: any) {
      console.error('Error deactivating user:', err)
      throw new Error(getErrorMessage(err))
    }
  }

  const activateUser = async (id: string) => {
    try {
      return await usersService.activateUser(id)
    } catch (err: any) {
      console.error('Error activating user:', err)
      throw new Error(getErrorMessage(err))
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
