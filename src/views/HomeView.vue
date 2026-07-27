<script setup>
import { onMounted, ref } from 'vue'
import { useFlights } from '../composables/useFlights'
import FlightCard from '../components/FlightCard.vue'

const {
  loading,
  error,
  searchFilter,
  filteredFlights,
  stats,
  fetchFlights
} = useFlights()

// Cargar vuelos al montar
onMounted(() => {
  fetchFlights()
})

// Variables para el modal de reserva
const showBookingModal = ref(false)
const selectedFlight = ref(null)
const passengerName = ref('')
const passportNumber = ref('')
const selectedClass = ref('Economy')
const bookingConfirmed = ref(false)
const bookingCode = ref('')

// Abrir modal de reserva
const openBooking = (flight) => {
  selectedFlight.value = flight
  passengerName.value = ''
  passportNumber.value = ''
  selectedClass.value = 'Economy'
  bookingConfirmed.value = false
  showBookingModal.value = true
}

// Confirmar reserva
const confirmBooking = () => {
  if (!passengerName.value || !passportNumber.value) {
    alert('Por favor complete todos los datos del pasajero.')
    return
  }
  
  // Generar código de reserva aleatorio
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  bookingCode.value = code
  bookingConfirmed.value = true
}

// Cerrar modal
const closeModal = () => {
  showBookingModal.value = false
  selectedFlight.value = null
  bookingConfirmed.value = false
}

