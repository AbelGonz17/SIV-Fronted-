<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFlights } from '../composables/useFlights'
import { useAuthStore } from '../stores/auth'
import { useSignalR } from '../composables/useSignalR'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { startConnection, onFlightChanged, offFlightChanged } = useSignalR()

// Desestructurar composable de vuelos
const {
  flights,
  airlines,
  airports,
  loading,
  error,
  searchFilter,
  filteredFlights,
  totalPages,
  totalCount,
  fetchFlights,
  fetchAirlines,
  fetchAirports,
  createFlight,
  updateFlightBasics,
  updateFlightStatus,
  registerDelay,
  registerAdvance,
  cancelFlight,
  fetchFlightDetails,
  updateFlightFromPayload,
  uploadExcel
} = useFlights()

// File Upload State
const uploadFileInput = ref<HTMLInputElement | null>(null)
const uploadLoading = ref(false)
const showUploadReport = ref(false)
const uploadReport = ref<any>(null)

const triggerFileUpload = () => {
  if (uploadFileInput.value) {
    uploadFileInput.value.click()
  }
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return
  
  const file = target.files[0]
  uploadLoading.value = true
  try {
    const result = await uploadExcel(file)
    uploadReport.value = result
    if (result.totalErrores > 0) {
      showUploadReport.value = true
    } else {
      showToast(`Carga masiva completada. Se programaron ${result.totalExitosos} vuelos exitosamente.`, 'success')
    }
    fetchFlights()
  } catch (error: any) {
    showToast(error.message || 'Error al cargar el archivo Excel', 'error')
  } finally {
    uploadLoading.value = false
    if (uploadFileInput.value) uploadFileInput.value.value = ''
  }
}

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

// Catálogo local para estados del backend
const STATUS_OPTIONS = [
  { value: 0, label: 'Programado' },
  { value: 1, label: 'Embarcando' },
  { value: 2, label: 'En Vuelo' },
  { value: 3, label: 'Aterrizado' },
  { value: 4, label: 'Completado' },
  { value: 5, label: 'Cancelado' },
  { value: 6, label: 'Retrasado' },
  { value: 7, label: 'Adelantado' }
]

// Modal control
const activeModal = ref<'create' | 'edit' | 'status' | 'delay' | 'advance' | 'cancel' | null>(null)
const selectedFlight = ref<any>(null)
const loadingOperation = ref(false)

// Variables para el modal de detalle detallado
const showDetailsModal = ref(false)
const selectedDetails = ref<any>(null)
const loadingDetails = ref(false)
const errorDetails = ref<string | null>(null)

// Form fields
const form = ref({
  numeroVuelo: '',
  aerolinea: '',
  origen: '',
  destino: '',
  horarioPlanificadoSalida: '',
  horarioPlanificadoLlegada: '',
  puerta: '',
  nuevoEstado: 0,
  nuevaHoraSalida: '',
  motivo: ''
})

// Cargar catálogos al iniciar
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  
  // Forzar FIDS a traer páginas
  searchFilter.value.pageSize = 10
  
  // Si venimos redirigidos con un número de vuelo, llenar el buscador
  if (route.query.flight) {
    (searchFilter.value as any).keyword = route.query.flight
  }
  
  await Promise.all([
    fetchFlights(),
    fetchAirlines(),
    fetchAirports()
  ])

  // Iniciar SignalR y escuchar actualizaciones globales
  await startConnection()
  onFlightChanged(handleFlightUpdated)
})

import { onUnmounted } from 'vue'
onUnmounted(() => {
  offFlightChanged(handleFlightUpdated)
})

const handleFlightUpdated = (payload) => {
  updateFlightFromPayload(payload)
}

// Recargar al cambiar de página
watch(() => searchFilter.value.pageNumber, () => {
  fetchFlights()
})

const formatDateTime = (isoString) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleDateString('es-DO', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })
}

// Helper para código IATA
const getAirportCode = (name) => {
  if (!name) return 'N/A'
  const airport = airports.value.find(a => a.nombre === name)
  return airport ? airport.codigo : name.substring(0, 3).toUpperCase()
}

// Abrir Modales
const openCreateModal = () => {
  form.value = {
    numeroVuelo: '',
    aerolinea: '',
    origen: '',
    destino: '',
    horarioPlanificadoSalida: '',
    horarioPlanificadoLlegada: '',
    puerta: ''
  }
  activeModal.value = 'create'
}

