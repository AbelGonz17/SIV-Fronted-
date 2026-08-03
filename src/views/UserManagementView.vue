<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUsers } from '../composables/useUsers'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const {
  internalUsers,
  loading,
  error,
  fetchInternalUsers,
  createInternalUser,
  updateInternalUser,
  deactivateUser,
  activateUser
} = useUsers()

import type { InternalUserDTO } from '../models/UserManagementDTO'

// Búsqueda
const searchQuery = ref('')

// Toast
const toast = ref<{show: boolean, message: string, type: 'success' | 'error'}>({ show: false, message: '', type: 'success' })
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 4000)
}

// Modals
const activeModal = ref<'create' | 'edit' | 'deactivate' | 'activate' | null>(null)
const selectedUser = ref<InternalUserDTO | null>(null)
const loadingOp = ref(false)

// Formularios
const createForm = ref({ nombre: '', correoElectronico: '', contrasena: '', confirmarContrasena: '', rol: 'Operador' })
const editForm = ref({ nombre: '', rol: 'Operador' })

// Roles disponibles para internos
const ROLES_INTERNOS = ['Administrador', 'Operador', 'Auditor']

// Filtro reactivo
const filteredUsers = computed(() => {
  if (!searchQuery.value) return internalUsers.value
  const q = searchQuery.value.toLowerCase().trim()
  return internalUsers.value.filter(u =>
    (u.nombre || '').toLowerCase().includes(q) ||
    (u.correo || '').toLowerCase().includes(q) ||
    (u.rol || '').toLowerCase().includes(q)
  )
})

// Cargar al montar
onMounted(async () => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  await fetchInternalUsers()
})

// Modals
const openCreate = () => {
  createForm.value = { nombre: '', correoElectronico: '', contrasena: '', confirmarContrasena: '', rol: 'Operador' }
  activeModal.value = 'create'
}

const openEdit = (user: InternalUserDTO) => {
  selectedUser.value = user
  editForm.value = { nombre: user.nombre, rol: user.rol }
  activeModal.value = 'edit'
}

const openDeactivate = (user: InternalUserDTO) => {
  selectedUser.value = user
  activeModal.value = 'deactivate'
}

const openActivate = (user: InternalUserDTO) => {
  selectedUser.value = user
  activeModal.value = 'activate'
}

const closeModal = () => {
  activeModal.value = null
  selectedUser.value = null
}

// Acciones
const handleCreate = async () => {
  const f = createForm.value
  if (!f.nombre || !f.correoElectronico || !f.contrasena || !f.rol) {
    showToast('Completa todos los campos requeridos.', 'error'); return
  }
  if (f.contrasena !== f.confirmarContrasena) {
    showToast('Las contraseñas no coinciden.', 'error'); return
  }
  loadingOp.value = true
  try {
    await createInternalUser({
      nombre: f.nombre.trim(),
      correoElectronico: f.correoElectronico.trim(),
      contrasena: f.contrasena,
      rol: f.rol
    })
    showToast(`Usuario "${f.nombre}" registrado exitosamente.`)
    closeModal()
    await fetchInternalUsers()
  } catch (err) {
    showToast(err.message || 'Error al registrar el usuario.', 'error')
  } finally {
    loadingOp.value = false
  }
}

const handleUpdate = async () => {
  const f = editForm.value
  if (!f.nombre || !f.rol) {
    showToast('Completa todos los campos requeridos.', 'error'); return
  }
  loadingOp.value = true
  try {
    await updateInternalUser(selectedUser.value.id, { nombre: f.nombre.trim(), rol: f.rol })
    showToast(`Usuario actualizado correctamente.`)
    closeModal()
    await fetchInternalUsers()
  } catch (err) {
    showToast(err.message || 'Error al actualizar el usuario.', 'error')
  } finally {
    loadingOp.value = false
  }
}

const handleDeactivate = async () => {
  loadingOp.value = true
  try {
    await deactivateUser(selectedUser.value.id)
    showToast(`Usuario "${selectedUser.value.nombre}" desactivado.`)
    closeModal()
    await fetchInternalUsers()
  } catch (err) {
    showToast(err.message || 'Error al desactivar el usuario.', 'error')
  } finally {
    loadingOp.value = false
  }
}

