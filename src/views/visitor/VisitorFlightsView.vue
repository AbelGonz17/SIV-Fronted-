<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useFlights } from '../../composables/useFlights'
import { useVisitor } from '../../composables/useVisitor'

const { flights, loading, error, searchFilter, filteredFlights, fetchFlights } = useFlights()
const { myFlights, followFlight, unfollowFlight, fetchMyFlights } = useVisitor()

const toast = ref({ show: false, message: '', type: 'success' })
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

const followingIds = computed(() => new Set(myFlights.value.map(f => f.vueloId)))

const actionLoading = ref(null)

const handleFollow = async (flight) => {
  actionLoading.value = flight.id
  try {
    await followFlight(flight.id)
    await fetchMyFlights()
    showToast(`✓ Ahora sigues el vuelo ${flight.flightNumber}`)
  } catch (err) {
    showToast(err.message || 'Error al seguir el vuelo.', 'error')
  } finally {
    actionLoading.value = null
  }
}

const handleUnfollow = async (flight) => {
  actionLoading.value = flight.id
  try {
    await unfollowFlight(flight.id)
    await fetchMyFlights()
    showToast(`Dejaste de seguir el vuelo ${flight.flightNumber}.`)
  } catch (err) {
    showToast(err.message || 'Error al dejar de seguir.', 'error')
  } finally {
    actionLoading.value = null
  }
}