// Formatear hora para el boleto
const formatTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', hour12: false })
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
    <div class="dashboard-grid">
      <!-- Left Column: Flight List -->
      <div class="flights-section">
        <h3 class="section-title">Listado de Vuelos Disponibles</h3>
        
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
          <div v-if="filteredFlights.length === 0" class="empty-state glass-card">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            <p>No se encontraron vuelos que coincidan con los criterios de búsqueda.</p>
          </div>
          <FlightCard 
            v-for="flight in filteredFlights" 
            :key="flight.id" 
            :flight="flight"
            @book="openBooking"
          />
        </div>
      </div>

      <!-- Right Column: Filters Panel -->
      <aside class="filters-sidebar">
        <div class="filters-card glass-card">
          <h3 class="filters-title">Filtros de Búsqueda</h3>
          <div class="filters-body">
            <!-- Origin Filter -->
            <div class="form-group">
              <label class="form-label" for="filter-origin">Origen (Código o Ciudad)</label>
              <input 
                id="filter-origin" 
                v-model="searchFilter.origin"
                type="text" 
                class="form-input" 
                placeholder="Ej. SDQ, Punta Cana..."
              />
            </div>

            <!-- Destination Filter -->
            <div class="form-group">
              <label class="form-label" for="filter-destination">Destino (Código o Ciudad)</label>
              <input 
                id="filter-destination" 
                v-model="searchFilter.destination"
                type="text" 
                class="form-input" 
                placeholder="Ej. MIA, Madrid..."
              />
            </div>

            <!-- Status Filter -->
            <div class="form-group">
              <label class="form-label" for="filter-status">Estado del Vuelo</label>
              <select id="filter-status" v-model="searchFilter.status" class="form-input select-input">
                <option value="">Todos los Estados</option>
                <option value="On Time">A Tiempo (On Time)</option>
                <option value="Boarding">Abordando (Boarding)</option>
                <option value="Delayed">Retrasado (Delayed)</option>
                <option value="Cancelled">Cancelado (Cancelled)</option>
              </select>
            </div>

            <button 
              @click="searchFilter = { origin: '', destination: '', status: '' }" 
              class="btn btn-secondary btn-clear-filters"
            >
              Restablecer Filtros
            </button>
          </div>
        </div>
      </aside>
    </div>

    <!-- Interactive Booking Modal -->
    <div v-if="showBookingModal" class="modal-backdrop">
      <div class="modal-container glass-card" @click.stop>
        <button class="modal-close" @click="closeModal">&times;</button>
        
        <!-- Form View -->
        <div v-if="!bookingConfirmed" class="booking-form-view">
          <h2 class="modal-title">Formulario de Reserva</h2>
          <p class="modal-subtitle">Reserva de boleto para el vuelo <strong>{{ selectedFlight.flightNumber }}</strong> de {{ selectedFlight.airline }}.</p>
          
          <div class="modal-flight-summary">
            <span class="route-badge">{{ selectedFlight.origin }} &rarr; {{ selectedFlight.destination }}</span>
            <span class="price-badge">${{ selectedFlight.price }} USD</span>
          </div>

          <div class="form-fields">
            <div class="form-group">
              <label class="form-label" for="passenger-name">Nombre Completo del Pasajero</label>
              <input 
                id="passenger-name" 
                v-model="passengerName" 
                type="text" 
                class="form-input" 
                placeholder="Ej. Juan Pérez"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="passport-number">Número de Pasaporte</label>
              <input 
                id="passport-number" 
                v-model="passportNumber" 
                type="text" 
                class="form-input" 
                placeholder="Ej. RD998822"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="class-select">Clase de Asiento</label>
              <select id="class-select" v-model="selectedClass" class="form-input select-input">
                <option value="Economy">Económica (Standard)</option>
                <option value="Business">Ejecutiva (Confort)</option>
                <option value="FirstClass">Primera Clase (Premium)</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary">Cancelar</button>
            <button @click="confirmBooking" class="btn btn-primary">Confirmar Reserva</button>
          </div>
        </div>

        <!-- Ticket Confirmed View (Boarding Pass) -->
        <div v-else class="booking-ticket-view">
          <div class="success-header">
            <div class="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2>¡Reserva Confirmada Exitosamente!</h2>
            <p>Tu pase de abordar digital ha sido generado.</p>
          </div>

          <!-- Digital Boarding Pass Ticket -->
          <div class="boarding-pass">
            <div class="pass-header">
              <span class="pass-brand">SkyFlow Boarding Pass</span>
              <span class="pass-code">CÓDIGO: {{ bookingCode }}</span>
            </div>
            <div class="pass-body">
              <div class="pass-row">
                <div class="pass-col">
                  <span class="pass-label">Pasajero</span>
                  <span class="pass-val">{{ passengerName }}</span>
                </div>
                <div class="pass-col">
                  <span class="pass-label">Pasaporte</span>
                  <span class="pass-val">{{ passportNumber }}</span>
                </div>
              </div>

              <div class="pass-divider">
                <div class="cutout-left"></div>
                <div class="dashed-line"></div>
                <div class="cutout-right"></div>
              </div>

              <div class="pass-row flight-details-row">
                <div class="pass-col">
                  <span class="pass-label">Vuelo</span>
                  <span class="pass-val text-primary-color">{{ selectedFlight.flightNumber }}</span>
                </div>
                <div class="pass-col">
                  <span class="pass-label">Aerolínea</span>
                  <span class="pass-val">{{ selectedFlight.airline }}</span>
                </div>
                <div class="pass-col">
                  <span class="pass-label">Clase</span>
                  <span class="pass-val font-semibold">{{ selectedClass === 'FirstClass' ? 'Primera Clase' : (selectedClass === 'Business' ? 'Ejecutiva' : 'Económica') }}</span>
                </div>
              </div>

              <div class="pass-row route-row">
                <div class="pass-col">
                  <span class="pass-label">Origen</span>
                  <h3 class="airport-code-small">{{ selectedFlight.origin }}</h3>
                  <span class="pass-time">{{ formatTime(selectedFlight.departureTime) }}</span>
                </div>
                <div class="plane-flight-symbol">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1.1.1-1.3.6l-.3.7c-.2.5 0 1.1.4 1.4L9 12l-3 3-2.5-.5c-.4-.1-.8.1-1 .4l-.3.5c-.2.4-.1.9.3 1.1L6 18l1.5 3.5c.2.4.7.5 1.1.3l.5-.3c.3-.2.5-.6.4-1L9 18l3-3 3.1 5.4c.3.5.9.6 1.4.4l.7-.3c.5-.2.7-.8.6-1.3z" />
                  </svg>
                </div>
                <div class="pass-col text-right">
                  <span class="pass-label">Destino</span>
                  <h3 class="airport-code-small">{{ selectedFlight.destination }}</h3>
                  <span class="pass-time">{{ formatTime(selectedFlight.arrivalTime) }}</span>
                </div>
              </div>

              <div class="pass-row footer-row">
                <div class="pass-col">
                  <span class="pass-label">Puerta</span>
                  <span class="pass-val">{{ selectedFlight.gate }}</span>
                </div>
                <div class="pass-col barcode-col">
                  <!-- Simulated Barcode -->
                  <div class="barcode">
                    <span v-for="n in 18" :key="n" :style="{ width: (n % 3 === 0 ? '3px' : (n % 2 === 0 ? '1px' : '2px')), marginRight: (n % 4 === 0 ? '2px' : '1px') }"></span>
                  </div>
                  <span class="barcode-text">SKYFLOW-{{ selectedFlight.id }}-{{ bookingCode }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-primary">Finalizar</button>
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
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

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

.filters-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
</style>
