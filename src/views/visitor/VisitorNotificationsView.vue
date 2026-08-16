<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useVisitor } from '../../composables/useVisitor'
import { useFlights } from '../../composables/useFlights'
import VisitorFlightModal from '../../components/VisitorFlightModal.vue'
import { useLanguage } from '../../composables/useLanguage'

const { notifications, loadingNotifications, fetchNotifications, markAsRead } = useVisitor()
const { fetchFlightDetails } = useFlights()
const { t, currentLanguage } = useLanguage()

const showModal = ref(false)
const selectedFlightDetails = ref(null)
const modalLoading = ref(false)
const modalError = ref(null)

const openDetails = async (flightId) => {
  if (!flightId) return
  modalLoading.value = true
  modalError.value = null
  showModal.value = true
  try {
    selectedFlightDetails.value = await fetchFlightDetails(flightId)
  } catch (err) {
    modalError.value = err?.message || 'Error al cargar detalles.'
  } finally {
    modalLoading.value = false
  }
}

const closeDetails = () => {
  showModal.value = false
  selectedFlightDetails.value = null
}

const unread = computed(() => notifications.value.filter(n => !n.fueLeida))
const read = computed(() => notifications.value.filter(n => n.fueLeida))

const translateMessage = (msg) => {
  if (!msg) return msg
  if (currentLanguage.value === 'es') return msg
  
  let translated = msg
    .replace(/Atención:\s*El vuelo/gi, 'Attention: Flight')
    .replace(/ha cambiado su estado a/gi, 'has changed its status to')
    .replace(/Motivo:/gi, 'Reason:')
    
  translated = translated
    .replace(/Embarcando/g, t('status.boarding'))
    .replace(/En Vuelo/g, t('status.inflight'))
    .replace(/Aterrizado/g, t('status.landed'))
    .replace(/Completado/g, t('status.completed'))
    .replace(/En Hora/g, t('status.ontime'))
    .replace(/Demorado/g, t('status.delayed'))
    .replace(/Cancelado/g, t('status.cancelled'))
    .replace(/Programado/g, t('status.scheduled'))
    
  return translated
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const locale = currentLanguage.value === 'es' ? 'es-DO' : 'en-US'
    return new Date(dateStr).toLocaleString(locale, {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  } catch { return dateStr }
}

const handleMarkRead = async (notif) => {
  try {
    await markAsRead(notif.id)
    // El estado se actualiza de forma optimista dentro de markAsRead
    // Re-fetch para sincronizar con el servidor
    await fetchNotifications()
  } catch (err) {
    console.error('Error marking as read:', err)
  }
}

const markAllRead = async () => {
  for (const n of unread.value) {
    try { await markAsRead(n.id) } catch {}
  }
  await fetchNotifications()
}

onMounted(fetchNotifications)
</script>

<template>
  <div class="notif-page">
    <!-- Header -->
    <header class="notif-header">
      <div>
        <h1 class="page-title">{{ t('notifications.title') }}</h1>
        <p class="page-sub">{{ t('notifications.subtitle') }}</p>
      </div>
      <button v-if="unread.length > 0" @click="markAllRead" class="btn btn-secondary mark-all-btn">
        {{ t('notifications.markAllRead') }}
      </button>
    </header>

    <!-- Loading -->
    <div v-if="loadingNotifications" class="loading-state">
      <div class="pulse-loader"></div>
      <p>{{ t('notifications.loading') }}</p>
    </div>

    <template v-else>
      <!-- Sin notificaciones -->
      <div v-if="notifications.length === 0" class="empty-notif glass-card">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="52" height="52" style="color:var(--color-text-muted)">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <p style="color:var(--color-text-muted); font-size:1rem; margin-top:0.5rem">{{ t('notifications.empty.title') }}</p>
        <p style="color:var(--color-text-muted); font-size:0.85rem">{{ t('notifications.empty.desc') }}</p>
      </div>

      <!-- No leídas -->
      <section v-if="unread.length > 0" class="notif-section">
        <div class="section-header">
          <span class="section-title">{{ t('notifications.unread') }}</span>
          <span class="unread-count-badge">{{ unread.length }}</span>
        </div>
        <div class="notif-list">
          <div v-for="notif in unread" :key="notif.id" class="notif-card notif-unread glass-card">
            <div class="notif-icon unread-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
              </svg>
            </div>
            <div class="notif-body" @click="openDetails(notif.vueloRelacionadoId)" style="cursor: pointer;" :title="t('notifications.card.title')">
              <p class="notif-message">{{ translateMessage(notif.mensaje) || t('flights.card.flight') }}</p>
              <span class="notif-date">{{ formatDate(notif.fechaHoraGenearicion) }}</span>
            </div>
            <button @click="handleMarkRead(notif)" class="mark-read-btn" :title="t('notifications.card.markRead')">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- Leídas -->
      <section v-if="read.length > 0" class="notif-section">
        <div class="section-header" style="margin-top: 2rem">
          <span class="section-title" style="color:var(--color-text-muted)">{{ t('notifications.read') }}</span>
        </div>
        <div class="notif-list">
          <div v-for="notif in read" :key="notif.id" class="notif-card notif-read glass-card">
            <div class="notif-icon read-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="notif-body" @click="openDetails(notif.vueloRelacionadoId)" style="cursor: pointer;" :title="t('notifications.card.title')">
              <p class="notif-message read-msg">{{ translateMessage(notif.mensaje) || t('flights.card.flight') }}</p>
              <span class="notif-date">{{ formatDate(notif.fechaHoraGenearicion) }}</span>
            </div>
          </div>
        </div>
      </section>
    </template>

    <VisitorFlightModal
      :show="showModal"
      :flightDetails="selectedFlightDetails"
      :loading="modalLoading"
      :error="modalError"
      @close="closeDetails"
    />
  </div>
</template>

<style scoped>
.notif-page { animation: fadeIn 0.4s ease; padding-bottom: 3rem; }

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-title { font-size: 2rem; font-weight: 700; color: white; letter-spacing: -0.02em; }
.page-sub   { color: var(--color-text-secondary); font-size: 0.95rem; margin-top: 0.25rem; }

.mark-all-btn {
  font-size: 0.85rem;
  padding: 0.6rem 1.25rem;
}

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

.empty-notif {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; padding: 4rem; text-align: center;
}

/* Section */
.notif-section { margin-bottom: 0.5rem; }

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
}

