<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFlights, getAirportCode } from '../../composables/useFlights'

const router = useRouter()
const { flights, loading, error, searchFilter, fetchFlights } = useFlights()
let refreshInterval: any = null

const showCodeModal = ref(false)
const secretCodeInput = ref('')
const codeError = ref(false)

const verifyCode = () => {
  // Hardcoded secret code. The user can change this later.
  if (secretCodeInput.value === '123456') {
    showCodeModal.value = false
    secretCodeInput.value = ''
    codeError.value = false
    router.push('/intranet/login')
  } else {
    codeError.value = true
  }
}


onMounted(async () => {
  // Configurar para traer más vuelos en la vista pública
  searchFilter.value.pageSize = 50
  
  await fetchFlights()
  
  // Auto-refresh cada 30 segundos
  refreshInterval = setInterval(() => {
    fetchFlights()
  }, 30000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

const formatTime = (dateStr: string) => {
  if (!dateStr) return '--:--'
  try {
    return new Date(dateStr).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch {
    return '--:--'
  }
}

const statusClass = (status: string) => {
  if (!status) return ''
  const s = status.toLowerCase()
  if (s.includes('cancel')) return 'status-cancelled'
  if (s.includes('delay') || s.includes('demora') || s.includes('retras')) return 'status-delayed'
  if (s.includes('board') || s.includes('abord')) return 'status-boarding'
  if (s.includes('adelant') || s.includes('advanc')) return 'status-advanced'
  return 'status-ontime'
}

const statusLabel = (status: string) => {
  if (!status) return ''
  return status.toUpperCase()
}

const currentDate = ref(new Date().toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
const currentTime = ref(new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))

setInterval(() => {
  currentTime.value = new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}, 1000)

</script>

<template>
  <div class="fids-layout">
    <!-- FIDS Header -->
    <header class="fids-header">
      <div class="fids-brand">
        <div class="fids-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22 11 13 2 9l20-7z" />
          </svg>
        </div>
        <div class="fids-title-group">
          <h1 class="fids-title">SkyFlow</h1>
          <span class="fids-subtitle">FLIGHT INFORMATION DISPLAY SYSTEM</span>
        </div>
      </div>
      
      <div class="fids-clock">
        <div class="fids-date">{{ currentDate }}</div>
        <div class="fids-time">{{ currentTime }}</div>
      </div>

      <div class="fids-actions">
        <button class="fids-btn-intranet" @click="showCodeModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Acceso Intranet
        </button>
        <button class="fids-btn-login" @click="router.push('/login')">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
          Ingresar / Seguir Vuelos
        </button>
      </div>
    </header>

    <!-- FIDS Board -->
    <main class="fids-main">
      <div v-if="loading && flights.length === 0" class="fids-loading">
        <div class="pulse-loader"></div>
        <p>CARGANDO INFORMACIÓN DE VUELOS...</p>
      </div>

      <div v-else-if="error" class="fids-error">
        <p>ERROR DE COMUNICACIÓN CON LA TORRE DE CONTROL</p>
        <p class="error-detail">{{ error }}</p>
      </div>

      <div v-else class="fids-board-wrapper">
        <table class="fids-table">
          <thead>
            <tr>
              <th style="width: 15%">AEROLÍNEA</th>
              <th style="width: 10%">VUELO</th>
              <th style="width: 15%">ORIGEN</th>
              <th style="width: 15%">DESTINO</th>
              <th style="width: 15%">HORA</th>
              <th style="width: 10%">PUERTA</th>
              <th style="width: 20%">ESTADO</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="flight in flights" :key="flight.id" class="fids-row">
              <td class="col-airline">
                <span class="airline-text">{{ flight.aerolineaNombre }}</span>
              </td>
              <td class="col-flight">{{ flight.numeroVuelo }}</td>
              <td class="col-airport">{{ getAirportCode(flight.origen) }}</td>
              <td class="col-airport">{{ getAirportCode(flight.destino) }}</td>
              <td class="col-time">{{ formatTime(flight.horarioEstimado || flight.horarioPlanificado) }}</td>
              <td class="col-gate">{{ flight.puertaEmbarque && flight.puertaEmbarque !== 'N/A' ? flight.puertaEmbarque : '--' }}</td>
              <td class="col-status">
                <span :class="['status-box', statusClass(flight.estado)]">
                  {{ statusLabel(flight.estado) }}
                </span>
              </td>
            </tr>
            <tr v-if="flights.length === 0">
              <td colspan="7" class="fids-empty">
                NO HAY VUELOS PROGRAMADOS EN ESTE MOMENTO
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Modal de Código Secreto -->
    <div v-if="showCodeModal" class="modal-backdrop" @click="showCodeModal = false">
      <div class="code-modal glass-card" @click.stop>
        <button class="modal-close" @click="showCodeModal = false">&times;</button>
        <div class="modal-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2 class="modal-title">Acceso Restringido</h2>
        <p class="modal-subtitle">Ingrese el código de acceso para continuar a la Intranet.</p>
        
        <form @submit.prevent="verifyCode" class="code-form">
          <input 
            type="password" 
            v-model="secretCodeInput" 
            placeholder="Código secreto" 
            class="code-input"
            :class="{ 'input-error': codeError }"
            autofocus
          />
          <span v-if="codeError" class="error-msg">Código incorrecto. Intente nuevamente.</span>
          <button type="submit" class="btn-verify">Verificar</button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* FIDS Layout & Base */
.fids-layout {
  min-height: 100vh;
  background-color: #050914;
  color: #ffffff;
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
}

/* Header */
.fids-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2.5rem;
  background: linear-gradient(180deg, #0f172a 0%, #050914 100%);
  border-bottom: 2px solid #1e293b;
}

.fids-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.fids-logo {
  width: 48px;
  height: 48px;
  background: #3b82f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
}
.fids-logo svg {
  width: 24px;
  height: 24px;
}

.fids-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.fids-subtitle {
  font-size: 0.75rem;
  font-weight: 600;
  color: #60a5fa;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.fids-clock {
  text-align: center;
  font-family: 'Fira Code', monospace;
}

.fids-time {
  font-size: 2.5rem;
  font-weight: 700;
  color: #eab308;
  text-shadow: 0 0 10px rgba(234, 179, 8, 0.3);
  line-height: 1;
}

.fids-date {
  font-size: 0.85rem;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
  letter-spacing: 0.05em;
}

.fids-actions {
  display: flex;
  align-items: center;
}

.fids-btn-login {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: #60a5fa;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fids-btn-login:hover {
  background: rgba(59, 130, 246, 0.25);
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

/* Main Board */
.fids-main {
  flex: 1;
  padding: 2rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fids-board-wrapper {
  background: #0b1120;
  border-radius: 12px;
  border: 1px solid #1e293b;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
}

.fids-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.fids-table thead {
  background: #1e293b;
}

.fids-table th {
  padding: 1rem 1.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom: 2px solid #334155;
}

.fids-row {
  border-bottom: 1px solid #1e293b;
  transition: background-color 0.2s;
  animation: rowFadeIn 0.5s ease backwards;
}
.fids-row:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}
.fids-row:hover {
  background: rgba(59, 130, 246, 0.05);
}

@keyframes rowFadeIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.fids-row td {
  padding: 1rem 1.5rem;
  font-family: 'Fira Code', monospace;
  font-size: 1.1rem;
  font-weight: 600;
  vertical-align: middle;
}

.col-airline { color: #f8fafc; font-family: 'Inter', sans-serif !important; }
.col-flight { color: #38bdf8; }
.col-airport { color: #e2e8f0; font-weight: 700; }
.col-time { color: #eab308; }
.col-gate { color: #cbd5e1; }

.status-box {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  font-family: 'Inter', sans-serif;
}

.status-ontime { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
.status-delayed { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); animation: blink 2s infinite; }
.status-cancelled { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
.status-boarding { background: rgba(139, 92, 246, 0.15); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.3); animation: pulse 2s infinite; }
.status-advanced { background: rgba(56, 189, 248, 0.15); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.3); }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
}

.fids-loading, .fids-error, .fids-empty {
  padding: 4rem;
  text-align: center;
  color: #94a3b8;
  font-family: 'Fira Code', monospace;
  font-size: 1.25rem;
  letter-spacing: 0.1em;
}

.pulse-loader {
  width: 40px; height: 40px;
  border-radius: 50%;
  border: 3px solid #1e293b;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
  margin: 0 auto 1.5rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

.fids-error {
  color: #f87171;
}
.error-detail {
  font-size: 0.9rem;
  margin-top: 1rem;
  opacity: 0.8;
}

@media (max-width: 1024px) {
  .fids-header { flex-direction: column; gap: 1.5rem; }
  .fids-actions { flex-direction: column; gap: 0.5rem; width: 100%; }
  .fids-actions button { width: 100%; justify-content: center; }
  .fids-main { padding: 1rem; }
  .fids-table th, .fids-table td { padding: 0.75rem 0.5rem; font-size: 0.9rem; }
}

/* Secret Code Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-modal {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  padding: 2.5rem 2rem;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  text-align: center;
  animation: modalFadeIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(15px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-close {
  position: absolute;
  top: 1rem; right: 1.25rem;
  background: none; border: none;
  color: #94a3b8; font-size: 1.75rem;
  cursor: pointer; transition: color 0.2s;
}
.modal-close:hover { color: white; }

.modal-icon {
  width: 64px; height: 64px;
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 1.25rem;
}

.modal-title {
  font-size: 1.35rem; font-weight: 700; color: white; margin-bottom: 0.5rem;
}
.modal-subtitle {
  font-size: 0.85rem; color: #94a3b8; margin-bottom: 1.5rem;
}

.code-form {
  display: flex; flex-direction: column; gap: 1rem;
}

.code-input {
  background: #1e293b;
  border: 1px solid #334155;
  color: white;
  padding: 0.85rem;
  border-radius: 8px;
  font-size: 1rem;
  text-align: center;
  letter-spacing: 0.2em;
}
.code-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
}
.code-input.input-error {
  border-color: #ef4444;
}

.error-msg {
  color: #ef4444; font-size: 0.8rem; margin-top: -0.5rem;
}

.btn-verify {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.85rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-verify:hover {
  background: #2563eb;
}

.fids-btn-intranet {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #cbd5e1;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-right: 1rem;
}
.fids-btn-intranet:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}
</style>