const handleActivate = async () => {
  loadingOp.value = true
  try {
    await activateUser(selectedUser.value.id)
    showToast(`Usuario "${selectedUser.value.nombre}" activado.`)
    closeModal()
    await fetchInternalUsers()
  } catch (err) {
    showToast(err.message || 'Error al activar el usuario.', 'error')
  } finally {
    loadingOp.value = false
  }
}

// Badge para estado activo/inactivo
const roleBadge = (rol) => {
  const map = {
    'Administrador': 'badge-admin',
    'Operador': 'badge-operador',
    'Auditor': 'badge-auditor'
  }
  return map[rol] || ''
}
</script>

<template>
  <div class="page-management container">
    <!-- Toast -->
    <Teleport to="body">
      <Transition name="slide-fade">
        <div v-if="toast.show" :class="['toast-notification', `toast-${toast.type}`]">
          <div class="toast-icon">
            <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/>
              <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p class="toast-message">{{ toast.message }}</p>
        </div>
      </Transition>
    </Teleport>

    <!-- Header -->
    <header class="management-header">
      <div>
        <h1 class="page-title">Gestión de Usuarios</h1>
        <p class="page-subtitle">Registro y administración de usuarios internos del sistema.</p>
      </div>
      <button v-if="authStore.user?.role === 'Administrador'" @click="openCreate" class="btn btn-primary btn-create">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" style="margin-right:0.25rem">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Registrar Usuario
      </button>
    </header>

    <!-- Role Warning -->
    <div v-if="authStore.user?.role !== 'Administrador'" class="role-warning-banner glass-card">
      <div class="warning-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div class="warning-body">
        <h4>Modo Consulta (Solo Lectura)</h4>
        <p>Tu rol actual es <strong>{{ authStore.user?.role }}</strong>. Las operaciones de registro, edición y desactivación de usuarios son exclusivas del rol <strong>Administrador</strong>.</p>
      </div>
    </div>

    <!-- Searchbar -->
    <div class="toolbar-section glass-card" style="margin-bottom:1.5rem; padding:1rem 1.5rem;">
      <div class="search-box-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon-svg">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="searchQuery" type="text" placeholder="Buscar por nombre, correo o rol..." class="form-input search-input-field"/>
      </div>
    </div>

    <!-- Users Table -->
    <div class="management-card glass-card">
      <div v-if="loading" class="loader-container">
        <div class="pulse-loader"></div>
        <p>Cargando directorio de usuarios...</p>
      </div>
      <div v-else-if="error" class="error-container">
        <p class="error-text">{{ error }}</p>
        <button @click="fetchInternalUsers" class="btn btn-primary">Reintentar</button>
      </div>
      <div v-else class="table-wrapper">
        <table class="flights-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th v-if="authStore.user?.role === 'Administrador'" class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td class="font-semibold text-white">{{ user.nombre }}</td>
              <td style="color:var(--color-text-secondary)">{{ user.correo }}</td>
              <td>
                <span :class="['rol-badge', roleBadge(user.rol)]">{{ user.rol }}</span>
              </td>
              <td>
                <span :class="['status-badge', user.activo ? 'status-active' : 'status-inactive']">
                  {{ user.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td v-if="authStore.user?.role === 'Administrador'" class="text-right actions-cell">
                <div class="action-buttons-group">
                  <button @click="openEdit(user)" class="btn-action btn-edit" :disabled="!user.activo">Editar</button>
                  <button v-if="user.activo" @click="openDeactivate(user)" class="btn-action btn-cancel">Desactivar</button>
                  <button v-else @click="openActivate(user)" class="btn-action btn-success">Activar</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" class="empty-table-cell">No se encontraron usuarios que coincidan con la búsqueda.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer class="table-footer">
        <span class="pagination-info">{{ filteredUsers.length }} usuarios internos registrados</span>
      </footer>
    </div>

    <!-- MODALS -->
    <Teleport to="body">
      <!-- Create Modal -->
      <div v-if="activeModal === 'create'" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-card" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2 class="modal-title">Registrar Usuario Interno</h2>
          <p class="modal-subtitle">Crea una cuenta de acceso para un nuevo miembro del equipo operativo.</p>

          <div class="form-fields">
            <div class="form-group">
              <label class="form-label" for="c-nombre">Nombre Completo</label>
              <input id="c-nombre" v-model="createForm.nombre" type="text" class="form-input" placeholder="Ej. Francis Ramírez" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="c-email">Correo Electrónico</label>
              <input id="c-email" v-model="createForm.correoElectronico" type="email" class="form-input" placeholder="correo@skyflow.com" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="c-pass">Contraseña</label>
                <input id="c-pass" v-model="createForm.contrasena" type="password" class="form-input" placeholder="Mín. 8 caracteres" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="c-pass2">Confirmar Contraseña</label>
                <input id="c-pass2" v-model="createForm.confirmarContrasena" type="password" class="form-input" placeholder="Repetir contraseña" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="c-rol">Rol del Sistema</label>
              <select id="c-rol" v-model="createForm.rol" class="form-input form-select">
                <option v-for="rol in ROLES_INTERNOS" :key="rol" :value="rol">{{ rol }}</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary" :disabled="loadingOp">Cancelar</button>
            <button @click="handleCreate" class="btn btn-primary" :disabled="loadingOp">
              {{ loadingOp ? 'Registrando...' : 'Registrar Usuario' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="activeModal === 'edit'" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-card" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2 class="modal-title">Actualizar Usuario</h2>
          <p class="modal-subtitle">Modifica el nombre o rol del usuario <strong>{{ selectedUser?.correo }}</strong>.</p>

          <div class="form-fields">
            <div class="form-group">
              <label class="form-label" for="e-nombre">Nombre Completo</label>
              <input id="e-nombre" v-model="editForm.nombre" type="text" class="form-input" placeholder="Nombre actualizado" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="e-rol">Rol del Sistema</label>
              <select id="e-rol" v-model="editForm.rol" class="form-input form-select">
                <option v-for="rol in ROLES_INTERNOS" :key="rol" :value="rol">{{ rol }}</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary" :disabled="loadingOp">Cancelar</button>
            <button @click="handleUpdate" class="btn btn-primary" :disabled="loadingOp">
              {{ loadingOp ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Deactivate Confirm Modal -->
      <div v-if="activeModal === 'deactivate'" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-card" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2 class="modal-title text-danger">Desactivar Usuario</h2>
          <p class="modal-subtitle">¿Deseas desactivar la cuenta de <strong>{{ selectedUser?.nombre }}</strong>?</p>

          <div style="margin-top:1rem; padding:0.875rem 1rem; border-radius:8px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); color:#f87171; font-size:0.85rem; line-height:1.5;">
            El usuario perderá acceso inmediato al sistema. Su historial de auditoría se conservará. Esta acción puede ser revertida manualmente por el equipo de base de datos.
          </div>

          <div class="modal-footer" style="margin-top:1.5rem;">
            <button @click="closeModal" class="btn btn-secondary" :disabled="loadingOp">Cancelar</button>
            <button @click="handleDeactivate" class="btn btn-danger" :disabled="loadingOp">
              {{ loadingOp ? 'Desactivando...' : 'Sí, Desactivar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Activate Confirm Modal -->
      <div v-if="activeModal === 'activate'" class="modal-backdrop" @click="closeModal">
        <div class="modal-container glass-card" @click.stop>
          <button class="modal-close" @click="closeModal">&times;</button>
          <h2 class="modal-title text-success">Activar Usuario</h2>
          <p class="modal-subtitle">¿Deseas activar la cuenta de <strong>{{ selectedUser?.nombre }}</strong>?</p>

          <div style="margin-top:1rem; padding:0.875rem 1rem; border-radius:8px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); color:#34d399; font-size:0.85rem; line-height:1.5;">
            El usuario recuperará acceso inmediato al sistema con los roles que tenía asignados.
          </div>

          <div class="modal-footer" style="margin-top:1.5rem;">
            <button @click="closeModal" class="btn btn-secondary" :disabled="loadingOp">Cancelar</button>
            <button @click="handleActivate" class="btn btn-success-fill" :disabled="loadingOp">
              {{ loadingOp ? 'Activando...' : 'Sí, Activar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page-management {
  animation: fadeIn 0.4s ease forwards;
  padding-bottom: 3rem;
}

.management-header {
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

/* Role Warning */
.role-warning-banner {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  margin-bottom: 2rem;
  border-left: 4px solid #eab308;
}

.warning-icon svg {
  width: 28px;
  height: 28px;
  color: #eab308;
}

.warning-body h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #fef08a;
  margin-bottom: 0.25rem;
}

.warning-body p {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

/* Search */
.search-box-wrapper {
  position: relative;
  width: 100%;
}

.search-icon-svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
}

.search-input-field { padding-left: 2.75rem !important; width: 100%; }

/* Table Card */
.management-card { padding: 0; overflow: hidden; }
.table-wrapper { overflow-x: auto; }

.flights-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.flights-table th {
  background: rgba(255, 255, 255, 0.02);
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  padding: 1.25rem 1.5rem;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
}

.flights-table td {
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  vertical-align: middle;
}

.flights-table tbody tr:hover { background: rgba(255, 255, 255, 0.01); }

/* Role Badges */
.rol-badge {
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge-admin  { background: rgba(139, 92, 246, 0.15); color: #c4b5fd; border: 1px solid rgba(139,92,246,0.25); }
.badge-operador { background: rgba(59, 130, 246, 0.15); color: #93c5fd; border: 1px solid rgba(59,130,246,0.25); }
.badge-auditor  { background: rgba(245, 158, 11, 0.15); color: #fcd34d; border: 1px solid rgba(245,158,11,0.25); }

/* Status Badges */
.status-badge {
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-active   { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
.status-inactive { background: rgba(239, 68, 68, 0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

/* Actions */
.actions-cell { padding: 0.75rem 1.5rem !important; }
.action-buttons-group { display: flex; gap: 0.5rem; justify-content: flex-end; }

.btn-action {
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: rgba(255,255,255,0.03);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:disabled { opacity: 0.3; cursor: not-allowed; }
.btn-edit:hover:not(:disabled) { border-color: rgba(96,165,250,0.4); background: rgba(59,130,246,0.1); color: #60a5fa; }
.btn-cancel:hover:not(:disabled) { border-color: rgba(248,113,113,0.4); background: rgba(239,68,68,0.1); color: #f87171; }
.btn-success:hover:not(:disabled) { border-color: rgba(52,211,153,0.4); background: rgba(16,185,129,0.1); color: #34d399; }

.empty-table-cell { text-align: center; color: var(--color-text-muted); padding: 3rem 1.5rem !important; font-style: italic; }

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--color-border);
}

.pagination-info { font-size: 0.8rem; color: var(--color-text-muted); }

/* Modals */
.modal-backdrop {
  position: fixed; top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(4, 7, 13, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  padding: 1.5rem;
  animation: modalFadeIn 0.25s ease-out;
}

@keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-container {
  width: 100%;
  max-width: 580px;
  padding: 2rem;
  position: relative;
  animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes modalSlideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-close { position: absolute; top: 1rem; right: 1.25rem; background: none; border: none; color: var(--color-text-muted); font-size: 1.75rem; cursor: pointer; transition: color 0.2s; }
.modal-close:hover { color: white; }
.modal-title { font-size: 1.5rem; font-weight: 700; color: white; }
.modal-subtitle { color: var(--color-text-secondary); font-size: 0.875rem; margin-top: 0.35rem; margin-bottom: 1.5rem; }

.form-fields { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.modal-footer { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem; }

.form-input { width: 100%; max-width: 100%; box-sizing: border-box; }
.form-select { cursor: pointer; }
.form-select option { background: #0d1117; color: white; }

.text-danger { color: #f87171; }
.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: white; border: none;
}
.btn-danger:hover { background: linear-gradient(135deg, #f87171 0%, #ef4444 100%); }

.text-success { color: #34d399; }
.btn-success-fill {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%);
  color: white; border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-success-fill:hover { background: linear-gradient(135deg, #34d399 0%, #10b981 100%); }

/* Transitions */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-20px); opacity: 0; }

@media (max-width: 768px) {
  .management-header { flex-direction: column; align-items: flex-start; }
  .btn-create { width: 100%; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
