<script setup>
import { useAuthStore } from '../stores/auth'
import { computed } from 'vue'

const props = defineProps({
  show: Boolean
})
const emit = defineEmits(['close'])

const authStore = useAuthStore()

const handleClose = () => {
  emit('close')
}

const initials = computed(() => {
  if (!authStore.user || !authStore.user.name) return 'U'
  const parts = authStore.user.name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click="handleClose">
      <div class="modal-container glass-card" @click.stop>
        <button class="modal-close" @click="handleClose">&times;</button>
        <h2 class="modal-title">Mi Perfil</h2>
        <p class="modal-subtitle">Información de tu cuenta en SkyFlow.</p>

        <div class="profile-header">
          <div class="profile-avatar">{{ initials }}</div>
          <div class="profile-title">
            <h3>{{ authStore.user?.name || 'Usuario SkyFlow' }}</h3>
            <span class="profile-role-badge">{{ authStore.user?.role || 'Visitante' }}</span>
          </div>
        </div>

        <div class="profile-details">
          <div class="detail-group">
            <label class="detail-label">Nombre Completo</label>
            <div class="detail-value">{{ authStore.user?.name || 'No especificado' }}</div>
          </div>
          
          <div class="detail-group">
            <label class="detail-label">Correo Electrónico</label>
            <div class="detail-value">{{ authStore.user?.email || 'No especificado' }}</div>
          </div>
        </div>

        <div class="modal-footer" style="margin-top: 1.5rem;">
          <button type="button" @click="handleClose" class="btn btn-primary">Cerrar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
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
  width: 100%;
  max-width: 420px;
  background: var(--color-bg);
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--color-border);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-muted);
  cursor: pointer;
  line-height: 1;
}
.modal-close:hover {
  color: var(--color-text);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text);
}

.modal-subtitle {
  margin: 0.5rem 0 1.5rem 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: white;
  font-size: 1.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.profile-title h3 {
  margin: 0 0 0.4rem 0;
  font-size: 1.15rem;
  color: white;
}

.profile-role-badge {
  display: inline-block;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.detail-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-value {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
}



.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 0.875rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: white;
}
</style>