const openEditModal = (flight) => {
  showDetailsModal.value = false
  selectedFlight.value = flight
  
  // Mapear los GUIDs de aerolínea y aeropuertos si están disponibles
  // O buscar por coincidencia de nombre en los catálogos correspondientes
  const matchedAirline = airlines.value.find(a => a.nombre === flight.aerolinea)
  const matchedOrigin = airports.value.find(ap => ap.nombre === flight.origen)
  const matchedDest = airports.value.find(ap => ap.nombre === flight.destino)

  form.value = {
    numeroVuelo: flight.numeroVuelo,
    aerolinea: matchedAirline ? matchedAirline.id : '',
    origen: matchedOrigin ? matchedOrigin.id : '',
    destino: matchedDest ? matchedDest.id : '',
    // Convertir ISO string a datetime-local string (YYYY-MM-DDTHH:MM)
    horarioPlanificadoSalida: flight.horarioPlanificadoSalida ? flight.horarioPlanificadoSalida.substring(0, 16) : '',
    horarioPlanificadoLlegada: flight.horarioPlanificadoLlegada ? flight.horarioPlanificadoLlegada.substring(0, 16) : '',
    puerta: flight.puerta || ''
  }
  activeModal.value = 'edit'
}

const openStatusModal = (flight) => {
  showDetailsModal.value = false
  selectedFlight.value = flight
  
  // Buscar índice de estado actual en el catálogo local
  const currentStatusObj = STATUS_OPTIONS.find(s => s.label.toLowerCase() === (flight.estadoActual || flight.estado || '').toLowerCase())
  
  form.value = {
    nuevoEstado: currentStatusObj ? currentStatusObj.value : 0,
    motivo: ''
  }
  activeModal.value = 'status'
}

const openDelayModal = (flight) => {
  showDetailsModal.value = false
  selectedFlight.value = flight
  form.value = {
    nuevaHoraSalida: flight.horarioEstimadoSalida ? flight.horarioEstimadoSalida.substring(0, 16) : (flight.horarioPlanificadoSalida ? flight.horarioPlanificadoSalida.substring(0, 16) : ''),
    motivo: ''
  }
  activeModal.value = 'delay'
}

const openAdvanceModal = (flight) => {
  showDetailsModal.value = false
  selectedFlight.value = flight
  form.value = {
    nuevaHoraSalida: flight.horarioEstimadoSalida ? flight.horarioEstimadoSalida.substring(0, 16) : (flight.horarioPlanificadoSalida ? flight.horarioPlanificadoSalida.substring(0, 16) : ''),
    motivo: ''
  }
  activeModal.value = 'advance'
}

const openCancelModal = (flight) => {
  showDetailsModal.value = false
  selectedFlight.value = flight
  form.value = {
    motivo: ''
  }
  activeModal.value = 'cancel'
}

