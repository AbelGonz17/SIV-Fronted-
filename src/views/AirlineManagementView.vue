<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAirlines } from '../composables/useAirlines'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

import type { AirlineDTO } from '../models/AirlineDTO'

// Desestructurar composable de aerolíneas
const {
  airlines,
  loading,
  error,
  fetchAirlines,
  createAirline,
  updateAirline,
  deleteAirline
} = useAirlines()

// Buscador local
const searchQuery = ref('')

// Toast notifications state
const toast = ref<{show: boolean, message: string, type: 'success' | 'error'}>({
  show: false,
  message: '',
  type: 'success'
})

const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 4000)
}

// Modal control
const activeModal = ref<'create' | 'edit' | 'delete' | null>(null) // 'create' | 'edit' | 'delete'
const selectedAirline = ref<AirlineDTO | null>(null)
const loadingOperation = ref(false)

// Form fields
const form = ref({
  codigo: '',
  nombre: ''
})

// Filtrado de aerolíneas en cliente
const filteredAirlines = computed(() => {
  if (!searchQuery.value) return airlines.value
  const query = searchQuery.value.toLowerCase().trim()
  return airlines.value.filter(a => 
    (a.nombre || '').toLowerCase().includes(query) || 
    (a.codigo || '').toLowerCase().includes(query)
  )
})

// Cargar catálogo al iniciar
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  await fetchAirlines()
})

// Abrir Modales
const openCreateModal = () => {
  form.value = {
    codigo: '',
    nombre: ''
  }
  activeModal.value = 'create'
}

const openEditModal = (airline: AirlineDTO) => {
  selectedAirline.value = airline
  form.value = {
    codigo: airline.codigo || '',
    nombre: airline.nombre || ''
  }
  activeModal.value = 'edit'
}

const openDeleteModal = (airline: AirlineDTO) => {
  selectedAirline.value = airline
  activeModal.value = 'delete'
}

const closeModal = () => {
  activeModal.value = null
  selectedAirline.value = null
}

// Envíos de Formularios (Acciones API)
const handleCreateAirline = async () => {
  if (!form.value.codigo || !form.value.nombre) {
    showToast('Por favor rellene todos los campos obligatorios.', 'error')
    return
  }

  loadingOperation.value = true
  try {
    const command = {
      codigo: form.value.codigo.toUpperCase().trim(),
      nombre: form.value.nombre.trim()
    }

    await createAirline(command)
    showToast(`La aerolínea "${command.nombre}" fue registrada exitosamente.`)
    closeModal()
    await fetchAirlines()
  } catch (err) {
    showToast(err.message || 'Error al registrar la aerolínea.', 'error')
  } finally {
    loadingOperation.value = false
  }
}

const handleUpdateAirline = async () => {
  if (!form.value.codigo || !form.value.nombre) {
    showToast('Por favor rellene todos los campos obligatorios.', 'error')
    return
  }

  loadingOperation.value = true
  try {
    const command = {
      codigo: form.value.codigo.toUpperCase().trim(),
      nombre: form.value.nombre.trim()
    }

    await updateAirline(selectedAirline.value.id, command)
    showToast(`Datos de la aerolínea actualizados correctamente.`)
    closeModal()
    await fetchAirlines()
  } catch (err) {
    showToast(err.message || 'Error al actualizar la aerolínea.', 'error')
  } finally {
    loadingOperation.value = false
  }
}

const handleDeleteAirline = async () => {
  loadingOperation.value = true
  try {
    await deleteAirline(selectedAirline.value.id)
    showToast(`Aerolínea eliminada exitosamente del catálogo.`)
    closeModal()
    await fetchAirlines()
  } catch (err) {
    showToast(err.message || 'Error al eliminar la aerolínea.', 'error')
  } finally {
    loadingOperation.value = false
  }
}
</script>

