<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useReports } from '../composables/useReports'

const { loading, error, fetchOperacionReport, fetchCambiosOperativos, fetchSeguimientoReport, exportReportCsv } = useReports()

// State
const fechaInicio = ref(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0])
const fechaFin = ref(new Date().toISOString().split('T')[0])

const operacionData = ref(null)
const cambiosData = ref([])
const seguimientoData = ref(null)

const loadDashboard = async () => {
  try {
    const [op, cambios, seg] = await Promise.all([
      fetchOperacionReport(fechaInicio.value, fechaFin.value),
      fetchCambiosOperativos(fechaInicio.value, fechaFin.value),
      fetchSeguimientoReport(5)
    ])
    operacionData.value = op
    cambiosData.value = cambios
    seguimientoData.value = seg
  } catch (err) {
    console.error(err)
  }
}

const handleExport = (tipo) => {
  exportReportCsv(tipo, fechaInicio.value, fechaFin.value)
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('es-DO', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

// Watch filters
watch([fechaInicio, fechaFin], () => {
  loadDashboard()
})

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="reports-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard de Reportes</h1>
        <p class="page-sub">Estadísticas y métricas operativas del sistema.</p>
      </div>
      <div class="date-filters glass-card">
        <div class="filter-group">
          <label>Desde</label>
          <input type="date" class="form-input" v-model="fechaInicio">
        </div>
        <div class="filter-group">
          <label>Hasta</label>
          <input type="date" class="form-input" v-model="fechaFin">
        </div>
      </div>
    </div>

    <!-- Error/Loading State -->
    <div v-if="loading && !operacionData" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando métricas...</p>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <template v-if="operacionData && !loading">
      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card glass-card">
          <div class="kpi-header">
            <h3>Vuelos Totales</h3>
            <button @click="handleExport('operacion')" class="btn-icon" title="Exportar CSV">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </div>
          <div class="kpi-value">{{ operacionData.totalVuelos }}</div>
          <div class="kpi-sub">En el período seleccionado</div>
        </div>

        <div class="kpi-card glass-card success">
          <div class="kpi-header">
            <h3>Vuelos Completados</h3>
          </div>
          <div class="kpi-value">{{ operacionData.completados }}</div>
          <div class="kpi-sub">{{ ((operacionData.completados / (operacionData.totalVuelos || 1)) * 100).toFixed(1) }}% del total</div>
        </div>

        <div class="kpi-card glass-card warning">
          <div class="kpi-header">
            <h3>Retrasados / Otros</h3>
          </div>
          <div class="kpi-value">{{ operacionData.retrasados }} / {{ operacionData.otros }}</div>
          <div class="kpi-sub">Cambios operativos</div>
        </div>

        <div class="kpi-card glass-card danger">
          <div class="kpi-header">
            <h3>Cancelados</h3>
          </div>
          <div class="kpi-value">{{ operacionData.cancelados }}</div>
          <div class="kpi-sub">Operaciones suspendidas</div>
        </div>
      </div>

      <!-- Tablas Inferiores -->
      <div class="bottom-grid">
        
        <!-- Cambios Operativos -->
        <div class="dashboard-section glass-card">
          <div class="section-header">
            <h2>Historial de Cambios Operativos</h2>
            <button @click="handleExport('cambios')" class="btn btn-secondary btn-sm">Exportar CSV</button>
          </div>
          
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Vuelo</th>
                  <th>Tipo Cambio</th>
                  <th>Motivo</th>
                  <th>Fecha/Hora</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="cambiosData.length === 0">
                  <td colspan="4" class="text-center text-muted py-4">No hay cambios operativos registrados.</td>
                </tr>
                <tr v-for="(cambio, idx) in cambiosData.slice(0, 5)" :key="idx">
                  <td class="font-bold">{{ cambio.numeroVuelo }}</td>
                  <td>
                    <span class="badge" :class="cambio.tipoCambio.toLowerCase().includes('retras') ? 'badge-delayed' : 'badge-advanced'">
                      {{ cambio.tipoCambio }}
                    </span>
                  </td>
                  <td class="motivo-cell">{{ cambio.motivo }}</td>
                  <td>{{ formatDate(cambio.fechaHora) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Seguimiento Top -->
        <div class="dashboard-section glass-card" v-if="seguimientoData">
          <div class="section-header">
            <h2>Vuelos Más Seguidos</h2>
            <button @click="handleExport('seguimiento')" class="btn btn-secondary btn-sm">Exportar CSV</button>
          </div>
          
          <div class="tracking-list">
            <div class="tracking-item" v-for="(vuelo, idx) in seguimientoData.topVuelosMasSeguidos" :key="idx">
              <div class="tracking-rank">#{{ idx + 1 }}</div>
              <div class="tracking-info">
                <div class="tracking-flight">{{ vuelo.numeroVuelo }}</div>
                <div class="tracking-state">{{ vuelo.estadoActual }}</div>
              </div>
              <div class="tracking-count">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {{ vuelo.cantidadSeguidores || 0 }} seguidores
              </div>
            </div>
            <div v-if="seguimientoData.topVuelosMasSeguidos.length === 0" class="text-center text-muted py-4">
              Nadie está siguiendo vuelos en este momento.
            </div>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
.reports-view {
  animation: fadeIn 0.4s ease;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
}

.date-filters {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.kpi-card {
  padding: 1.5rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 4px; height: 100%;
  background: var(--color-primary);
}

.kpi-card.success::before { background: #10b981; }
.kpi-card.warning::before { background: #f59e0b; }
.kpi-card.danger::before { background: #ef4444; }

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-header h3 {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.kpi-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.kpi-sub {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.bottom-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .bottom-grid {
    grid-template-columns: 1fr;
  }
}

.dashboard-section {
  padding: 1.5rem;
  border-radius: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.data-table th {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
}

.motivo-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tracking-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tracking-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  gap: 1rem;
}

.tracking-rank {
  font-weight: 700;
  color: var(--color-primary);
  font-size: 1.1rem;
}

.tracking-info {
  flex: 1;
}

.tracking-flight {
  font-weight: 600;
  font-size: 1rem;
}

.tracking-state {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.tracking-count {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  color: #ec4899; /* pink-500 */
}

.btn-icon {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}
.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-delayed { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
.badge-advanced { background: rgba(14, 165, 233, 0.15); color: #38bdf8; }
.font-bold { font-weight: 700; }
</style>