const openFlightDetails = async (flightId) => {
  // Autocompletar el buscador con el vuelo seleccionado
  const flight = flights.value.find(f => f.id === flightId);
  if (flight && searchFilter.value) {
    (searchFilter.value as any).keyword = flight.numeroVuelo;
  }

  loadingDetails.value = true
  errorDetails.value = null
  showDetailsModal.value = true
  
  try {
    const details = await fetchFlightDetails(flightId)
    selectedDetails.value = details
  } catch (err) {
    errorDetails.value = err.message || 'No se pudo cargar la información detallada de este vuelo.'
  } finally {
    loadingDetails.value = false
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedDetails.value = null
  errorDetails.value = null
}

const closeModal = () => {
  activeModal.value = null
  selectedFlight.value = null
}

// Envíos de Formularios (Acciones API)
const handleCreateFlight = async () => {
  if (!form.value.numeroVuelo || !form.value.aerolinea || !form.value.origen || !form.value.destino || !form.value.horarioPlanificadoSalida || !form.value.horarioPlanificadoLlegada) {
    showToast('Por favor rellene todos los campos obligatorios.', 'error')
    return
  }

  loadingOperation.value = true
  try {
    const command = {
      numeroVuelo: form.value.numeroVuelo,
      aerolinea: form.value.aerolinea,
      origen: form.value.origen,
      destino: form.value.destino,
      horarioPlanificadoSalida: form.value.horarioPlanificadoSalida,
      horarioPlanificadoLlegada: form.value.horarioPlanificadoLlegada,
      puerta: form.value.puerta || 'Por asignar'
    }

    await createFlight(command)
    showToast(`El vuelo ${command.numeroVuelo} fue programado exitosamente.`)
    closeModal()
    fetchFlights()
  } catch (err) {
    showToast(err.message || 'Error al programar el vuelo.', 'error')
  } finally {
    loadingOperation.value = false
  }
}

const handleUpdateBasics = async () => {
  if (!form.value.aerolinea || !form.value.origen || !form.value.destino || !form.value.horarioPlanificadoSalida || !form.value.horarioPlanificadoLlegada) {
    showToast('Por favor rellene todos los campos obligatorios.', 'error')
    return
  }

  loadingOperation.value = true
  try {
    const requestBody = {
      aerolinea: form.value.aerolinea,
      origen: form.value.origen,
      destino: form.value.destino,
      horarioPlanificadoSalida: form.value.horarioPlanificadoSalida,
      horarioPlanificadoLlegada: form.value.horarioPlanificadoLlegada,
      puerta: form.value.puerta || 'Por asignar'
    }

    await updateFlightBasics(selectedFlight.value.id, requestBody)
    showToast(`Datos básicos del vuelo ${selectedFlight.value.numeroVuelo} actualizados.`)
    closeModal()
    fetchFlights()
  } catch (err) {
    showToast(err.message || 'Error al actualizar datos del vuelo.', 'error')
  } finally {
    loadingOperation.value = false
  }
}

const handleUpdateStatus = async () => {
  if (!form.value.motivo) {
    showToast('Debe ingresar un motivo para el cambio de estado.', 'error')
    return
  }

  loadingOperation.value = true
  try {
    const command = {
      vueloId: selectedFlight.value.id,
      nuevoEstado: parseInt(form.value.nuevoEstado),
      motivoCambio: form.value.motivo
    }

    await updateFlightStatus(command)
    showToast(`Estado del vuelo actualizado correctamente.`)
    closeModal()
    fetchFlights()
  } catch (err) {
    showToast(err.message || 'Error al actualizar el estado del vuelo.', 'error')
  } finally {
    loadingOperation.value = false
  }
}

const handleRegisterDelay = async () => {
  if (!form.value.nuevaHoraSalida || !form.value.motivo) {
    showToast('Rellene la nueva hora de salida y el motivo del retraso.', 'error')
    return
  }

  loadingOperation.value = true
  try {
    const command = {
      vueloId: selectedFlight.value.id,
      nuevaHoraSalida: form.value.nuevaHoraSalida,
      motivo: form.value.motivo
    }

    await registerDelay(command)
    showToast(`Retraso registrado correctamente para el vuelo.`)
    closeModal()
    fetchFlights()
  } catch (err) {
    showToast(err.message || 'Error al registrar el retraso.', 'error')
  } finally {
    loadingOperation.value = false
  }
}

const handleRegisterAdvance = async () => {
  if (!form.value.nuevaHoraSalida || !form.value.motivo) {
    showToast('Rellene la nueva hora de salida y el motivo del adelanto.', 'error')
    return
  }

  loadingOperation.value = true
  try {
    const command = {
      vueloId: selectedFlight.value.id,
      nuevaHoraSalida: form.value.nuevaHoraSalida,
      motivo: form.value.motivo
    }

    await registerAdvance(command)
    showToast(`Adelanto operativo registrado correctamente.`)
    closeModal()
    fetchFlights()
  } catch (err) {
    showToast(err.message || 'Error al registrar el adelanto.', 'error')
  } finally {
    loadingOperation.value = false
  }
}

const handleCancelFlight = async () => {
  if (!form.value.motivo) {
    showToast('Debe ingresar un motivo para cancelar el vuelo.', 'error')
    return
  }

  loadingOperation.value = true
  try {
    const command = {
      vueloId: selectedFlight.value.id,
      motivo: form.value.motivo
    }

    await cancelFlight(command)
    showToast(`Vuelo cancelado exitosamente.`)
    closeModal()
    fetchFlights()
  } catch (err) {
    showToast(err.message || 'Error al cancelar el vuelo.', 'error')
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
        <h1 class="page-title">Gestión Operativa de Vuelos</h1>
        <p class="page-subtitle">Panel de operaciones y reprogramación en tiempo real para Operadores.</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <input type="file" ref="uploadFileInput" accept=".xlsx" style="display: none;" @change="handleFileUpload" />
        <button 
          v-if="authStore.user?.role === 'Operador'"
          @click="triggerFileUpload" 
          class="btn btn-secondary btn-create"
          :disabled="uploadLoading"
        >
          <svg v-if="!uploadLoading" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="margin-right: 0.25rem;">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span v-else class="spinner-small" style="margin-right: 0.25rem; display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: #fff; animation: spin 1s ease-in-out infinite;"></span>
          {{ uploadLoading ? 'Cargando...' : 'Cargar Excel' }}
        </button>

        <button 
          v-if="authStore.user?.role === 'Operador'"
          @click="openCreateModal" 
          class="btn btn-primary btn-create"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="margin-right: 0.25rem;">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Programar Vuelo
        </button>
      </div>
    </header>

    <!-- Role Warning if user is not Operador -->
    <div v-if="authStore.user?.role !== 'Operador'" class="role-warning-banner glass-card">
      <div class="warning-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div class="warning-body">
        <h4>Modo Consulta (Solo Lectura)</h4>
        <p>Tu rol actual es <strong>{{ authStore.user?.role || 'Desconocido' }}</strong>. Las operaciones de programación, edición de datos básicos, demoras, adelantos y cancelaciones están reservadas exclusivamente para usuarios con rol de <strong>Operador</strong>.</p>
      </div>
    </div>

    <!-- Main Table Card -->
    <div class="management-card glass-card">
      <!-- Loading State -->
      <div v-if="loading" class="loader-container">
        <div class="pulse-loader"></div>
        <p>Actualizando lista de vuelos de la terminal...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-container">
        <p class="error-text">{{ error }}</p>
        <button @click="fetchFlights" class="btn btn-primary">Reintentar</button>
      </div>

      <div v-else>
        <!-- Search Toolbar -->
        <div class="toolbar-section glass-card single-row-toolbar">
        <div class="search-box-wrapper toolbar-item-search">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon-svg">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            v-model="(searchFilter as any).keyword" 
            type="text" 
            placeholder="Buscador por vuelos" 
            class="form-input search-input-field"
          />
        </div>

        <div class="toolbar-item">
          <select v-model="searchFilter.estado" class="form-input form-select">
            <option value="">Todos los Estados</option>
            <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.label">{{ s.label }}</option>
          </select>
        </div>
        
        <div class="toolbar-actions">
          <button @click="searchFilter.keyword = ''; searchFilter.estado = '';" class="btn btn-secondary btn-clear">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" style="margin-right: 0.35rem;">
              <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Limpiar
          </button>
        </div>
      </div>
        
      <!-- Table View -->
      <div class="custom-table-wrapper">
          <table class="custom-table">
          <thead>
            <tr>
              <th>Vuelo</th>
              <th>Aerolínea</th>
              <th>Ruta</th>
              <th>Horario Planificado</th>
              <th>Horario Estimado</th>
              <th>Puerta</th>
              <th>Estado</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="flight in filteredFlights" :key="flight.id">
              <td class="font-bold text-white">{{ flight.numeroVuelo }}</td>
              <td>{{ flight.aerolineaNombre }}</td>
              <td>
                <div class="route-display">
                  <div style="display: flex; flex-direction: column;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span class="route-point font-bold text-white" :title="flight.origen">{{ getAirportCode(flight.origen) }}</span>
                      <span class="route-arrow">&rarr;</span>
                      <span class="route-point font-bold text-white" :title="flight.destino">{{ getAirportCode(flight.destino) }}</span>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px;">
                      {{ flight.origen }} &rarr; {{ flight.destino }}
                    </span>
                  </div>
                </div>
              </td>
              <td>{{ formatDateTime(flight.horarioPlanificado) }}</td>
              <td>
                <span :class="{ 'estimated-time': flight.horarioEstimado }">
                  {{ flight.horarioEstimado ? formatDateTime(flight.horarioEstimado) : 'Sin cambios' }}
                </span>
              </td>
              <td class="font-bold text-primary-color">{{ flight.puertaEmbarque || 'N/A' }}</td>
              <td>
                <span :class="['status-badge', `badge-${(flight.estado || '').toLowerCase().replace(' ', '-')}`]">
                  {{ flight.estado }}
                </span>
              </td>
              <td class="text-center" style="width: 140px;">
                <div class="action-buttons-group" style="display: flex; gap: 0.4rem; justify-content: center;">
                  <button 
                    v-if="authStore.user?.role === 'Operador'" 
                    @click="openFlightDetails(flight.id)" 
                    class="btn btn-primary" 
                    style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 6px;"
                  >
                    Gestionar
                  </button>
                  <button 
                    v-else 
                    @click="openFlightDetails(flight.id)" 
                    class="btn btn-secondary" 
                    style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 6px;"
                  >
                    Detalles
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredFlights.length === 0">
              <td colspan="8" class="empty-table-cell">
                No hay vuelos registrados o no coinciden con tu búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

        <!-- Pagination Footer -->
        <footer class="table-footer">
          <span class="pagination-info">Mostrando {{ filteredFlights.length }} de {{ totalCount }} vuelos</span>
          <div class="pagination-buttons">
            <button 
              @click="searchFilter.pageNumber--" 
              :disabled="searchFilter.pageNumber <= 1"
              class="btn btn-secondary btn-pagination"
            >
              Anterior
            </button>
            <span class="page-number-display">Pág. {{ searchFilter.pageNumber }} de {{ totalPages }}</span>
            <button 
              @click="searchFilter.pageNumber++" 
              :disabled="searchFilter.pageNumber >= totalPages"
              class="btn btn-secondary btn-pagination"
            >
              Siguiente
            </button>
          </div>
        </footer>
      </div>
    </div>

    <!-- Modals Layer (Rendered conditionally) -->
    <Teleport to="body">
      <!-- 1. Registrar / Crear Vuelo -->
      <div v-if="activeModal === 'create'" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-card" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2 class="modal-title">Programar Nuevo Vuelo</h2>
          <p class="modal-subtitle">Ingrese los datos para registrar la salida o llegada de una aeronave.</p>
          
          <div class="form-fields">
            <div class="form-group">
              <label class="form-label" for="c-number">Número de Vuelo</label>
              <input id="c-number" v-model="form.numeroVuelo" type="text" class="form-input" placeholder="Ej. AA-1020" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="c-airline">Aerolínea</label>
              <select id="c-airline" v-model="form.aerolinea" class="form-input select-input" required>
                <option value="">Seleccione aerolínea</option>
                <option v-for="a in airlines" :key="a.id" :value="a.id">{{ a.nombre }}</option>
              </select>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="c-origin">Aeropuerto de Origen</label>
                <select id="c-origin" v-model="form.origen" class="form-input select-input" required>
                  <option value="">Seleccione origen</option>
                  <option v-for="ap in airports" :key="ap.id" :value="ap.id">{{ ap.nombre }} ({{ ap.codigo }})</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="c-destination">Aeropuerto de Destino</label>
                <select id="c-destination" v-model="form.destino" class="form-input select-input" required>
                  <option value="">Seleccione destino</option>
                  <option v-for="ap in airports" :key="ap.id" :value="ap.id">{{ ap.nombre }} ({{ ap.codigo }})</option>
                </select>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="c-dep-time">Salida Planificada</label>
                <input id="c-dep-time" v-model="form.horarioPlanificadoSalida" type="datetime-local" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="c-arr-time">Llegada Planificada</label>
                <input id="c-arr-time" v-model="form.horarioPlanificadoLlegada" type="datetime-local" class="form-input" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="c-gate">Puerta de Embarque</label>
              <input id="c-gate" v-model="form.puerta" type="text" class="form-input" placeholder="Ej. A02" />
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary" :disabled="loadingOperation">Cancelar</button>
            <button @click="handleCreateFlight" class="btn btn-primary" :disabled="loadingOperation">
              {{ loadingOperation ? 'Registrando...' : 'Programar Vuelo' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Editar Datos Básicos -->
      <div v-if="activeModal === 'edit'" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-card" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2 class="modal-title">Editar Datos Básicos</h2>
          <p class="modal-subtitle">Modifique los detalles operativos planificados para el vuelo {{ selectedFlight?.numeroVuelo }}.</p>
          
          <div class="form-fields">
            <div class="form-group">
              <label class="form-label" for="e-airline">Aerolínea</label>
              <select id="e-airline" v-model="form.aerolinea" class="form-input select-input" required>
                <option value="">Seleccione aerolínea</option>
                <option v-for="a in airlines" :key="a.id" :value="a.id">{{ a.nombre }}</option>
              </select>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="e-origin">Aeropuerto de Origen</label>
                <select id="e-origin" v-model="form.origen" class="form-input select-input" required>
                  <option value="">Seleccione origen</option>
                  <option v-for="ap in airports" :key="ap.id" :value="ap.id">{{ ap.nombre }} ({{ ap.codigo }})</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="e-destination">Aeropuerto de Destino</label>
                <select id="e-destination" v-model="form.destino" class="form-input select-input" required>
                  <option value="">Seleccione destino</option>
                  <option v-for="ap in airports" :key="ap.id" :value="ap.id">{{ ap.nombre }} ({{ ap.codigo }})</option>
                </select>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label" for="e-dep-time">Salida Planificada</label>
                <input id="e-dep-time" v-model="form.horarioPlanificadoSalida" type="datetime-local" class="form-input" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="e-arr-time">Llegada Planificada</label>
                <input id="e-arr-time" v-model="form.horarioPlanificadoLlegada" type="datetime-local" class="form-input" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="e-gate">Puerta de Embarque</label>
              <input id="e-gate" v-model="form.puerta" type="text" class="form-input" placeholder="Ej. A02" />
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary" :disabled="loadingOperation">Cancelar</button>
            <button @click="handleUpdateBasics" class="btn btn-primary" :disabled="loadingOperation">
              {{ loadingOperation ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 3. Cambiar Estado -->
      <div v-if="activeModal === 'status'" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-card" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2 class="modal-title">Cambiar Estado de Vuelo</h2>
          <p class="modal-subtitle">Actualice el estado del vuelo {{ selectedFlight?.numeroVuelo }} y registre un motivo.</p>
          
          <div class="form-fields">
            <div class="form-group">
              <label class="form-label" for="s-state">Nuevo Estado</label>
              <select id="s-state" v-model="form.nuevoEstado" class="form-input select-input" required>
                <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="s-reason">Motivo / Causa del Cambio</label>
              <textarea id="s-reason" v-model="form.motivo" class="form-input textarea-input" placeholder="Ej. Aeronave en puerta y lista para abordaje" required></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary" :disabled="loadingOperation">Cancelar</button>
            <button @click="handleUpdateStatus" class="btn btn-primary" :disabled="loadingOperation">
              {{ loadingOperation ? 'Procesando...' : 'Cambiar Estado' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 4. Registrar Retraso -->
      <div v-if="activeModal === 'delay'" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-card" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2 class="modal-title">Registrar Retraso de Vuelo</h2>
          <p class="modal-subtitle">Establezca la nueva hora estimada de salida para el vuelo {{ selectedFlight?.numeroVuelo }}.</p>
          
          <div class="form-fields">
            <div class="form-group">
              <label class="form-label" for="d-time">Nueva Hora Estimada de Salida</label>
              <input id="d-time" v-model="form.nuevaHoraSalida" type="datetime-local" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="d-reason">Motivo del Retraso</label>
              <textarea id="d-reason" v-model="form.motivo" class="form-input textarea-input" placeholder="Ej. Retraso de vuelo de conexión debido a mal tiempo meteorológico." required></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary" :disabled="loadingOperation">Cancelar</button>
            <button @click="handleRegisterDelay" class="btn btn-primary btn-warning-action" :disabled="loadingOperation">
              {{ loadingOperation ? 'Registrando...' : 'Registrar Retraso' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 5. Registrar Adelanto -->
      <div v-if="activeModal === 'advance'" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-card" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2 class="modal-title">Registrar Adelanto Operativo</h2>
          <p class="modal-subtitle">Establezca una hora de salida adelantada para el vuelo {{ selectedFlight?.numeroVuelo }}.</p>
          
          <div class="form-fields">
            <div class="form-group">
              <label class="form-label" for="ad-time">Nueva Hora Estimada de Salida</label>
              <input id="ad-time" v-model="form.nuevaHoraSalida" type="datetime-local" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="ad-reason">Motivo del Adelanto</label>
              <textarea id="ad-reason" v-model="form.motivo" class="form-input textarea-input" placeholder="Ej. Tránsito aéreo despejado y preparación rápida de la tripulación." required></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary" :disabled="loadingOperation">Cancelar</button>
            <button @click="handleRegisterAdvance" class="btn btn-primary" :disabled="loadingOperation">
              {{ loadingOperation ? 'Registrando...' : 'Registrar Adelanto' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 6. Cancelar Vuelo -->
      <div v-if="activeModal === 'cancel'" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-card" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2 class="modal-title text-danger">Cancelar Vuelo</h2>
          <p class="modal-subtitle">¿Está seguro de cancelar el vuelo {{ selectedFlight?.numeroVuelo }}? Esta acción es irreversible.</p>
          
          <div class="form-fields">
            <div class="form-group">
              <label class="form-label" for="cn-reason">Motivo de Cancelación</label>
              <textarea id="cn-reason" v-model="form.motivo" class="form-input textarea-input" placeholder="Ej. Problemas mecánicos graves en la aeronave imposibles de resolver localmente." required></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary" :disabled="loadingOperation">No, Cancelar</button>
            <button @click="handleCancelFlight" class="btn btn-danger" :disabled="loadingOperation">
              {{ loadingOperation ? 'Cancelando...' : 'Sí, Cancelar Vuelo' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 7. Detalle de Vuelo (Historial y Auditoría) -->
      <div v-if="showDetailsModal" class="modal-backdrop" @click="closeDetailsModal">
        <div class="modal-container glass-card detail-modal" @click.stop>
          <button class="modal-close" @click="closeDetailsModal">&times;</button>
          
          <!-- Estado de Carga -->
          <div v-if="loadingDetails" class="loader-container">
            <div class="pulse-loader"></div>
            <p>Cargando detalles de vuelo e historial...</p>
          </div>

          <!-- Estado de Error -->
          <div v-else-if="errorDetails" class="error-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="error-icon">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>{{ errorDetails }}</p>
            <button @click="closeDetailsModal" class="btn btn-secondary">Cerrar</button>
          </div>

          <!-- Contenido del Detalle -->
          <div v-else-if="selectedDetails" class="details-content-view animate-fade-in">
            <div class="details-header">
              <div class="brand-badge-large">
                <span>{{ selectedDetails.aerolinea ? selectedDetails.aerolinea.charAt(0) : 'V' }}</span>
              </div>
              <div>
                <h2 class="modal-title">{{ selectedDetails.numeroVuelo }}</h2>
                <p class="modal-subtitle">{{ selectedDetails.aerolinea }}</p>
              </div>
              <div class="status-badge-container">
                <span :class="['status-badge', `badge-${(selectedDetails.estadoActual || 'programado').toLowerCase().replace(' ', '-')}`]">
                  {{ selectedDetails.estadoActual }}
                </span>
              </div>
            </div>

            <!-- Botones de Operación (Solo para Operador) -->
            <div v-if="authStore.user?.role === 'Operador'" class="operation-actions-bar" style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.5rem;">
              <button @click="openEditModal(selectedDetails)" class="btn btn-secondary btn-sm" title="Editar datos básicos">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Editar
              </button>
              <button @click="openStatusModal(selectedDetails)" class="btn btn-secondary btn-sm" style="color: #c084fc; border-color: rgba(167, 139, 250, 0.4);" title="Cambiar estado del vuelo">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Estado
              </button>
              <button @click="openDelayModal(selectedDetails)" class="btn btn-secondary btn-sm" style="color: #fbbf24; border-color: rgba(251, 191, 36, 0.4);" title="Registrar retraso">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Retrasar
              </button>
              <button @click="openAdvanceModal(selectedDetails)" class="btn btn-secondary btn-sm" style="color: #34d399; border-color: rgba(52, 211, 153, 0.4);" title="Registrar adelanto operativo">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
                Adelantar
              </button>
              <button @click="openCancelModal(selectedDetails)" class="btn btn-danger btn-sm" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 6px;" title="Cancelar vuelo">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                Cancelar
              </button>
            </div>

            <!-- Ruta y Trayecto -->
            <div class="modal-route-summary">
              <div class="endpoint">
                <span class="endpoint-label">Origen</span>
                <span class="endpoint-value">{{ selectedDetails.origen }}</span>
              </div>
              <div class="route-arrow">&rarr;</div>
              <div class="endpoint text-right">
                <span class="endpoint-label">Destino</span>
                <span class="endpoint-value">{{ selectedDetails.destino }}</span>
              </div>
            </div>

            <!-- Información General -->
            <div class="details-grid animate-fade-in" style="margin-top: 1rem;">
              <div class="detail-group">
                <span class="info-label">Salida Planificada</span>
                <span class="info-value">{{ formatDateTime(selectedDetails.horarioPlanificadoSalida) }}</span>
              </div>
              <div class="detail-group">
                <span class="info-label">Llegada Planificada</span>
                <span class="info-value">{{ formatDateTime(selectedDetails.horarioPlanificadoLlegada) }}</span>
              </div>
              <div class="detail-group">
                <span class="info-label">Salida Estimada</span>
                <span class="info-value" :class="{ 'estimated-time': selectedDetails.horarioEstimadoSalida }">
                  {{ selectedDetails.horarioEstimadoSalida ? formatDateTime(selectedDetails.horarioEstimadoSalida) : 'Sin cambios (A tiempo)' }}
                </span>
              </div>
              <div class="detail-group">
                <span class="info-label">Llegada Estimada</span>
                <span class="info-value" :class="{ 'estimated-time': selectedDetails.horarioEstimadoLlegada }">
                  {{ selectedDetails.horarioEstimadoLlegada ? formatDateTime(selectedDetails.horarioEstimadoLlegada) : 'Sin cambios (A tiempo)' }}
                </span>
              </div>
              <div class="detail-group">
                <span class="info-label">Puerta</span>
                <span class="info-value highlight-blue">{{ selectedDetails.puerta || 'N/A' }}</span>
              </div>
              <div class="detail-group">
                <span class="info-label">Motivo de Último Cambio</span>
                <span class="info-value italic-reason">"{{ selectedDetails.motivoUltimoCambio || 'Sin modificaciones' }}"</span>
              </div>
            </div>

            <!-- Historial de Estados -->
            <div v-if="selectedDetails.historialEstados && selectedDetails.historialEstados.length > 0" class="history-section">
              <h3 class="history-title">Historial de Cambios de Estado</h3>
              <div class="timeline">
                <div v-for="(h, idx) in selectedDetails.historialEstados" :key="idx" class="timeline-item">
                  <div class="timeline-badge-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-header">
                      <span class="timeline-transition">
                        {{ h.estadoAnterior }} &rarr; <strong class="text-white">{{ h.estadoNuevo }}</strong>
                      </span>
                      <span class="timeline-date">{{ formatDateTime(h.fechaHora) }}</span>
                    </div>
                    <div class="timeline-user">
                      <span>Responsable: <strong>{{ h.usuarioResponsable }}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Upload Report Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showUploadReport" class="modal-backdrop" @click="showUploadReport = false">
          <div class="modal-container" @click.stop style="max-width: 600px;">
            <button class="modal-close" @click="showUploadReport = false">&times;</button>
            <h2 class="modal-title">Resultado de Carga Masiva</h2>
            <p class="modal-subtitle">Se encontraron errores durante la importación.</p>

            <div v-if="uploadReport" class="form-fields">
              <div class="role-warning-banner glass-card" style="margin-bottom: 1rem; border-left-color: #ef4444; background: rgba(239, 68, 68, 0.05);">
                <div class="warning-body">
                  <h4>Resumen</h4>
                  <p>
                    Vuelos procesados: <strong>{{ uploadReport.totalProcesados }}</strong><br />
                    Importados exitosamente: <strong>{{ uploadReport.totalExitosos }}</strong><br />
                    Errores encontrados: <strong style="color: #f87171;">{{ uploadReport.totalErrores }}</strong>
                  </p>
                </div>
              </div>
              
              <h4 style="color: white; margin-bottom: 0.5rem;">Detalles de Errores:</h4>
              <div style="max-height: 300px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px;">
                <ul style="margin: 0; padding-left: 1.5rem; color: #f87171; font-size: 0.9rem;">
                  <li v-for="(err, idx) in uploadReport.errores" :key="idx" style="margin-bottom: 0.5rem;">
                    <strong>Fila {{ err.fila }}:</strong> {{ err.mensaje }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="modal-footer">
              <button @click="showUploadReport = false" class="btn btn-secondary">Cerrar</button>
            </div>
          </div>
        </div>
      </Transition>
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

/* Toolbar Toolbar (Single Row) */
.single-row-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: nowrap;
}

.toolbar-item {
  min-width: 180px;
}

.toolbar-item-search {
  flex: 1;
}

.form-select {
  padding: 0.5rem 1rem;
  background: var(--color-bg-light);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: white;
}

.toolbar-actions {
  display: flex;
  align-items: center;
}

.btn-clear {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
}

/* Search Box Wrapper */
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
.search-input-field::placeholder {
  color: #9ca3af;
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

.route-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.route-point {
  color: white;
}

.route-arrow {
  color: var(--color-primary);
  font-weight: bold;
}

.estimated-time {
  color: #f59e0b;
  font-weight: 600;
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

.btn-status:hover {
  border-color: rgba(167, 139, 250, 0.4);
  background: rgba(139, 92, 246, 0.1);
  color: #c084fc;
}

.btn-delay:hover {
  border-color: rgba(251, 191, 36, 0.4);
  background: rgba(245, 158, 11, 0.1);
  color: #fbbf24;
}

.btn-advance:hover {
  border-color: rgba(52, 211, 153, 0.4);
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
}

.btn-cancel:hover {
  border-color: rgba(248, 113, 113, 0.4);
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.btn-detail:hover {
  border-color: rgba(96, 240, 240, 0.4);
  background: rgba(6, 182, 212, 0.1);
  color: #22d3ee;
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

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-number-display {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 500;
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
  max-width: 720px;
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

.select-input {
  max-width: 100%;
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.textarea-input {
  min-height: 80px;
  resize: vertical;
}


/* Custom Warning Action */
.btn-warning-action {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: white;
  border: none;
}

.btn-warning-action:hover {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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

/* Details Modal Styles */
.detail-modal {
  max-width: 720px;
  overflow-y: auto;
  max-height: 90vh;
}

.details-content-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.details-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
}

.brand-badge-large {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #1e40af 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.status-badge-container {
  margin-left: auto;
}

.modal-route-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--color-border);
  padding: 1.25rem;
  border-radius: 10px;
}

.modal-route-summary .endpoint {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.endpoint-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.endpoint-value {
  font-size: 1.15rem;
  font-weight: 600;
  color: white;
}

.route-arrow {
  font-size: 1.5rem;
  color: var(--color-primary);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.info-value {
  font-size: 0.9rem;
  color: white;
  font-weight: 500;
}

.italic-reason {
  font-style: italic;
  color: var(--color-text-secondary);
}

.highlight-blue {
  color: #60a5fa;
  font-weight: 700;
}

/* History Section */
.history-section {
  border-top: 1px solid var(--color-border);
  padding-top: 1.25rem;
  margin-top: 0.5rem;
}

.history-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1rem;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  padding-left: 1.25rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: var(--color-border);
}

.timeline-item {
  position: relative;
}

.timeline-badge-dot {
  position: absolute;
  left: -20px;
  top: 6px;
  width: 10px;
  height: 10px;
  background: var(--color-primary);
  border-radius: 50%;
  border: 2px solid var(--color-bg-dark);
}

.timeline-content {
  background: rgba(255, 255, 255, 0.01);
  border: 1px solid var(--color-border);
  padding: 0.85rem 1rem;
  border-radius: 8px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}

.timeline-transition {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.timeline-date {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.timeline-user {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.timeline-user code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-family: monospace;
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

  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* Status Badges */
.status-badge {
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: inline-block;
  white-space: nowrap;
}

.badge-programado { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
.badge-retrasado { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
.badge-embarcando { background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139,92,246,0.3); }
.badge-cancelado { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
.badge-en-vuelo { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
.badge-aterrizado { background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(236,72,153,0.3); }
.badge-completado { background: rgba(20, 184, 166, 0.15); color: #2dd4bf; border: 1px solid rgba(20,184,166,0.3); }
.badge-adelantado { background: rgba(14, 165, 233, 0.15); color: #38bdf8; border: 1px solid rgba(14,165,233,0.3); }

.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
}
</style>
