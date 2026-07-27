<script setup>
import { computed } from 'vue'

const props = defineProps({
  flight: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['book'])

// Formatear fechas y horas
const formatTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatDate = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('es-DO', { month: 'short', day: 'numeric' })
}

// Computar clase del badge de estado
const statusClass = computed(() => {
  const status = props.flight.status.toLowerCase().replace(' ', '')
  return `badge-${status}`
})

const statusLabel = computed(() => {
  switch (props.flight.status) {
    case 'On Time': return 'A Tiempo'
    case 'Delayed': return 'Retrasado'
    case 'Cancelled': return 'Cancelado'
    case 'Boarding': return 'Abordando'
    default: return props.flight.status
  }
})
</script>

<template>
  <div class="flight-card glass-card animate-fade-in">
    <!-- Card Header: Airline & Flight Code & Status -->
    <div class="card-header">
      <div class="airline-info">
        <div class="airline-logo-placeholder">
          <span>{{ flight.airline.charAt(0) }}</span>
        </div>
        <div>
          <h4 class="airline-name">{{ flight.airline }}</h4>
          <span class="flight-code">{{ flight.flightNumber }}</span>
        </div>
      </div>
      
      <span :class="['badge', statusClass]">
        <span class="badge-dot"></span>
        {{ statusLabel }}
      </span>
    </div>

    <!-- Card Body: Route & Times -->
    <div class="card-body">
      <div class="route-endpoint origin">
        <h2 class="airport-code">{{ flight.origin }}</h2>
        <span class="time">{{ formatTime(flight.departureTime) }}</span>
        <span class="date">{{ formatDate(flight.departureTime) }}</span>
        <span class="airport-name" :title="flight.originName">{{ flight.originName }}</span>
      </div>

      <!-- Path visualizer: plane flying from origin to destination -->
      <div class="route-path">
        <div class="path-line"></div>
        <div class="plane-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" style="display:none;" />
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1.1.1-1.3.6l-.3.7c-.2.5 0 1.1.4 1.4L9 12l-3 3-2.5-.5c-.4-.1-.8.1-1 .4l-.3.5c-.2.4-.1.9.3 1.1L6 18l1.5 3.5c.2.4.7.5 1.1.3l.5-.3c.3-.2.5-.6.4-1L9 18l3-3 3.1 5.4c.3.5.9.6 1.4.4l.7-.3c.5-.2.7-.8.6-1.3z" />
          </svg>
        </div>
        <span class="duration">Directo</span>
      </div>

      <div class="route-endpoint destination">
        <h2 class="airport-code">{{ flight.destination }}</h2>
        <span class="time">{{ formatTime(flight.arrivalTime) }}</span>
        <span class="date">{{ formatDate(flight.arrivalTime) }}</span>
        <span class="airport-name" :title="flight.destinationName">{{ flight.destinationName }}</span>
      </div>
    </div>

    <!-- Card Footer: Gate, Aircraft, Price & Action -->
    <div class="card-footer">
      <div class="flight-details">
        <div class="detail-item">
          <span class="detail-label">Puerta</span>
          <span class="detail-value">{{ flight.gate || 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Aeronave</span>
          <span class="detail-value">{{ flight.aircraft }}</span>
        </div>
      </div>

      <div class="price-action">
        <div class="price-container">
          <span class="price-label">Desde</span>
          <span class="price-amount">${{ flight.price }}<span class="currency">USD</span></span>
        </div>
        <button 
          @click="emit('book', flight)" 
          class="btn btn-primary btn-book"
          :disabled="flight.status === 'Cancelled'"
        >
          Reservar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flight-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header styling */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
}

.airline-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.airline-logo-placeholder {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--color-primary);
}

.airline-name {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 0;
}

.flight-code {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* Body styling (Route) */
.card-body {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  text-align: center;
}

.route-endpoint {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.route-endpoint.origin {
  align-items: flex-start;
  text-align: left;
}

.route-endpoint.destination {
  align-items: flex-end;
  text-align: right;
}

.airport-code {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.05em;
  margin: 0;
}

.time {
  font-size: 1.15rem;
  font-weight: 600;
  color: white;
}

.date {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.airport-name {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
  margin-top: 0.25rem;
}

/* Path visualizer styling */
.route-path {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.path-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: repeating-linear-gradient(90deg, var(--color-border), var(--color-border) 4px, transparent 4px, transparent 8px);
  transform: translateY(-50%);
  z-index: 1;
}

.plane-icon-wrapper {
  background: var(--color-bg-dark);
  padding: 0.25rem 0.5rem;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  z-index: 2;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(90deg);
  animation: float 3s ease-in-out infinite;
}

.plane-icon-wrapper svg {
  width: 16px;
  height: 16px;
}

.duration {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  background: var(--color-bg-dark);
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  margin-top: 0.5rem;
  z-index: 2;
}

/* Footer styling */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-border);
  padding-top: 1.25rem;
  margin-top: 0.25rem;
}

.flight-details {
  display: flex;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.detail-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.price-action {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.price-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.price-label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.price-amount {
  font-size: 1.35rem;
  font-weight: 700;
  color: #60a5fa;
}

.price-amount .currency {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-left: 0.15rem;
}

.btn-book {
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
}

@keyframes float {
  0% {
    transform: rotate(90deg) translateY(0px);
  }
  50% {
    transform: rotate(90deg) translateY(-3px);
    color: #60a5fa;
  }
  100% {
    transform: rotate(90deg) translateY(0px);
  }
}

@media (max-width: 640px) {
  .card-body {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .route-endpoint.origin, 
  .route-endpoint.destination {
    align-items: center;
    text-align: center;
  }
  
  .route-path {
    display: none;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .flight-details {
    justify-content: space-around;
  }
  
  .price-action {
    justify-content: space-between;
  }
}
</style>
