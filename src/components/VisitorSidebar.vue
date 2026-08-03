<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useVisitor } from '../composables/useVisitor'
import { useTheme } from '../composables/useTheme'
import ChangePasswordModal from './ChangePasswordModal.vue'
import { useSignalR } from '../composables/useSignalR'
import { onUnmounted } from 'vue'

const authStore = useAuthStore()
const router = useRouter()
const { fetchNotifications, notifications, addNotification } = useVisitor()
const { activeTheme, themeKeys, themes, setTheme } = useTheme()
const { startConnection, stopConnection, onPersonalAlert, offPersonalAlert } = useSignalR()

const unreadCount = computed(() => notifications.value.filter(n => !n.fueLeida).length)
const toast = ref({ show: false, message: '' })

let toastTimeout = null
const showToast = (message) => {
  toast.value = { show: true, message }
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => { toast.value.show = false }, 5000)
}

const handleAlert = (mensaje) => {
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

  <aside class="visitor-sidebar">
    <!-- Logo / Brand -->
    <div class="visitor-brand">
      <div class="brand-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
          <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
        </svg>
      </div>
      <div>
        <span class="brand-name">SkyFlow</span>
        <span class="brand-tag">Portal de Vuelos</span>
      </div>
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
      <!-- Theme Picker -->
      <div class="theme-section">
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

      <!-- Settings / Configuración -->
      <button @click="showPasswordModal = true" class="visitor-btn-settings">
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

  <ChangePasswordModal :show="showPasswordModal" @close="showPasswordModal = false" />
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
}

/* Brand */
.visitor-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 1.25rem;
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

.theme-section {}

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
</style>