.unread-count-badge {
  background: var(--color-primary);
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.1rem 0.5rem;
  border-radius: 20px;
  min-width: 20px;
  text-align: center;
}

/* Notification Card */
.notif-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notif-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  transition: all 0.2s;
}

.notif-card:hover { background: rgba(255,255,255,0.03) !important; }

.notif-unread {
  border-left: 3px solid var(--color-primary) !important;
  background: rgba(var(--color-primary-rgb, 59,130,246), 0.04) !important;
}

.notif-read { opacity: 0.6; }

.notif-icon {
  width: 36px; height: 36px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.unread-icon {
  background: rgba(var(--color-primary-rgb, 59,130,246), 0.15);
  color: var(--color-primary);
}

.read-icon {
  background: rgba(255,255,255,0.04);
  color: var(--color-text-muted);
}

.notif-body { flex: 1; min-width: 0; }

.notif-message {
  font-size: 0.9rem;
  color: white;
  line-height: 1.45;
  margin-bottom: 0.35rem;
}

.read-msg { color: var(--color-text-secondary); }

.notif-date {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.mark-read-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.35rem;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: all 0.2s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mark-read-btn:hover {
  border-color: rgba(16,185,129,0.4);
  background: rgba(16,185,129,0.08);
  color: #34d399;
}
</style>