const formatTime = (dateStr) => {
  if (!dateStr) return '--:--'
  try { return new Date(dateStr).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', hour12: true }) }
  catch { return '--:--' }
}

const statusClass = (status) => {
  if (!status) return ''
  const s = status.toLowerCase()
  if (s.includes('cancel')) return 'badge-cancelled'
  if (s.includes('delay') || s.includes('demora') || s.includes('retras')) return 'badge-delayed'
  if (s.includes('board') || s.includes('abord')) return 'badge-boarding'
  if (s.includes('adelant') || s.includes('advanc')) return 'badge-advanced'
  return 'badge-ontime'
}

const statusLabel = (status) => {
  if (!status) return 'En Hora'
  const s = status.toLowerCase()
  if (s.includes('cancel')) return 'Cancelado'
  if (s.includes('delay') || s.includes('demora') || s.includes('retras')) return 'Demorado'
  if (s.includes('board') || s.includes('abord')) return 'Abordando'
  if (s.includes('adelant') || s.includes('advanc')) return 'Adelantado'
  return 'En Hora'
}

// Filtros UI
const activeTab = ref('all') // 'all' | 'departures' | 'arrivals'
const searchText = ref('')

const displayedFlights = computed(() => {
  let list = filteredFlights.value
  if (searchText.value.trim()) {
    const q = searchText.value.toLowerCase()
    list = list.filter(f =>
      (f.flightNumber || '').toLowerCase().includes(q) ||
      (f.airline || '').toLowerCase().includes(q) ||
      (f.origin || '').toLowerCase().includes(q) ||
      (f.destination || '').toLowerCase().includes(q)
    )
  }
  return list
})

onMounted(async () => {
  searchFilter.value.pageSize = 30
  await Promise.all([fetchFlights(), fetchMyFlights()])
})

const changeTab = async (tab) => {
  activeTab.value = tab
  if (tab === 'departures') searchFilter.value.esLlegada = 'false'
  else if (tab === 'arrivals') searchFilter.value.esLlegada = 'true'
  else searchFilter.value.esLlegada = ''
  await fetchFlights()
}
</script>

<template>
  <div class="visitor-panel">
    <!-- Toast -->
    <Transition name="slide-fade">
      <div v-if="toast.show" :class="['v-toast', `v-toast-${toast.type}`]">
        {{ toast.message }}
      </div>
    </Transition>

    <!-- Header -->
    <header class="visitor-header">
      <div class="visitor-header-text">
        <h1 class="visitor-title">Panel de Vuelos</h1>
        <p class="visitor-subtitle">Consulta vuelos en tiempo real y sigue los que te interesen.</p>
      </div>
    </header>

    <!-- Tabs + Search -->
    <div class="controls-bar glass-card">
      <div class="tabs">
        <button :class="['tab-btn', { active: activeTab === 'all' }]" @click="changeTab('all')">Todos</button>
        <button :class="['tab-btn', { active: activeTab === 'departures' }]" @click="changeTab('departures')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="margin-right:4px"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
          Salidas
        </button>
        <button :class="['tab-btn', { active: activeTab === 'arrivals' }]" @click="changeTab('arrivals')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="margin-right:4px; transform:rotate(180deg)"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
          Llegadas
        </button>
      </div>
      <div class="search-bar-wrap">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-ico">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="searchText" type="text" class="form-input search-inp" placeholder="Vuelo, aerolínea, origen, destino..." />
      </div>
    </div>

    <!-- Flights Grid -->
    <div v-if="loading" class="loading-state">
      <div class="pulse-loader"></div>
      <p>Cargando vuelos...</p>
    </div>

    <div v-else-if="error" class="error-state glass-card">
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="fetchFlights">Reintentar</button>
    </div>

    <div v-else class="flights-grid">
      <TransitionGroup name="list-fade">
        <div
          v-for="flight in displayedFlights"
          :key="flight.id"
          class="flight-card glass-card"
        >
          <!-- Card header -->
          <div class="fc-header">
            <div class="fc-airline">
              <div class="fc-airline-dot"></div>
              <span class="fc-airline-name">{{ flight.airline }}</span>
            </div>
            <span :class="['fc-badge', statusClass(flight.status)]">
              {{ statusLabel(flight.status) }}
            </span>
          </div>

          <!-- Route -->
          <div class="fc-route">
            <div class="fc-airport">
              <span class="fc-code">{{ flight.origin }}</span>
              <span class="fc-time">{{ formatTime(flight.departureTime) }}</span>
              <span class="fc-name">{{ flight.originName }}</span>
            </div>
            <div class="fc-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="36" height="14">
                <line x1="2" y1="12" x2="22" y2="12"/><polyline points="16 6 22 12 16 18"/>
              </svg>
            </div>
            <div class="fc-airport fc-right">
              <span class="fc-code">{{ flight.destination }}</span>
              <span class="fc-time">{{ formatTime(flight.arrivalTime) }}</span>
              <span class="fc-name">{{ flight.destinationName }}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="fc-footer">
            <div class="fc-meta">
              <span class="fc-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                Vuelo {{ flight.flightNumber }}
              </span>
              <span v-if="flight.gate !== 'N/A'" class="fc-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Puerta {{ flight.gate }}
              </span>
            </div>

            <!-- Follow Button -->
            <button
              v-if="followingIds.has(flight.id)"
              @click="handleUnfollow(flight)"
              :disabled="actionLoading === flight.id"
              class="follow-btn following"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {{ actionLoading === flight.id ? '...' : 'Siguiendo' }}
            </button>
            <button
              v-else
              @click="handleFollow(flight)"
              :disabled="actionLoading === flight.id"
              class="follow-btn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {{ actionLoading === flight.id ? '...' : 'Seguir' }}
            </button>
          </div>
        </div>
      </TransitionGroup>

      <div v-if="displayedFlights.length === 0" class="empty-state glass-card">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        <p>No se encontraron vuelos para los filtros aplicados. ¡El cielo está despejado! ☁️✈️</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visitor-panel {
  animation: fadeIn 0.4s ease;
  padding-bottom: 3rem;
}

/* Header */
.visitor-header {
  margin-bottom: 1.75rem;
}
.visitor-title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}
.visitor-subtitle {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

/* Controls bar */
.controls-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover { background: rgba(255,255,255,0.05); color: white; }
.tab-btn.active { background: rgba(var(--color-primary-rgb, 59,130,246), 0.12); color: var(--color-primary); border-color: rgba(var(--color-primary-rgb, 59,130,246), 0.2); }

.search-bar-wrap {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-ico {
  position: absolute; left: 0.875rem; top: 50%; transform: translateY(-50%);
  width: 15px; height: 15px;
  color: var(--color-text-muted);
}

.search-inp { padding-left: 2.5rem !important; width: 100%; }

/* Flights Grid */
.flights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 1.25rem;
}

/* Flight Card */
.flight-card {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.flight-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(0,0,0,0.5), 0 0 20px var(--color-primary-glow);
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

/* Route */
.fc-route {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.fc-airport {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.fc-airport.fc-right { align-items: flex-end; }

.fc-code {
  font-size: 1.6rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.03em;
  line-height: 1;
}

.fc-time {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
  margin-top: 0.2rem;
}

.fc-name {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  margin-top: 0.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.fc-arrow { color: var(--color-text-muted); flex-shrink: 0; }

/* Footer */
.fc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.875rem;
  border-top: 1px solid var(--color-border);
}

.fc-meta {
  display: flex;
  gap: 0.875rem;
  flex-wrap: wrap;
}

.fc-meta-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: var(--color-text-muted);
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
}
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

/* Empty / Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem;
  color: var(--color-text-muted);
}

.pulse-loader {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state, .error-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem;
  color: var(--color-text-muted);
  text-align: center;
}

/* Toast */
.v-toast {
  position: fixed;
  top: 1.5rem; right: 1.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  z-index: 9999;
  backdrop-filter: blur(12px);
  animation: fadeIn 0.3s ease;
}
.v-toast-success { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #34d399; }
.v-toast-error   { background: rgba(239,68,68,0.15);  border: 1px solid rgba(239,68,68,0.3);  color: #f87171; }

.slide-fade-enter-active { transition: all 0.3s ease; }
.slide-fade-leave-active { transition: all 0.2s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-12px); opacity: 0; }

.list-fade-enter-active { transition: all 0.3s ease; }
.list-fade-enter-from { opacity: 0; transform: translateY(10px); }

@media (max-width: 640px) {
  .controls-bar { flex-direction: column; align-items: stretch; }
  .flights-grid { grid-template-columns: 1fr; }
}
</style>
