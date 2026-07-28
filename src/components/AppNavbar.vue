<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTheme } from '../composables/useTheme'
import ChangePasswordModal from './ChangePasswordModal.vue'

const authStore = useAuthStore()
const router = useRouter()
const { activeTheme, themeKeys, themes, setTheme } = useTheme()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const showPasswordModal = ref(false)

// Obtener iniciales del usuario logueado
const userInitials = computed(() => {
  if (!authStore.user || !authStore.user.name) return 'U'
  const parts = authStore.user.name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})
</script>

<template>
  <!-- If authenticated, show vertical sidebar -->
  <aside v-if="authStore.isAuthenticated" class="sidebar">
    <!-- Top Branding -->
    <div class="sidebar-brand">
      <div class="brand-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1.1.1-1.3.6l-.3.7c-.2.5 0 1.1.4 1.4L9 12l-3 3-2.5-.5c-.4-.1-.8.1-1 .4l-.3.5c-.2.4-.1.9.3 1.1L6 18l1.5 3.5c.2.4.7.5 1.1.3l.5-.3c.3-.2.5-.6.4-1L9 18l3-3 3.1 5.4c.3.5.9.6 1.4.4l.7-.3c.5-.2.7-.8.6-1.3z" />
        </svg>
      </div>
      <span class="brand-name">SkyFlow</span>
    </div>

    <!-- Navigation Menu Links -->
    <nav class="sidebar-menu">
      <RouterLink to="/" class="menu-link" active-class="active">
        <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
        <span>Panel de Vuelos</span>
      </RouterLink>

      <RouterLink 
        v-if="authStore.user?.role === 'Operador' || authStore.user?.role === 'Administrador'"
        to="/mantenimiento" 
        class="menu-link" 
        active-class="active"
      >
        <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span>Gestión de Vuelos</span>
      </RouterLink>

      <RouterLink 
        to="/aerolineas" 
        class="menu-link" 
        active-class="active"
      >
        <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 7.6L12 2 2 7.6l10 5.6 10-5.6z"/>
          <path d="M2 12.4l10 5.6 10-5.6"/>
          <path d="M2 17.2l10 5.6 10-5.6"/>
        </svg>
        <span>Gestión de Aerolíneas</span>
      </RouterLink>

        <RouterLink 
          to="/aeropuertos" 
          class="menu-link" 
          active-class="active"
        >
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>Gestión de Aeropuertos</span>
        </RouterLink>

        <RouterLink 
          v-if="authStore.user?.role === 'Administrador'"
          to="/usuarios" 
          class="menu-link" 
          active-class="active"
        >
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Gestión de Usuarios</span>
        </RouterLink>

        <RouterLink 
          v-if="authStore.user?.role === 'Administrador' || authStore.user?.role === 'Auditor'"
          to="/auditoria" 
          class="menu-link" 
          active-class="active"
        >
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Auditoría</span>
        </RouterLink>

        <RouterLink 
          v-if="authStore.user?.role === 'Administrador' || authStore.user?.role === 'Auditor'"
          to="/reportes" 
          class="menu-link" 
          active-class="active"
        >
          <svg class="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18" />
            <rect x="7" y="10" width="4" height="11" rx="1" ry="1" />
            <rect x="15" y="4" width="4" height="17" rx="1" ry="1" />
          </svg>
          <span>Reportes</span>
        </RouterLink>
      </nav>

    <!-- Bottom Footer (Theme Selector, Profile, Logout) -->
    <div class="sidebar-footer">
      <!-- Status Badge -->
      <div class="system-status online">
        <span class="status-dot"></span>
        <span class="status-text">Terminal En Línea</span>
      </div>

      <!-- Color Theme Picker -->
      <div class="theme-picker-section">
        <span class="theme-label">TEMA DE COLOR</span>
        <div class="theme-dots">
          <button
            v-for="key in themeKeys"
            :key="key"
            class="theme-dot"
            :class="{ active: activeTheme === key }"
            :style="{ backgroundColor: themes[key].swatch }"
            :title="themes[key].label"
            @click="setTheme(key)"
          />
        </div>
      </div>

      <!-- User Profile Group -->
      <div class="profile-card">
        <div class="avatar">
          {{ userInitials }}
        </div>
        <div class="profile-meta">
          <span class="user-name" :title="authStore.user?.name">{{ authStore.user?.name }}</span>
          <span class="user-role">{{ authStore.user?.role }}</span>
        </div>
      </div>

      <!-- Settings / Configuración -->
      <button @click="showPasswordModal = true" class="sidebar-btn-settings">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span>Configuración (Contraseña)</span>
      </button>

      <!-- Logout Action -->
      <button @click="handleLogout" class="sidebar-btn-logout">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </aside>

  <!-- If NOT authenticated, show a simple top bar with brand name -->
  <header v-else class="simple-top-bar">
    <div class="container navbar-container">
      <div class="navbar-brand">
        <div class="brand-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1.1.1-1.3.6l-.3.7c-.2.5 0 1.1.4 1.4L9 12l-3 3-2.5-.5c-.4-.1-.8.1-1 .4l-.3.5c-.2.4-.1.9.3 1.1L6 18l1.5 3.5c.2.4.7.5 1.1.3l.5-.3c.3-.2.5-.6.4-1L9 18l3-3 3.1 5.4c.3.5.9.6 1.4.4l.7-.3c.5-.2.7-.8.6-1.3z" />
          </svg>
        </div>
        <span class="brand-name">SkyFlow</span>
      </div>
      <div class="system-status offline">
        <svg class="lock-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        <span class="status-text">Acceso Restringido</span>
      </div>
    </div>
  </header>

  <ChangePasswordModal :show="showPasswordModal" @close="showPasswordModal = false" />