<template>
  <div class="page-management container">
    <!-- Toast -->
    <Teleport to="body">
      <Transition name="slide-fade">
        <div v-if="toast.show" :class="['toast-notification', `toast-${toast.type}`]">
          <div class="toast-icon">
            <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
      </Transition>
    </Teleport>

    <!-- Header Section -->
    <header class="management-header">
      <div>
        <h1 class="page-title">Gestión de Aerolíneas</h1>
        <p class="page-subtitle">Catálogo global de aerolíneas autorizadas en el sistema.</p>
      </div>
      <button 
        v-if="authStore.user?.role === 'Administrador'"
        @click="openCreateModal" 
        class="btn btn-primary btn-create"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="margin-right: 0.25rem;">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Agregar Aerolínea
      </button>
    </header>

    <!-- Role Warning if user is not Administrador -->
    <div v-if="authStore.user?.role !== 'Administrador'" class="role-warning-banner glass-card">
      <div class="warning-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div class="warning-body">
        <h4>Modo Consulta (Solo Lectura)</h4>
        <p>Tu rol actual es <strong>{{ authStore.user?.role || 'Desconocido' }}</strong>. Las operaciones de registro, edición y eliminación de aerolíneas están reservadas exclusivamente para usuarios con rol de <strong>Administrador</strong>.</p>
      </div>
    </div>

    <!-- Toolbar / Search Bar -->
    <div class="toolbar-section glass-card" style="margin-bottom: 1.5rem; padding: 1rem 1.5rem;">
      <div class="search-box-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon-svg">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Buscar aerolínea por nombre o código..." 
          class="form-input search-input-field"
        />
      </div>
    </div>

    <!-- Main Table Card -->
    <div class="management-card glass-card">
      <!-- Loading State -->
      <div v-if="loading" class="loader-container">
        <div class="pulse-loader"></div>
        <p>Actualizando catálogo de aerolíneas...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <p class="error-text">{{ error }}</p>
        <button @click="fetchAirlines" class="btn btn-primary">Reintentar</button>
      </div>

      <!-- Table View -->
      <div v-else class="table-wrapper">
        <table class="flights-table">
          <thead>
            <tr>
              <th>Código IATA</th>
              <th>Nombre de Aerolínea</th>
              <th>Identificador Único (GUID)</th>
              <th v-if="authStore.user?.role === 'Administrador'" class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="airline in filteredAirlines" :key="airline.id">
              <td class="font-bold text-primary-color">{{ airline.codigo }}</td>
              <td class="font-semibold text-white">{{ airline.nombre }}</td>
              <td style="font-family: monospace; font-size: 0.8rem; color: var(--color-text-muted);">
                {{ airline.id }}
              </td>
              <td v-if="authStore.user?.role === 'Administrador'" class="text-right actions-cell">
                <div class="action-buttons-group">
                  <button @click="openEditModal(airline)" class="btn-action btn-edit" title="Editar aerolínea">
                    Editar
                  </button>
                  <button @click="openDeleteModal(airline)" class="btn-action btn-cancel" title="Eliminar aerolínea">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredAirlines.length === 0">
              <td colspan="4" class="empty-table-cell">
                No se encontraron aerolíneas que coincidan con la búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Info -->
      <footer class="table-footer">
        <span class="pagination-info">Mostrando {{ filteredAirlines.length }} aerolíneas registradas</span>
      </footer>
    </div>

    <!-- Modals Layer (Teleport) -->
    <Teleport to="body">
      <!-- 1. Registrar / Crear Aerolínea -->
      <div v-if="activeModal === 'create'" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-card" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2 class="modal-title">Agregar Aerolínea</h2>
          <p class="modal-subtitle">Ingrese los datos para dar de alta una nueva aerolínea en el catálogo.</p>
          
          <div class="form-fields">
            <div class="form-group">
              <label class="form-label" for="a-code">Código IATA</label>
              <input id="a-code" v-model="form.codigo" type="text" class="form-input" placeholder="Ej. AA, IB, B6" maxlength="5" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="a-name">Nombre Comercial</label>
              <input id="a-name" v-model="form.nombre" type="text" class="form-input" placeholder="Ej. American Airlines" required />
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary" :disabled="loadingOperation">Cancelar</button>
            <button @click="handleCreateAirline" class="btn btn-primary" :disabled="loadingOperation">
              {{ loadingOperation ? 'Registrando...' : 'Registrar Aerolínea' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Editar Aerolínea -->
      <div v-if="activeModal === 'edit'" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-card" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2 class="modal-title">Editar Aerolínea</h2>
          <p class="modal-subtitle">Modifique los datos comerciales para la aerolínea seleccionada.</p>
          
          <div class="form-fields">
            <div class="form-group">
              <label class="form-label" for="e-code">Código IATA</label>
              <input id="e-code" v-model="form.codigo" type="text" class="form-input" placeholder="Ej. AA, IB, B6" maxlength="5" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="e-name">Nombre Comercial</label>
              <input id="e-name" v-model="form.nombre" type="text" class="form-input" placeholder="Ej. American Airlines" required />
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary" :disabled="loadingOperation">Cancelar</button>
            <button @click="handleUpdateAirline" class="btn btn-primary" :disabled="loadingOperation">
              {{ loadingOperation ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Eliminar Aerolínea -->
      <div v-if="activeModal === 'delete'" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-card" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2 class="modal-title text-danger">Eliminar Aerolínea</h2>
          <p class="modal-subtitle">¿Está seguro de que desea eliminar la aerolínea <strong>{{ selectedAirline?.nombre }}</strong>?</p>
          
          <div class="alert-box-warning" style="margin-top: 1rem; padding: 0.75rem 1rem; border-radius: 6px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: #f87171; font-size: 0.85rem; line-height: 1.4;">
            Esta acción es irreversible y podría causar errores en los vuelos que hagan referencia a esta aerolínea.
          </div>

          <div class="modal-footer" style="margin-top: 1.5rem;">
            <button @click="closeModal" class="btn btn-secondary" :disabled="loadingOperation">Cancelar</button>
            <button @click="handleDeleteAirline" class="btn btn-danger" :disabled="loadingOperation">
              {{ loadingOperation ? 'Eliminando...' : 'Sí, Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page-management {
  animation: fadeIn 0.4s ease forwards;
  padding-bottom: 3rem;
}

/* Header */
.management-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.page-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.page-subtitle {
  color: var(--color-text-secondary);
  font-size: 1rem;
  margin-top: 0.25rem;
}

/* Search Box Toolbar */
.search-box-wrapper {
  position: relative;
  width: 100%;
}

.search-icon-svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
}

.search-input-field {
  padding-left: 2.75rem !important;
  width: 100%;
}

/* Role Warning */
.role-warning-banner {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  margin-bottom: 2rem;
  border-left: 4px solid #eab308;
  background: rgba(234, 179, 8, 0.03);
}

.warning-icon svg {
  width: 28px;
  height: 28px;
  color: #eab308;
}

.warning-body h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #fef08a;
  margin-bottom: 0.25rem;
}

.warning-body p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

/* Management Card & Table */
.management-card {
  padding: 0;
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.flights-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.9rem;
}

.flights-table th {
  background: rgba(255, 255, 255, 0.02);
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 1.25rem 1.5rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
}

.flights-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  vertical-align: middle;
}

.flights-table tbody tr {
  transition: background-color 0.2s;
}

.flights-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.01);
}

