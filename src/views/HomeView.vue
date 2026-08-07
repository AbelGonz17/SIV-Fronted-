<script setup>
import { onMounted, ref, watch } from 'vue'
import { useFlights, getAirportCode } from '../composables/useFlights'
import { useAuthStore } from '../stores/auth'
import FlightCard from '../components/FlightCard.vue'

const authStore = useAuthStore()

const {
  loading,
  error,
  searchFilter,
  filteredFlights,
  stats,
  totalPages,
  totalCount,
  airlines,
  fetchFlights,
  fetchAirlines,
  fetchAirports,
  fetchFlightDetails
} = useFlights()

// Cargar catálogo y vuelos al montar
onMounted(() => {
  fetchFlights()
  fetchAirlines()
})

// Detalles del vuelo para Admin
const showDetailsModal = ref(false)
const loadingDetails = ref(false)
const errorDetails = ref(null)
const selectedDetails = ref(null)

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('es-DO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const openFlightDetails = async (flightId) => {
  loadingDetails.value = true
  errorDetails.value = null
  showDetailsModal.value = true
  
  try {
    const details = await fetchFlightDetails(flightId)
    selectedDetails.value = details
  } catch (err) {
    errorDetails.value = err?.message || 'No se pudo cargar la información detallada de este vuelo.'
  } finally {
    loadingDetails.value = false
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedDetails.value = null
  errorDetails.value = null
}

// Observar cambios en los filtros de la API y recargar automáticamente
watch(
  () => [
    searchFilter.value.esLlegada,
    searchFilter.value.estado,
    searchFilter.value.fecha,
    searchFilter.value.aerolineaId
  ],
  () => {
    // Volver a la página 1 cuando cambia un filtro de búsqueda
    searchFilter.value.pageNumber = 1
    fetchFlights()
  }
)

// Observar cambios en la paginación
watch(
  () => [searchFilter.value.pageNumber, searchFilter.value.pageSize],
  () => {
    fetchFlights()
  }
)

// Función para reiniciar todos los filtros
const resetFilters = () => {
  searchFilter.value = {
    origin: '',
    destination: '',
    estado: '',
    esLlegada: '',
    fecha: '',
    aerolineaId: '',
    pageNumber: 1,
    pageSize: 20
  };
  searchFilter.value.keyword = '';
  fetchFlights()
}



</script>

<template>
  <div class="container page-dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div>
        <h1 class="page-title">Panel de Control de Vuelos</h1>
        <p class="page-subtitle">Estado del tráfico aéreo en tiempo real y gestión de reservas.</p>
      </div>
      <button @click="fetchFlights" class="btn btn-secondary btn-refresh" :disabled="loading">
        <svg :class="{ 'spin': loading }" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
        Actualizar Vuelos
      </button>
    </header>

    <!-- Stats Section -->
    <section class="stats-row">
      <!-- Total Card -->
      <div class="stat-card glass-card">
        <div class="stat-icon total">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 17 12 22 22 17M2 12 12 17 22 12M2 7 12 12 22 7M12 2 2 7 12 12 22 7 12 2Z" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Total Operando</span>
          <h2 class="stat-value">{{ stats.total }} Vuelos</h2>
        </div>
      </div>

      <!-- On Time Card -->
      <div class="stat-card glass-card">
        <div class="stat-icon ontime">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">A Tiempo</span>
          <h2 class="stat-value">{{ stats.onTime }} Vuelos</h2>
          <span class="stat-meta">{{ stats.onTimePercentage }}% de puntualidad</span>
        </div>
      </div>

      <!-- Delayed Card -->
      <div class="stat-card glass-card">
        <div class="stat-icon delayed">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Retrasados</span>
          <h2 class="stat-value">{{ stats.delayed }} Vuelos</h2>
        </div>
      </div>

      <!-- Cancelled Card -->
      <div class="stat-card glass-card">
        <div class="stat-icon cancelled">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-label">Cancelados</span>
          <h2 class="stat-value">{{ stats.cancelled }} Vuelos</h2>
        </div>
      </div>
    </section>

    <!-- Main Content Area -->
    <div class="dashboard-layout-full">
      <!-- Top Toolbar: Filters -->
      <div class="filters-toolbar glass-card" style="margin-bottom: 1.5rem; padding: 1rem 1.5rem; display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;">
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; flex: 1;">
          <!-- Tipo de Vuelo Filter -->
          <select v-model="searchFilter.esLlegada" class="form-input select-input" style="width: auto; min-width: 150px;">
            <option value="">Todos los vuelos</option>
            <option value="true">Llegadas</option>
            <option value="false">Salidas</option>
          </select>

          <!-- Status Filter -->
          <select v-model="searchFilter.estado" class="form-input select-input" style="width: auto; min-width: 160px;">
            <option value="">Todos los Estados</option>
            <option value="Programado">Programado</option>
            <option value="Embarcando">Embarcando</option>
            <option value="EnVuelo">En Vuelo</option>
            <option value="Aterrizado">Aterrizado</option>
            <option value="Completado">Completado</option>
            <option value="Cancelado">Cancelado</option>
            <option value="Retrasado">Retrasado</option>
            <option value="Adelantado">Adelantado</option>
          </select>
          
          <!-- Date Filter -->
          <input 
            v-model="searchFilter.fecha"
            type="date" 
            class="form-input"
            style="width: auto;"
          />

          <!-- Quick Search (Origin, Dest, Flight Num) -->
          <div style="position: relative; flex: 1; min-width: 200px;">
            <input 
              v-model="searchFilter.keyword"
              type="text" 
              class="form-input" 
              placeholder="Buscar vuelo, ruta o aerolínea..."
            />
          </div>
        </div>
        
        <button @click="resetFilters" class="btn btn-secondary" style="white-space: nowrap;">
          Restablecer
        </button>
      </div>

      <!-- Left Column: Flight List -->
      <div class="flights-section">
        <h3 class="section-title">Listado de Vuelos</h3>
        
        <!-- Loading State -->
        <div v-if="loading" class="loader-container glass-card">
          <div class="pulse-loader"></div>
          <p>Buscando vuelos actualizados en la red aeronáutica...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-container glass-card">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="error-icon">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{{ error }}</p>
          <button @click="fetchFlights" class="btn btn-primary">Reintentar</button>
        </div>

        <!-- Flights List -->
        <div v-else class="flights-list">
          <div class="custom-table-wrapper" style="margin-top: 1rem;">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Vuelo</th>
                  <th>Ruta (Origen ➔ Destino)</th>
                  <th>Horarios</th>
                  <th>Puerta</th>
                  <th>Estado</th>
                  <th v-if="authStore.user?.role === 'Administrador' || authStore.user?.role === 'Operador'" class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="flight in filteredFlights" :key="flight.id">
                  <td>
                    <div style="font-weight: bold; color: var(--color-primary);">{{ flight.numeroVuelo }}</div>
                    <div style="font-size: 0.8rem; color: var(--color-text-secondary);">{{ flight.aerolineaNombre || flight.airline }}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600;">
                      <span :title="flight.origen">{{ getAirportCode(flight.origen) }}</span>
                      <span style="color: var(--color-text-muted); margin: 0 4px;">➔</span>
                      <span :title="flight.destino">{{ getAirportCode(flight.destino) }}</span>
                    </div>
                  </td>
                  <td>
                    <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                      <span :style="{ textDecoration: flight.horarioEstimado && ((flight.estado || '').toLowerCase().includes('retras') || (flight.estado || '').toLowerCase().includes('demor')) ? 'line-through' : 'none', color: flight.horarioEstimado && ((flight.estado || '').toLowerCase().includes('retras') || (flight.estado || '').toLowerCase().includes('demor')) ? 'var(--color-text-muted)' : 'inherit' }">
                        {{ new Date(flight.horarioPlanificado).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }) }}
                      </span>
                      <span v-if="flight.horarioEstimado && ((flight.estado || '').toLowerCase().includes('retras') || (flight.estado || '').toLowerCase().includes('demor'))" style="color: #f59e0b; font-weight: bold; display: flex; align-items: center; gap: 0.25rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {{ new Date(flight.horarioEstimado).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }) }} (Est.)
                      </span>
                    </div>
                  </td>
                  <td>
                    <span class="gate-badge">{{ flight.puertaEmbarque || flight.gate || 'N/A' }}</span>
                  </td>
                  <td>
                    <span :class="['badge', (flight.estado || '').toLowerCase().includes('cancel') ? 'badge-cancelled' : (flight.estado || '').toLowerCase().includes('demor') || (flight.estado || '').toLowerCase().includes('retras') ? 'badge-delayed' : (flight.estado || '').toLowerCase().includes('abord') || (flight.estado || '').toLowerCase().includes('embar') ? 'badge-boarding' : 'badge-ontime']">
                      <span class="badge-dot"></span>
                      {{ flight.estado || 'Programado' }}
                    </span>
                  </td>
                  <td v-if="authStore.user?.role === 'Administrador' || authStore.user?.role === 'Operador'" class="text-right">
                    <button v-if="authStore.user?.role === 'Administrador'" @click="openFlightDetails(flight.id)" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.75rem; font-size: 0.85rem;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      Ver detalles
                    </button>
                    <router-link v-else :to="{ path: '/mantenimiento', query: { flight: flight.numeroVuelo } }" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.75rem; font-size: 0.85rem;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      Gestionar
                    </router-link>
                  </td>
                </tr>
                <tr v-if="filteredFlights.length === 0">
                  <td colspan="6" class="empty-table-cell" style="text-align: center; padding: 2rem;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: var(--color-text-muted);">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <p v-if="searchFilter.estado">No hay vuelos en estado "{{ searchFilter.estado }}" para los criterios seleccionados. 🏖️</p>
                      <p v-else>No se encontraron vuelos que coincidan con los criterios de búsqueda. ✈️</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Paginación Footer -->
          <div v-if="!loading && !error && filteredFlights.length > 0" class="table-footer glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; margin-top: -1rem; border-top-left-radius: 0; border-top-right-radius: 0;">
            <div class="items-per-page" style="display: flex; align-items: center; gap: 0.5rem; color: var(--color-text-secondary); font-size: 0.9rem;">
              <span>Mostrar</span>
              <select v-model="searchFilter.pageSize" class="form-input select-input" style="padding: 0.25rem 2rem 0.25rem 0.75rem; min-height: 32px; height: 32px; width: auto;">
                <option :value="10">10</option>
                <option :value="20">20</option>
                <option :value="50">50</option>
              </select>
              <span>vuelos</span>
            </div>

            <div v-if="totalPages > 1" class="pagination-controls" style="display: flex; align-items: center; gap: 1rem;">
              <span class="pagination-info" style="font-size: 0.9rem; color: var(--color-text-secondary);">
                Mostrando {{ (searchFilter.pageNumber - 1) * searchFilter.pageSize + 1 }}-{{ Math.min(searchFilter.pageNumber * searchFilter.pageSize, totalCount) }} de {{ totalCount }}
              </span>
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-secondary btn-icon" :disabled="searchFilter.pageNumber === 1" @click="searchFilter.pageNumber--" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button class="btn btn-secondary btn-icon" :disabled="searchFilter.pageNumber === totalPages" @click="searchFilter.pageNumber++" style="width: 32px; height: 32px; padding: 0; display: flex; align-items: center; justify-content: center;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>



  </div>

  <!-- Modal de Detalles del Vuelo -->
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
            <span :class="['badge', `badge-${selectedDetails.estadoActual?.toLowerCase() || 'programado'}`]">
              {{ selectedDetails.estadoActual }}
            </span>
          </div>
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
</template>

