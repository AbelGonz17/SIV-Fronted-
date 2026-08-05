<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudit } from '../composables/useAudit'

const { logs, loading, error, totalPages, currentPage, fetchLogs, exportLogsCsv } = useAudit()

const filterFechaInicio = ref('')
const filterFechaFin = ref('')
const filterAccion = ref('')

const actionsList = [
  'CrearVuelo', 'EditarVuelo', 'CancelarVuelo', 'RegistrarRetraso', 'RegistrarAdelanto', 'RegistrarCambioPuerta',
  'CrearUsuario', 'DesactivarUsuario', 'ActivarUsuario', 'CrearAerolinea', 'EditarAerolinea', 'CrearAeropuerto', 'EditarAeropuerto'
]

const loadData = async (page = 1) => {
  await fetchLogs({
    pageNumber: page,
    pageSize: 20,
    fechaInicio: filterFechaInicio.value || undefined,
    fechaFin: filterFechaFin.value || undefined,
    accion: filterAccion.value || undefined
  })
}

const handleFilter = () => {
  loadData(1)
}

const handleExport = () => {
  exportLogsCsv({
    fechaInicio: filterFechaInicio.value || undefined,
    fechaFin: filterFechaFin.value || undefined,
    accion: filterAccion.value || undefined
  })
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('es-DO', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

onMounted(() => {
  loadData(1)
})
</script>

<template>
  <div class="audit-view">
    <div class="page-header">
      <div>
        <h1 class="page-title">Registro de Auditoría</h1>
        <p class="page-sub">Historial de acciones realizadas por los usuarios del sistema.</p>
      </div>
      <button @click="handleExport" class="btn btn-primary" :disabled="loading">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Exportar CSV
      </button>
    </div>

    <!-- Filtros -->
    <div class="filters-card glass-card">
      <div class="filter-group">
        <label>Fecha Desde</label>
        <input type="date" class="form-input" v-model="filterFechaInicio" @change="handleFilter">
      </div>
      <div class="filter-group">
        <label>Fecha Hasta</label>
        <input type="date" class="form-input" v-model="filterFechaFin" @change="handleFilter">
      </div>
      <div class="filter-group">
        <label>Acción</label>
        <select class="form-select" v-model="filterAccion" @change="handleFilter">
          <option value="">Todas las acciones</option>
          <option v-for="act in actionsList" :key="act" :value="act">{{ act }}</option>
        </select>
      </div>
    </div>

    <!-- Estado de Carga / Error -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando registros...</p>
    </div>
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Tabla -->
    <div class="custom-table-wrapper" style="margin-top: 1.5rem;">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Fecha y Hora</th>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Entidad Afectada</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="logs.length === 0">
            <td colspan="5" class="text-center py-4 text-muted">No se encontraron registros de auditoría.</td>
          </tr>
          <tr v-for="log in logs" :key="log.id">
            <td class="whitespace-nowrap">{{ formatDate(log.fechaHora) }}</td>
            <td>
              <div class="user-info">
                <span class="user-name">{{ log.usuario }}</span>
              </div>
            </td>
            <td>
              <span class="action-badge">{{ log.accion }}</span>
            </td>
            <td>
              <div class="entity-info">
                <span class="entity-type">{{ log.entidadAfectada || 'N/A' }}</span>
                <span class="entity-id">{{ log.entidadId || 'N/A' }}</span>
              </div>
            </td>
            <td class="details-cell">{{ log.detalles }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginación -->
    <div class="pagination" v-if="totalPages > 1">
      <button 
        class="btn btn-secondary btn-sm" 
        :disabled="currentPage === 1" 
        @click="loadData(currentPage - 1)"
      >Anterior</button>
      
      <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
      
      <button 
        class="btn btn-secondary btn-sm" 
        :disabled="currentPage === totalPages" 
        @click="loadData(currentPage + 1)"
      >Siguiente</button>
    </div>
  </div>
</template>

<style scoped>
.audit-view {
  animation: fadeIn 0.4s ease;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.table-container {
  overflow-x: auto;
  border-radius: 12px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.data-table th {
  background: rgba(0, 0, 0, 0.2);
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.02);
}

.user-info, .entity-info {
  display: flex;
  flex-direction: column;
}

.user-name { font-weight: 500; }
.user-role { font-size: 0.8rem; color: var(--color-text-secondary); }

.entity-type { font-weight: 500; }
.entity-id { font-size: 0.75rem; color: var(--color-text-secondary); font-family: monospace; }

.action-badge {
  display: inline-flex;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: rgba(var(--color-primary-rgb, 59, 130, 246), 0.15);
  color: var(--color-primary, #3b82f6);
  font-size: 0.85rem;
  font-weight: 600;
}

.details-cell {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.details-cell:hover {
  white-space: normal;
  word-wrap: break-word;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
}

.page-info {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
}

.text-center { text-align: center; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.text-muted { color: var(--color-text-secondary); }
.whitespace-nowrap { white-space: nowrap; }
</style>