.actions-cell {
  padding: 0.75rem 1.5rem !important;
}

.action-buttons-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-action {
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.03);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.btn-edit:hover {
  border-color: rgba(96, 165, 250, 0.4);
  background: rgba(59, 130, 246, 0.1);
  color: #60a5fa;
}

.btn-cancel:hover {
  border-color: rgba(248, 113, 113, 0.4);
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.empty-table-cell {
  text-align: center;
  color: var(--color-text-muted);
  padding: 3rem 1.5rem !important;
  font-style: italic;
}

/* Pagination Footer */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background: rgba(255, 255, 255, 0.01);
  border-top: 1px solid var(--color-border);
}

.pagination-info {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

/* Booking Modal Backdrops */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(4, 7, 13, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: modalFadeIn 0.25s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  width: 100%;
  max-width: 540px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 1.75rem;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 10;
}

.modal-close:hover {
  color: white;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.01em;
}

.modal-subtitle {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-top: 0.35rem;
  margin-bottom: 1.5rem;
}

.form-fields {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-footer {
  margin-top: 2rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Forms and Inputs */
.form-input {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.text-danger {
  color: #f87171;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: white;
  border: none;
}

.btn-danger:hover {
  background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

@media (max-width: 768px) {
  .management-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .btn-create {
    width: 100%;
  }
}
</style>
