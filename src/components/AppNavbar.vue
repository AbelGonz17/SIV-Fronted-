<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

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
  <nav class="navbar">
    <div class="container navbar-container">
      <!-- Logo -->
      <RouterLink to="/" class="navbar-brand">
        <div class="brand-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1.1.1-1.3.6l-.3.7c-.2.5 0 1.1.4 1.4L9 12l-3 3-2.5-.5c-.4-.1-.8.1-1 .4l-.3.5c-.2.4-.1.9.3 1.1L6 18l1.5 3.5c.2.4.7.5 1.1.3l.5-.3c.3-.2.5-.6.4-1L9 18l3-3 3.1 5.4c.3.5.9.6 1.4.4l.7-.3c.5-.2.7-.8.6-1.3z" />
          </svg>
        </div>
        <span class="brand-name">SkyFlow</span>
      </RouterLink>

      <div v-if="authStore.isAuthenticated" class="navbar-links">
        <RouterLink to="/" class="nav-link" active-class="active">
          <span>Panel de Vuelos</span>
        </RouterLink>
        <RouterLink 
          v-if="authStore.user?.role === 'Operador' || authStore.user?.role === 'Administrador'"
          to="/mantenimiento" 
          class="nav-link" 
          active-class="active"
        >
          <span>Gestión de Vuelos</span>
        </RouterLink>
        <RouterLink 
          to="/aerolineas" 
          class="nav-link" 
          active-class="active"
        >
          <span>Gestión de Aerolíneas</span>
        </RouterLink>
      </div>

      <!-- Quick Action / User Profile -->
      <div class="navbar-actions">
        <!-- Logged In User Control -->
        <div v-if="authStore.isAuthenticated" class="user-control">
          <!-- Server Status -->
          <div class="system-status online">
            <span class="status-dot"></span>
            <span class="status-text">Terminal En Línea</span>
          </div>

          <!-- Profile Badge -->
          <div class="profile-badge-group">
            <div class="avatar" :title="`${authStore.user?.name} (${authStore.user?.role})`">
              {{ userInitials }}
            </div>
            <div class="user-meta-desktop">
              <span class="user-name">{{ authStore.user?.name }}</span>
              <span class="user-role">{{ authStore.user?.role }}</span>
            </div>
          </div>

          <!-- Logout Button -->
          <button @click="handleLogout" class="btn-logout" title="Cerrar Sesión">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        <!-- Logged Out Secure Indicator -->
        <div v-else class="system-status offline">
          <svg class="lock-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span class="status-text">Acceso Restringido</span>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  height: 70px;
  background: rgba(11, 15, 25, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.35rem;
  color: white;
  letter-spacing: -0.02em;
}

.brand-icon {
  width: 36px;
  height: 36px;
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
  transform: rotate(45deg);
}

.brand-name {
  background: linear-gradient(135deg, #ffffff 50%, #9ca3af 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.navbar-links {
  display: flex;
  gap: 1.5rem;
  height: 100%;
  align-items: center;
}

.nav-link {
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.04);
}

.nav-link.active {
  color: var(--color-primary);
  background: rgba(59, 130, 246, 0.08);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 10%;
  width: 80%;
  height: 2px;
  background-color: var(--color-primary);
  box-shadow: 0 0 10px var(--color-primary);
  border-radius: 2px;
}

.navbar-actions {
  display: flex;
  align-items: center;
}

.user-control {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.system-status.online {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.system-status.offline {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.lock-icon {
  width: 12px;
  height: 12px;
}

.status-dot {
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
  box-shadow: 0 0 8px #10b981;
}

.status-text {
  font-size: 0.75rem;
}

/* Profile avatar */
.profile-badge-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.avatar:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--color-primary);
}

.user-meta-desktop {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
}

.user-role {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

/* Logout button */
.btn-logout {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: 8px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout svg {
  width: 16px;
  height: 16px;
}

.btn-logout:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

@media (max-width: 768px) {
  .user-meta-desktop {
    display: none;
  }
  .system-status.online {
    display: none;
  }
}

@media (max-width: 640px) {
  .navbar-links {
    gap: 0.75rem;
  }
  
  .nav-link.active::after {
    bottom: -8px;
  }
}
</style>
