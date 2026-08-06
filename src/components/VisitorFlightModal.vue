<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  flightDetails: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close'])

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('es-DO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div v-if="show" class="modal-backdrop" @click="emit('close')">
    <div class="modal-container glass-card detail-modal" @click.stop>
      <button class="modal-close" @click="emit('close')">&times;</button>
      
      <!-- Estado de Carga -->
      <div v-if="loading" class="loader-container">
        <div class="pulse-loader"></div>
        <p>Cargando detalles de vuelo...</p>
      </div>

      <!-- Estado de Error -->
      <div v-else-if="error" class="error-container">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="error-icon">
          <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ error }}</p>
        <button @click="emit('close')" class="btn btn-secondary">Cerrar</button>
      </div>

      <!-- Contenido del Detalle -->
      <div v-else-if="flightDetails" class="details-content-view animate-fade-in">
        <div class="details-header">
          <div class="brand-badge-large">
            <span>{{ flightDetails.aerolinea ? flightDetails.aerolinea.charAt(0) : 'V' }}</span>
          </div>
          <div>
            <h2 class="modal-title">{{ flightDetails.numeroVuelo }}</h2>
            <p class="modal-subtitle">{{ flightDetails.aerolinea }}</p>
          </div>
          <div class="status-badge-container">
            <span :class="['badge', `badge-${(flightDetails.estadoActual || 'programado').toLowerCase()}`]">
              {{ flightDetails.estadoActual }}
            </span>
          </div>
        </div>

        <!-- Ruta y Trayecto -->
        <div class="modal-route-summary">
          <div class="endpoint">
            <span class="endpoint-label">Origen</span>
            <span class="endpoint-value">{{ flightDetails.origen }}</span>
          </div>
          <div class="route-arrow">&rarr;</div>
          <div class="endpoint text-right">
            <span class="endpoint-label">Destino</span>
            <span class="endpoint-value">{{ flightDetails.destino }}</span>
          </div>
        </div>

        <!-- Información General -->
        <div class="details-grid animate-fade-in" style="margin-top: 1rem;">
          <div class="detail-group">
            <span class="info-label">Salida Planificada</span>
            <span class="info-value">{{ formatDateTime(flightDetails.horarioPlanificadoSalida) }}</span>
          </div>
          <div class="detail-group">
            <span class="info-label">Llegada Planificada</span>
            <span class="info-value">{{ formatDateTime(flightDetails.horarioPlanificadoLlegada) }}</span>
          </div>
          <div class="detail-group">
            <span class="info-label">Salida Estimada</span>
            <span class="info-value" :class="{ 'estimated-time': flightDetails.horarioEstimadoSalida }">
              {{ flightDetails.horarioEstimadoSalida ? formatDateTime(flightDetails.horarioEstimadoSalida) : 'Sin cambios (A tiempo)' }}
            </span>
          </div>
          <div class="detail-group">
            <span class="info-label">Llegada Estimada</span>
            <span class="info-value" :class="{ 'estimated-time': flightDetails.horarioEstimadoLlegada }">
              {{ flightDetails.horarioEstimadoLlegada ? formatDateTime(flightDetails.horarioEstimadoLlegada) : 'Sin cambios (A tiempo)' }}
            </span>
          </div>
          <div class="detail-group">
            <span class="info-label">Puerta</span>
            <span class="info-value highlight-blue">{{ flightDetails.puerta || 'N/A' }}</span>
          </div>
          <div class="detail-group" v-if="flightDetails.motivoUltimoCambio">
            <span class="info-label">Aviso Importante</span>
            <span class="info-value italic-reason">"{{ flightDetails.motivoUltimoCambio }}"</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal Base Styles */
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
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.4);
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
  color: var(--color-text-secondary, #9ca3af);
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
}

.modal-close:hover {
  color: white;
}

/* Header */
.details-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.brand-badge-large {
  width: 48px;
  height: 48px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.modal-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #9ca3af);
  margin-top: 0.15rem;
}

.status-badge-container {
  margin-left: auto;
}

.badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-programado { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
.badge-completado, .badge-aterrizado { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.badge-cancelado { background: rgba(239, 68, 68, 0.15); color: #f87171; }
.badge-retrasado, .badge-demorado { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
.badge-embarcando, .badge-abordando { background: rgba(139, 92, 246, 0.15); color: #c4b5fd; }
.badge-adelantado { background: rgba(14, 165, 233, 0.15); color: #38bdf8; }

/* Route Summary */
.modal-route-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.endpoint {
  display: flex;
  flex-direction: column;
}
.endpoint.text-right { text-align: right; }

.endpoint-label {
  font-size: 0.75rem;
  color: var(--color-text-muted, #6b7280);
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.endpoint-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
}

.route-arrow {
  color: var(--color-text-muted, #6b7280);
  font-size: 1.25rem;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  background: rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.25rem;
  border-radius: 12px;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.info-label {
  font-size: 0.75rem;
  color: var(--color-text-muted, #6b7280);
  text-transform: uppercase;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #e5e7eb; /* Light gray */
}

.estimated-time {
  color: #f59e0b !important;
}

.highlight-blue {
  color: #60a5fa !important;
  font-size: 1.1rem;
  font-weight: 700;
}

.italic-reason {
  font-style: italic;
  color: #fbbf24 !important;
}

/* Loading & Error */
.loader-container {
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  color: #9ca3af;
}

.pulse-loader {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #3b82f6;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-container {
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #9ca3af;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #ef4444;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.animate-fade-in {
  animation: fadeIn 0.4s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
