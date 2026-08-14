<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useVisitor } from '../composables/useVisitor'
import { useTheme } from '../composables/useTheme'
import ChangePasswordModal from './ChangePasswordModal.vue'
import UserProfileModal from './UserProfileModal.vue'
import { useSignalR } from '../composables/useSignalR'
import { useLayoutStore } from '../stores/layout'
import { onUnmounted } from 'vue'

const authStore = useAuthStore()
const layoutStore = useLayoutStore()
const router = useRouter()
const { fetchNotifications, notifications, addNotification } = useVisitor()
const { activeTheme, themeKeys, themes, setTheme } = useTheme()
const { startConnection, stopConnection, onPersonalAlert, offPersonalAlert } = useSignalR()

const unreadCount = computed(() => notifications.value.filter(n => !n.fueLeida).length)
const toast = ref({ show: false, message: '' })

let toastTimeout: any = null
const showToast = (message: string) => {
  toast.value = { show: true, message }
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => { toast.value.show = false }, 5000)
}

const handleAlert = (mensaje: string) => {
  addNotification(mensaje)
  showToast(mensaje)
}

onMounted(async () => {
  await fetchNotifications()
  await startConnection()
  onPersonalAlert(handleAlert)
})

onUnmounted(() => {
  offPersonalAlert(handleAlert)
  // No detenemos la conexión aquí porque otros componentes podrían usarla,
  // pero el composable la mantendrá viva
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const showPasswordModal = ref(false)
const showSettingsModal = ref(false)
const showProfileModal = ref(false)

const initials = computed(() => {
  const name = authStore.user?.name || 'V'
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
})
</script>

<template>
  <!-- Toast flotante para alertas en tiempo real -->
  <Transition name="slide-fade">
    <div v-if="toast.show" class="sidebar-toast">
      <div class="toast-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      </div>
      <div class="toast-content">
        <strong>Nueva Alerta de Vuelo</strong>
        <p>{{ toast.message }}</p>
      </div>
      <button class="toast-close" @click="toast.show = false">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </Transition>

  <aside :class="['visitor-sidebar', { collapsed: layoutStore.isSidebarCollapsed }]"
         @click="layoutStore.isSidebarCollapsed ? layoutStore.toggleSidebar() : null">
    <!-- Logo / Brand -->
    <div class="visitor-brand">
      <div class="brand-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
          <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
        </svg>
      </div>
      <div class="brand-text-container">
        <span class="brand-name">SkyFlow</span>
        <span class="brand-tag">Portal de Vuelos</span>
      </div>
      <button class="sidebar-toggle" @click.stop="layoutStore.toggleSidebar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
    </div>

    <!-- Visitor Greeting -->
    <div class="visitor-greeting">
      <div class="greeting-avatar">{{ initials }}</div>
      <div class="greeting-text">
        <span class="greeting-name">{{ authStore.user?.name }}</span>
        <span class="greeting-role">Visitante</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="visitor-nav">
      <span class="nav-section-label">NAVEGACIÓN</span>

      <RouterLink to="/visitante" class="visitor-link" active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="link-icon">
          <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
        </svg>
        <span>Panel de Vuelos</span>
      </RouterLink>

      <RouterLink to="/visitante/seguimientos" class="visitor-link" active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="link-icon">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>Mis Seguimientos</span>
      </RouterLink>

      <RouterLink to="/visitante/notificaciones" class="visitor-link" active-class="active">
        <div class="link-icon-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="link-icon">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount }}</span>
        </div>
        <span>Notificaciones</span>
      </RouterLink>
    </nav>

    <!-- Footer -->
    <div class="visitor-footer">


      <!-- Settings / Configuración -->
      <button @click="showSettingsModal = true" class="visitor-btn-settings">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Configuración
      </button>

      <!-- Logout -->
      <button @click="handleLogout" class="visitor-logout-btn">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Cerrar Sesión
      </button>
    </div>
  </aside>

  <!-- Modal de Configuración (Settings) -->
  <div v-if="showSettingsModal" class="modal-backdrop" @click="showSettingsModal = false">
    <div class="modal-container settings-modal glass-card" @click.stop>
      <button class="modal-close" @click="showSettingsModal = false">&times;</button>
      <h2 class="modal-title">Configuración</h2>
      
      <div class="settings-options">
        <button class="settings-option-btn" @click="showSettingsModal = false; showProfileModal = true">
          <div class="option-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div class="settings-option-text">
            <span class="settings-option-title">Ver Perfil</span>
            <span class="settings-option-desc">Consulta tus datos personales</span>
          </div>
          <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>

        <button class="settings-option-btn" @click="showSettingsModal = false; showPasswordModal = true">
          <div class="option-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div class="settings-option-text">
            <span class="settings-option-title">Cambiar Contraseña</span>
            <span class="settings-option-desc">Actualiza tu clave de acceso</span>
          </div>
          <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
        
        <!-- Opciones de Apariencia -->
        <div class="settings-appearance">
          <span class="theme-label-small">TEMA DE COLOR</span>
          <div class="theme-dots-row">
            <button
              v-for="key in themeKeys"
              :key="key"
              class="theme-dot-btn"
              :class="{ active: activeTheme === key }"
              :style="{ backgroundColor: themes[key].swatch }"
              :title="themes[key].label"
              @click="setTheme(key)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <ChangePasswordModal :show="showPasswordModal" @close="showPasswordModal = false" />
  <UserProfileModal :show="showProfileModal" @close="showProfileModal = false" />
</template>

<style scoped>
.visitor-sidebar {
  position: fixed;
  left: 0; top: 0;
  height: 100vh;
  width: 260px;
  background: rgba(8, 12, 22, 0.97);
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  gap: 0;
  z-index: 100;
  padding: 1.5rem 1rem;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.visitor-sidebar.collapsed {
  width: 80px;
  padding: 1.5rem 0.75rem;
  cursor: pointer;
}

/* Brand */
.visitor-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 1.25rem;
  overflow: hidden;
}

.visitor-sidebar.collapsed .visitor-brand {
  justify-content: center;
}

.brand-icon {
  width: 38px; height: 38px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: white;
  box-shadow: 0 4px 12px var(--color-primary-glow);
  flex-shrink: 0;
}

.brand-name {
  display: block;
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.brand-tag {
  display: block;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-primary);
  font-weight: 600;
}

.brand-text-container {
  flex: 1;
  white-space: nowrap;
}
.visitor-sidebar.collapsed .brand-text-container {
  display: none;
}

.sidebar-toggle {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}
.sidebar-toggle:hover {
  background: rgba(255,255,255,0.05);
  color: white;
}
.visitor-sidebar.collapsed .sidebar-toggle {
  display: none;
}

/* Greeting */
.visitor-greeting {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  margin-bottom: 1.5rem;
  overflow: hidden;
  white-space: nowrap;
}

.visitor-sidebar.collapsed .visitor-greeting {
  padding: 0.5rem;
  justify-content: center;
}
.visitor-sidebar.collapsed .greeting-text {
  display: none;
}

.greeting-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  display: flex; align-items: center; justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.greeting-name {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.greeting-role {
  display: block;
  font-size: 0.72rem;
  color: var(--color-primary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Nav */
.visitor-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.nav-section-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0 0.5rem;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
}

.visitor-sidebar.collapsed .nav-section-label {
  display: none;
}

.visitor-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
}

.visitor-sidebar.collapsed .visitor-link {
  padding: 0.85rem;
  justify-content: center;
}
.visitor-sidebar.collapsed .visitor-link span {
  display: none;
}

.visitor-link:hover {
  background: rgba(255,255,255,0.05);
  color: white;
}

.visitor-link.active {
  background: rgba(var(--color-primary-rgb, 59,130,246), 0.12);
  color: var(--color-primary);
  font-weight: 600;
  border-left: 3px solid var(--color-primary);
  padding-left: calc(1rem - 3px);
}

.link-icon {
  width: 18px; height: 18px;
  flex-shrink: 0;
}

.link-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-badge {
  position: absolute;
  top: -7px; right: -8px;
  background: #ef4444;
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  width: 16px; height: 16px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}

/* Footer */
.visitor-footer {
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.theme-label-small {
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  padding: 0 0.25rem;
}

.theme-dots-row {
  display: flex;
  gap: 0.5rem;
  padding: 0 0.25rem;
  flex-wrap: wrap;
}

.theme-dot-btn {
  width: 18px; height: 18px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  padding: 0;
  transition: all 0.2s;
}

.theme-dot-btn:hover { transform: scale(1.2); }
.theme-dot-btn.active { border-color: white; transform: scale(1.25); box-shadow: 0 0 0 3px rgba(255,255,255,0.15); }

/* Settings */
.visitor-btn-settings {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -0.5rem;
  white-space: nowrap;
  overflow: hidden;
}

.visitor-sidebar.collapsed .visitor-btn-settings {
  padding: 0.85rem;
}
.visitor-sidebar.collapsed .visitor-btn-settings span,
.visitor-sidebar.collapsed .visitor-btn-settings {
  /* Hide the text content but keep icon if we wrapped text in span */
}
/* If text isn't in a span, we can just hide it and use width */
.visitor-sidebar.collapsed .visitor-btn-settings {
  color: transparent; 
  position: relative;
}
.visitor-sidebar.collapsed .visitor-btn-settings svg {
  color: var(--color-text-secondary);
  position: absolute;
}
.visitor-sidebar.collapsed .visitor-btn-settings:hover svg {
  color: white;
}

.visitor-btn-settings:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: white;
}

.visitor-logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  color: #f87171;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
}

.visitor-sidebar.collapsed .visitor-logout-btn {
  padding: 0.85rem;
  color: transparent;
  position: relative;
}
.visitor-sidebar.collapsed .visitor-logout-btn svg {
  color: #f87171;
  position: absolute;
}
.visitor-sidebar.collapsed .visitor-logout-btn:hover svg {
  color: #fca5a5;
}

.visitor-logout-btn:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

/* Sidebar Toast */
.sidebar-toast {
  position: fixed;
  bottom: 1.5rem;
  left: 280px; /* Al lado del sidebar */
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(var(--color-primary-rgb, 59,130,246), 0.3);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(var(--color-primary-rgb, 59,130,246), 0.15);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  z-index: 9999;
  width: 320px;
  backdrop-filter: blur(10px);
}

.toast-icon {
  background: rgba(var(--color-primary-rgb, 59,130,246), 0.15);
  color: var(--color-primary);
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
}

.toast-content strong {
  display: block;
  font-size: 0.85rem;
  color: white;
  margin-bottom: 0.2rem;
}

.toast-content p {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.3;
  margin: 0;
}

.toast-close {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0;
  display: flex;
  transition: color 0.2s;
}

.toast-close:hover {
  color: white;
}

.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* Settings Modal Styles (Duplicated from AppNavbar for consistency) */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-container {
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  padding: 2rem;
  position: relative;
  box-shadow: 0 15px 35px rgba(0,0,0,0.4);
  animation: modalFadeIn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: translateY(15px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1.25rem;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.75rem;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: white;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1.5rem;
}

.settings-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.settings-option-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;
  color: white;
}

.settings-option-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.option-icon-wrapper {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.settings-option-text {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.settings-option-title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.settings-option-desc {
  font-size: 0.8rem;
  color: #94a3b8;
}

.chevron-icon {
  color: #94a3b8;
  opacity: 0.5;
  transition: opacity 0.2s, transform 0.2s;
}

.settings-option-btn:hover .chevron-icon {
  opacity: 1;
  transform: translateX(4px);
}

.settings-appearance {
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (max-width: 900px) {
  .visitor-sidebar, .visitor-sidebar.collapsed {
    top: auto;
    bottom: 0;
    width: 100%;
    height: 70px;
    flex-direction: row;
    padding: 0;
    border-right: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(8, 12, 22, 1);
    z-index: 1000;
  }
  
  .visitor-brand, .visitor-greeting, .visitor-footer, .nav-section-label, .sidebar-toast {
    display: none !important;
  }
  
  .visitor-nav {
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    gap: 0;
  }
  
  .visitor-link, .visitor-sidebar.collapsed .visitor-link {
    flex-direction: column;
    padding: 0.5rem;
    gap: 0.3rem;
    border: none !important;
    flex: 1;
    justify-content: center;
    background: transparent !important;
  }
  
  .visitor-link span, .visitor-sidebar.collapsed .visitor-link span {
    display: block !important;
    font-size: 0.65rem;
    font-weight: 500;
  }
  
  .visitor-link.active {
    color: var(--color-primary);
  }
  
  .visitor-link.active .link-icon {
    transform: scale(1.1);
  }
  
  .notif-badge {
    top: -4px; right: -8px;
    width: 14px; height: 14px;
    font-size: 0.55rem;
  }
}
</style>
