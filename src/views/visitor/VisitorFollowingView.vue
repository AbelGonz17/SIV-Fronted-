<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useVisitor } from '../../composables/useVisitor'
import { getAirportCode } from '../../composables/useFlights'

const { myFlights, loadingFlights, fetchMyFlights, unfollowFlight } = useVisitor()

const unfollowingId = ref(null)
const toast = ref({ show: false, message: '', type: 'success' })

const showToast = (message: string, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

const formatTime = (dateStr: string | undefined) => {
  if (!dateStr) return '--:--'
  try {
    return new Date(dateStr).toLocaleTimeString('es-DO', {
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  } catch {
    return '--:--'
  }
}

const getFlightTimes = (flight: any) => {
  const mainTimeStr = flight.horarioEstimado || flight.horarioPlanificado || flight.fechaInicio
  if (!mainTimeStr) return { dep: null, arr: null }
  
  const mainTime = new Date(mainTimeStr)
  const isArrival = (flight.destino || '').toLowerCase().includes('americas') || (flight.destino || '').toLowerCase().includes('américas')
  
  let dep = mainTime
  let arr = mainTime
  
  if (isArrival) {
    dep = new Date(mainTime.getTime() - 2 * 60 * 60 * 1000)
  } else {
    arr = new Date(mainTime.getTime() + 2 * 60 * 60 * 1000)
  }
  
  return {
    dep: dep.toISOString(),
    arr: arr.toISOString()
  }
}

const statusLabel = (estado: string) => {
  const e = (estado || '').toLowerCase()
  if (e.includes('cancel')) return 'Cancelado'
  if (e.includes('retras') || e.includes('demor')) return 'Demorado'
  if (e.includes('abord') || e.includes('embarc')) return 'Embarcando'
  return 'En Hora'
}

const statusClass = (estado: string) => {
  const e = (estado || '').toLowerCase()
  if (e.includes('cancel')) return 'badge-cancelled'
  if (e.includes('retras') || e.includes('demor')) return 'badge-delayed'
  if (e.includes('abord') || e.includes('embarc')) return 'badge-boarding'
  return 'badge-ontime'
}

const handleUnfollow = async (flight: any) => {
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
  } catch (err: any) {
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

    <!-- Empty State -->
    <div v-else-if="myFlights.length === 0" class="empty-state glass-card">
      <div class="empty-icon-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </div>
      <h3 class="empty-title">Aún no sigues ningún vuelo</h3>
      <p class="empty-desc">Explora el Panel de Vuelos y presiona "Seguir" para recibir actualizaciones aquí.</p>
      <router-link to="/visitor/vuelos" class="empty-action-btn">
        Ir al Panel de Vuelos
      </router-link>
    </div>

    <!-- List -->
    <div v-else class="following-list">
      <TransitionGroup name="list-fade">
        <div v-for="flight in myFlights" :key="flight.vueloId" class="following-card glass-card">
          
          <!-- Card header -->
          <div class="fc-header">
            <div class="fc-airline">
              <div class="fc-airline-dot"></div>
              <span class="fc-airline-name">{{ flight.aerolinea }}</span>
            </div>
            <span :class="['fc-badge', statusClass(flight.estadoActual)]">
              {{ statusLabel(flight.estadoActual) }}
            </span>
          </div>

          <!-- Route (Fully Vertical Timeline) -->
          <div class="fc-route-timeline">
            <!-- Origin -->
            <div class="tl-step">
              <div class="tl-icon">
                <div class="tl-dot origin"></div>
                <div class="tl-line"></div>
              </div>
              <div class="tl-content">
                <div class="tl-header">
                  <span class="tl-code">{{ getAirportCode(flight.origen) }}</span>
                  <span class="tl-time">{{ formatTime(getFlightTimes(flight).dep) }}</span>
                </div>
                <span class="tl-name" :title="flight.origen">{{ flight.origen }}</span>
              </div>
            </div>
            
            <!-- Destination -->
            <div class="tl-step">
              <div class="tl-icon">
                <div class="tl-dot dest"></div>
              </div>
              <div class="tl-content">
                <div class="tl-header">
                  <span class="tl-code">{{ getAirportCode(flight.destino) }}</span>
                  <span class="tl-time">{{ formatTime(getFlightTimes(flight).arr) }}</span>
                </div>
                <span class="tl-name" :title="flight.destino">{{ flight.destino }}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="fc-footer">
            <div class="fc-meta">
              <span class="fc-meta-item highlight-text">
                Vuelo: {{ flight.numeroVuelo }}
              </span>
              <span class="fc-meta-item highlight-text">
                Puerta: {{ flight.puerta && flight.puerta !== 'N/A' ? flight.puerta : '--' }}
              </span>
            </div>

            <!-- Unfollow Button -->
            <button
              @click.stop="handleUnfollow(flight)"
              :disabled="unfollowingId === flight.vueloId"
              class="follow-btn following"
            >
              <span class="btn-icon">
                <svg v-if="unfollowingId !== flight.vueloId" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                </svg>
                <div v-else class="mini-spinner"></div>
              </span>
              <span class="btn-text-hover" v-if="unfollowingId !== flight.vueloId">Dejar de seguir</span>
              <span class="btn-text" v-if="unfollowingId !== flight.vueloId">Siguiendo</span>
              <span class="btn-text" v-if="unfollowingId === flight.vueloId">Eliminando...</span>
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

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 24px;
}

.empty-icon-wrapper {
  background: rgba(var(--color-primary-rgb, 59,130,246), 0.1);
  padding: 1.5rem;
  border-radius: 50%;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.empty-icon {
  width: 48px;
  height: 48px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.empty-desc {
  color: var(--color-text-muted);
  max-width: 400px;
  line-height: 1.5;
  margin-bottom: 2rem;
}

.empty-action-btn {
  background: var(--color-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.empty-action-btn:hover {
  background: var(--color-primary-hover, #2563eb);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--color-primary-rgb, 59,130,246), 0.4);
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

/* Grid */
.following-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

/* Card */
.following-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: default;
}
.following-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0,0,0,0.4), 0 0 15px var(--color-primary-glow);
}

.fc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fc-airline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fc-airline-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 8px var(--color-primary-glow);
}

.fc-airline-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

/* Status badges */
.fc-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.badge-ontime   { background: rgba(16,185,129,0.12); color: #34d399; }
.badge-delayed  { background: rgba(245,158,11,0.12); color: #fbbf24; }
.badge-cancelled{ background: rgba(239,68,68,0.12);  color: #f87171; }
.badge-boarding { background: rgba(139,92,246,0.12); color: #c4b5fd; }

/* Route Vertical Timeline Layout */
.fc-route-timeline {
  display: flex;
  flex-direction: column;
  margin: 0.5rem 0;
}

.tl-step {
  display: flex;
  gap: 1rem;
}

.tl-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12px;
}

.tl-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  background: transparent;
  z-index: 1;
  margin-top: 6px;
}
.tl-dot.dest {
  background: var(--color-primary);
}

.tl-line {
  flex: 1;
  width: 2px;
  background: rgba(255, 255, 255, 0.1);
  margin-top: 4px;
  margin-bottom: 4px;
}

.tl-content {
  flex: 1;
  min-width: 0;
  padding-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
}
.tl-step:last-child .tl-content {
  padding-bottom: 0;
}

.tl-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.tl-code {
  font-size: 1.6rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.02em;
  line-height: 1;
}

.tl-time {
  font-size: 0.9rem;
  font-weight: 700;
  color: #9ca3af;
  line-height: 1;
}

.tl-name {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Footer */
.fc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.875rem;
  border-top: 1px solid var(--color-border);
  gap: 1rem;
}

.fc-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.highlight-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: #E5E7EB;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.fc-meta-separator {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

/* Follow button */
.follow-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  border: 1.5px solid rgba(var(--color-primary-rgb, 59,130,246), 0.3);
  background: rgba(var(--color-primary-rgb, 59,130,246), 0.08);
  color: var(--color-primary);
  transition: all 0.2s;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
}

.btn-icon { display: flex; align-items: center; justify-content: center; }
.btn-text-hover { display: none; }

.follow-btn:hover:not(:disabled) {
  background: rgba(var(--color-primary-rgb, 59,130,246), 0.2);
  border-color: var(--color-primary);
  transform: scale(1.03);
}
.follow-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.follow-btn.following {
  background: rgba(16,185,129,0.1);
  border-color: rgba(16,185,129,0.3);
  color: #34d399;
}
.follow-btn.following:hover:not(:disabled) {
  background: rgba(239,68,68,0.1);
  border-color: rgba(239,68,68,0.3);
  color: #f87171;
}

.follow-btn.following:hover:not(:disabled) .btn-text {
  display: none;
}
.follow-btn.following:hover:not(:disabled) .btn-text-hover {
  display: inline;
}

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