</template>

<style scoped>
/* Sidebar Container */
.sidebar {
  width: 280px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(11, 15, 25, 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-right: 1px solid var(--color-border);
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  box-sizing: border-box;
}

/* Brand Branding Header */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 2rem;
}

.brand-icon {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #1e40af 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.brand-icon svg {
  width: 20px;
  height: 20px;
}

.brand-name {
  font-size: 1.35rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.03em;
}

/* Sidebar Menu List */
.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  color: var(--color-text-secondary);
  font-weight: 600;
  text-decoration: none;
  font-size: 0.925rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.menu-link:hover {
  background: rgba(255, 255, 255, 0.03);
  color: white;
}

.menu-link.active {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.35);
}

.menu-icon {
  width: 18px;
  height: 18px;
  color: inherit;
}

/* Sidebar Footer area */
.sidebar-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.system-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.15);
  padding: 0.4rem 0.75rem;
  border-radius: 20px;
  width: fit-content;
  align-self: center;
}

.system-status.online {
  color: #34d399;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
}

/* Theme Picker */
.theme-picker-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.theme-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.08em;
}

.theme-dots {
  display: flex;
  gap: 0.6rem;
}

.theme-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.theme-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
  padding: 0;
  background: none;
}

.theme-dot:hover {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.15);
}

.theme-dot.active {
  border-color: white;
  transform: scale(1.25);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

/* Profile Card */
.profile-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--color-border);
  padding: 0.75rem 1rem;
  border-radius: 10px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.profile-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.user-role {
  color: var(--color-text-muted);
  font-size: 0.75rem;
  text-transform: capitalize;
}

/* Logout Button */
.sidebar-btn-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.85rem;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.15);
  color: #f87171;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.sidebar-btn-logout:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

/* Settings Button */
.sidebar-btn-settings {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.85rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-bottom: -0.5rem;
}

.sidebar-btn-settings:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Simple Top Bar (When logged out) */
.simple-top-bar {
  height: 70px;
  background: rgba(11, 15, 25, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  width: 100%;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.system-status.offline {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.lock-icon {
  color: #ef4444;
}

/* Responsive sidebar drawer for smaller viewports */
@media (max-width: 1023px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }
  .sidebar-brand {
    margin-bottom: 1rem;
  }
  .sidebar-menu {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-bottom: 1rem;
  }
  .menu-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
  .sidebar-footer {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 1rem;
  }
  .theme-picker-section {
    display: none; /* Hide theme picker on mobile/tablet to save space */
  }
  .sidebar-btn-logout {
    width: auto;
    padding: 0.5rem 1rem;
  }
}
</style>
