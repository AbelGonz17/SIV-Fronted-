<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  show: Boolean
})
const emit = defineEmits(['close'])

const authStore = useAuthStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const localError = ref('')
const localSuccess = ref('')

const handleClose = () => {
  currentPassword.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  localError.value = ''
  localSuccess.value = ''
  emit('close')
}

const submitForm = async () => {
  localError.value = ''
  localSuccess.value = ''
  
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    localError.value = 'Todos los campos son obligatorios.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    localError.value = 'La nueva contraseña y la confirmación no coinciden.'
    return
  }

  loading.value = true
  const success = await authStore.changePassword(currentPassword.value, newPassword.value)
  loading.value = false

  if (success) {
    localSuccess.value = '¡Contraseña cambiada exitosamente!'
    setTimeout(() => {
      handleClose()
    }, 2000)
  } else {
    localError.value = authStore.error || 'No se pudo cambiar la contraseña.'
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="modal-backdrop" @click="handleClose">
      <div class="modal-container glass-card" @click.stop>
        <button class="modal-close" @click="handleClose" :disabled="loading">&times;</button>
        <h2 class="modal-title">Cambiar Contraseña</h2>
        <p class="modal-subtitle">Ingresa tu contraseña actual y la nueva contraseña para actualizarla.</p>

        <form @submit.prevent="submitForm" class="password-form">
          <div class="form-group">
            <label class="form-label">Contraseña Actual</label>
            <input 
              v-model="currentPassword" 
              type="password" 
              class="form-input" 
              placeholder="Contraseña actual"
              :disabled="loading"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Nueva Contraseña</label>
            <input 
              v-model="newPassword" 
              type="password" 
              class="form-input" 
              placeholder="Nueva contraseña (mínimo 8 caracteres)"
              :disabled="loading"
              minlength="8"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Confirmar Nueva Contraseña</label>
            <input 
              v-model="confirmPassword" 
              type="password" 
              class="form-input" 
              placeholder="Repite la nueva contraseña"
              :disabled="loading"
              minlength="8"
              required 
            />
          </div>

          <div v-if="localError" class="alert alert-error">
            {{ localError }}
          </div>
          <div v-if="localSuccess" class="alert alert-success">
            {{ localSuccess }}
          </div>

          <div class="modal-footer" style="margin-top: 1.5rem;">
            <button type="button" @click="handleClose" class="btn btn-secondary" :disabled="loading">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Actualizando...' : 'Cambiar Contraseña' }}
            </button>
          </div>
        </form>
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
  max-width: 400px;
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

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
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

.btn-secondary {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: white;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert {
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.85rem;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alert-success {
  background: rgba(16, 185, 129, 0.1);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.2);
}
</style>