<style scoped>
.page-dashboard {
  animation: fadeIn 0.4s ease forwards;
}

/* Header */
.dashboard-header {
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

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-card:hover .stat-icon.total { box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); }
.stat-card:hover .stat-icon.ontime { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
.stat-card:hover .stat-icon.delayed { box-shadow: 0 0 20px rgba(245, 158, 11, 0.4); }
.stat-card:hover .stat-icon.cancelled { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon.total {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.stat-icon.ontime {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-accent);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.stat-icon.delayed {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.stat-icon.cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-top: 0.15rem;
}

.stat-meta {
  font-size: 0.75rem;
  color: var(--color-accent);
  margin-top: 0.1rem;
}

/* Left/Right layouts */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1.25rem;
}

.flights-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Sidebar filter */
.filters-card {
  padding: 1.5rem;
  position: sticky;
  top: 90px;
}

.filters-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.75rem;
}

.filter.dashboard-layout-full {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.select-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1.2rem;
  padding-right: 2.5rem;
}

.btn-clear-filters {
  font-size: 0.85rem;
  padding: 0.6rem;
  margin-top: 0.5rem;
}

/* Loader & States */
.loader-container {
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.pulse-loader {
  width: 40px;
  height: 40px;
  background-color: var(--color-primary);
  border-radius: 50%;
  animation: pulse-ring 1.2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
  box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.85);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 15px rgba(59, 130, 246, 0);
  }
  100% {
    transform: scale(0.85);
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.error-container {
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #ef4444;
}

.empty-state {
  padding: 4rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-secondary);
}

.empty-state svg {
  width: 48px;
  height: 48px;
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
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  background: transparent;
  border: none;
  font-size: 2rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
}

.modal-close:hover {
  color: white;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-top: 0.35rem;
}

.modal-flight-summary {
  margin-top: 1.25rem;
  padding: 0.85rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.route-badge {
  color: white;
  font-size: 1rem;
}

.price-badge {
  color: #60a5fa;
  font-size: 1.15rem;
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

/* Success Ticket View */
.success-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.success-icon {
  width: 52px;
  height: 52px;
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon svg {
  width: 28px;
  height: 28px;
}

.success-header h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: white;
}

.success-header p {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* Digital Boarding Pass styling */
.boarding-pass {
  background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.pass-header {
  background: var(--color-primary);
  padding: 0.75rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pass-brand {
  font-weight: 600;
  font-size: 0.8rem;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pass-code {
  font-size: 0.85rem;
  font-weight: 700;
  color: white;
}

.pass-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pass-row {
  display: flex;
  justify-content: space-between;
}

.pass-col {
  display: flex;
  flex-direction: column;
}

.pass-label {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.15rem;
}

.pass-val {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

.text-primary-color {
  color: #60a5fa;
}

.font-semibold {
  font-weight: 600;
}

.pass-divider {
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
  margin: 0 -1.25rem;
}

.cutout-left, .cutout-right {
  width: 14px;
  height: 24px;
  background: var(--color-bg-dark);
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.cutout-left {
  left: 0;
  border-radius: 0 12px 12px 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-left: none;
}

.cutout-right {
  right: 0;
  border-radius: 12px 0 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-right: none;
}

.dashed-line {
  width: 100%;
  border-top: 2px dashed rgba(255, 255, 255, 0.1);
}

.route-row {
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
  padding: 0.75rem;
  border-radius: 8px;
}

.airport-code-small {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.pass-time {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.plane-flight-symbol {
  color: var(--color-primary);
  transform: rotate(90deg);
}

.text-right {
  text-align: right;
  align-items: flex-end;
}

.footer-row {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 0.75rem;
  align-items: center;
}

.barcode-col {
  align-items: flex-end;
}

.barcode {
  display: flex;
  height: 28px;
  background: white;
  padding: 4px;
  border-radius: 2px;
}

.barcode span {
  display: inline-block;
  height: 100%;
  background: black;
}

.barcode-text {
  font-size: 0.55rem;
  color: var(--color-text-muted);
  margin-top: 0.15rem;
  letter-spacing: 0.1em;
}

@media (max-width: 1023px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .btn-refresh {
    width: 100%;
    justify-content: center;
  }
  
  .filters-sidebar {
    order: -1;
  }
  
  .filters-card {
    position: static;
  }
}

/* Pagination styles */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  margin-top: 1.5rem;
  border-color: rgba(255, 255, 255, 0.08);
}

.pagination-info {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.btn-pagination {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  height: auto;
}

/* Details Modal Styles */
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
</style>
