<script setup>
import { onMounted, ref } from 'vue'
import { useVisitor } from '../../composables/useVisitor'

const { myFlights, loadingFlights, fetchMyFlights, unfollowFlight } = useVisitor()

const unfollowingId = ref(null)
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

const formatDate = (dateStr) => {
  if (!dateStr) return '--'
  try {
    return new Date(dateStr).toLocaleDateString('es-DO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  } catch { return dateStr }
}

const handleUnfollow = async (flight) => {
  // El endpoint requiere el vueloId (no el seguimientoId)
  const vueloId = flight.vueloId
  if (!vueloId) {
    showToast('No se pudo obtener el ID del vuelo.', 'error')
    return
  }
  unfollowingId.value = vueloId
  try {
    await unfollowFlight(vueloId)
    await fetchMyFlights()
    showToast(`Dejaste de seguir el vuelo ${flight.numeroVuelo || ''}.`)
  } catch (err) {
    showToast(err.message || 'Error al dejar de seguir el vuelo.', 'error')
  } finally {
    unfollowingId.value = null
  }
}

onMounted(fetchMyFlights)
</script>

<template>
  <div class="following-page">
    <!-- Toast -->
    <Transition name="slide-fade">
      <div v-if="toast.show" :class="['v-toast', `v-toast-${toast.type}`]">
        {{ toast.message }}
      </div>
    </Transition>

    <!-- Header -->
    <header class="following-header">
      <div>
        <h1 class="page-title">Mis Seguimientos</h1>
        <p class="page-sub">Vuelos que estás monitoreando activamente.</p>
      </div>
      <div class="flights-count-badge" v-if="myFlights.length > 0">
        {{ myFlights.length }} vuelo{{ myFlights.length !== 1 ? 's' : '' }}
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loadingFlights" class="loading-state">
      <div class="pulse-loader"></div>
      <p>Cargando tus vuelos...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="myFlights.length === 0" class="empty-state glass-card">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="52" height="52" style="color:var(--color-text-muted)">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      <p style="color:var(--color-text-muted); font-size:1rem; margin-top:0.5rem">No sigues ningún vuelo aún.</p>
      <p style="color:var(--color-text-muted); font-size:0.85rem">Ve al <strong style="color:var(--color-primary)">Panel de Vuelos</strong> y pulsa "Seguir" en cualquier vuelo.</p>
    </div>

    <!-- List -->
    <div v-else class="following-list">
      <TransitionGroup name="list-fade">
        <div v-for="flight in myFlights" :key="flight.seguimientoId" class="following-card glass-card">
          
          <!-- Flight number & airline -->
          <div class="card-top">
            <div class="flight-info">
              <span class="fn-label">VUELO</span>
              <span class="fn-value">{{ flight.numeroVuelo || 'N/A' }}</span>
            </div>
            <div class="airline-pill">
              <div class="airline-dot"></div>
              <span>{{ flight.aerolinea || '—' }}</span>
            </div>
          </div>

          <!-- Tracking info -->
          <div class="tracking-info">
            <div class="tracking-item">
              <span class="ti-label">Seguimiento desde</span>
              <span class="ti-value">{{ formatDate(flight.fechaInicio) }}</span>
            </div>
            <div class="tracking-item" v-if="flight.fechaFin">
              <span class="ti-label">Hasta</span>
              <span class="ti-value">{{ formatDate(flight.fechaFin) }}</span>
            </div>
            <div class="status-pill" :class="flight.activo ? 'pill-active' : 'pill-inactive'">
              {{ flight.activo ? 'Activo' : 'Finalizado' }}
            </div>
          </div>

          <!-- Unfollow button -->
          <div class="card-footer">

            <button
              @click="handleUnfollow(flight)"
              :disabled="unfollowingId === flight.vueloId"
              class="unfollow-btn"
            >
              <svg v-if="unfollowingId !== flight.vueloId" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              <div v-else class="mini-spinner"></div>
              {{ unfollowingId === flight.vueloId ? 'Eliminando...' : 'Dejar de seguir' }}
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.following-page { animation: fadeIn 0.4s ease; padding-bottom: 3rem; position: relative; }

.following-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.page-title { font-size: 2rem; font-weight: 700; color: white; letter-spacing: -0.02em; }
.page-sub   { color: var(--color-text-secondary); font-size: 0.95rem; margin-top: 0.25rem; }

.flights-count-badge {
  background: rgba(var(--color-primary-rgb, 59,130,246), 0.12);
  border: 1px solid rgba(var(--color-primary-rgb, 59,130,246), 0.2);
  color: var(--color-primary);
  padding: 0.4rem 0.875rem;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 700;
}

/* States */
.loading-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 1rem; padding: 4rem; color: var(--color-text-muted);
}

.pulse-loader {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; padding: 4rem; text-align: center;
}

/* Grid */
.following-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

/* Card */
.following-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.following-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0,0,0,0.4), 0 0 15px var(--color-primary-glow);
}

/* Card top */
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.fn-label {
  display: block;
  font-size: 0.65rem; font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.1em; text-transform: uppercase;
}
.fn-value {
  display: block;
  font-size: 1.6rem; font-weight: 800;
  color: white; letter-spacing: -0.02em;
  line-height: 1.1;
  margin-top: 0.1rem;
}

.airline-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--color-border);
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.airline-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 6px var(--color-primary-glow);
  flex-shrink: 0;
}

/* Tracking info */
.tracking-info {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.tracking-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.ti-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ti-value {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.status-pill {
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-left: auto;
}
.pill-active   { background: rgba(16,185,129,0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
.pill-inactive { background: rgba(107,114,128,0.1); color: #9ca3af; border: 1px solid rgba(107,114,128,0.2); }

/* Card footer */
.card-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
  gap: 1rem;
}

.flight-id-text {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--color-text-muted);
  font-family: monospace;
  letter-spacing: 0.02em;
}

.unfollow-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  border: 1.5px solid rgba(239,68,68,0.25);
  background: rgba(239,68,68,0.06);
  color: #f87171;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}
.unfollow-btn:hover:not(:disabled) {
  background: rgba(239,68,68,0.14);
  border-color: rgba(239,68,68,0.4);
  transform: scale(1.02);
}
.unfollow-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.mini-spinner {
  width: 13px; height: 13px;
  border: 2px solid rgba(248,113,113,0.3);
  border-top-color: #f87171;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* Toast */
.v-toast {
  position: fixed;
  top: 1.5rem; right: 1.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem; font-weight: 600;
  z-index: 9999;
  backdrop-filter: blur(12px);
}
.v-toast-success { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #34d399; }
.v-toast-error   { background: rgba(239,68,68,0.15);  border: 1px solid rgba(239,68,68,0.3);  color: #f87171; }

.slide-fade-enter-active { transition: all 0.3s ease; }
.slide-fade-leave-active { transition: all 0.2s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-12px); opacity: 0; }

.list-fade-enter-active { transition: all 0.3s ease; }
.list-fade-leave-active { transition: all 0.3s ease; position: absolute; width: 100%; }
.list-fade-enter-from   { opacity: 0; transform: translateY(10px); }
.list-fade-leave-to     { opacity: 0; transform: scale(0.95); }

@media (max-width: 640px) { .following-list { grid-template-columns: 1fr; } }
</style>
