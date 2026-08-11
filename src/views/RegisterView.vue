<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { authService } from '../services/authService'
import { getErrorMessage } from '../services/apiClient'

const router = useRouter()
const authStore = useAuthStore()

const nombre = ref('')
const correo = ref('')
const contrasena = ref('')
const confirmarContrasena = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const localError = ref('')
const successMsg = ref('')
const loading = ref(false)

const handleRegister = async () => {
  localError.value = ''
  successMsg.value = ''

  if (!nombre.value || !correo.value || !contrasena.value || !confirmarContrasena.value) {
    localError.value = 'Todos los campos son obligatorios.'
    return
  }
  if (contrasena.value !== confirmarContrasena.value) {
    localError.value = 'Las contraseñas no coinciden.'
    return
  }
  if (contrasena.value.length < 6) {
    localError.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  loading.value = true
  try {
    // 1. Registrar la cuenta usando authService
    await authService.register({
      nombre: nombre.value.trim(),
      correo: correo.value.trim(),
      contrasena: contrasena.value
    })

    // 2. Iniciar sesión automáticamente con las credenciales recién creadas
    const success = await authStore.login(correo.value.trim(), contrasena.value)

    if (success) {
      // El visitante siempre va a /visitante
      router.push('/visitante')
    } else {
      successMsg.value = '¡Cuenta creada! Ahora puedes iniciar sesión.'
      setTimeout(() => router.push('/login'), 2000)
    }
  } catch (err: any) {
    localError.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <!-- Animated background particles -->
    <div class="bg-stars">
      <div v-for="n in 20" :key="n" class="star" :style="{
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 8 + 's',
        animationDuration: 4 + Math.random() * 6 + 's'
      }"></div>
    </div>

    <!-- Register Container -->
    <div class="register-container glass-card animate-fade-in">
      <!-- Header -->
      <div class="reg-header">
        <div class="brand-logo-large">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1.1.1-1.3.6l-.3.7c-.2.5 0 1.1.4 1.4L9 12l-3 3-2.5-.5c-.4-.1-.8.1-1 .4l-.3.5c-.2.4-.1.9.3 1.1L6 18l1.5 3.5c.2.4.7.5 1.1.3l.5-.3c.3-.2.5-.6.4-1L9 18l3-3 3.1 5.4c.3.5.9.6 1.4.4l.7-.3c.5-.2.7-.8.6-1.3z"/>
          </svg>
        </div>
        <h1 class="reg-title">Crear Cuenta en SkyFlow</h1>
        <p class="reg-subtitle">Regístrate para seguir vuelos y recibir notificaciones en tiempo real.</p>
      </div>

      <!-- Error Alert -->
      <Transition name="alert-slide">
        <div v-if="localError" class="alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon" width="18" height="18">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ localError }}</span>
        </div>
      </Transition>

      <!-- Success Alert -->
      <Transition name="alert-slide">
        <div v-if="successMsg" class="alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>{{ successMsg }}</span>
        </div>
      </Transition>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="reg-form">

        <!-- Nombre -->
        <div class="form-group">
          <label class="form-label" for="reg-nombre">Nombre Completo</label>
          <div class="input-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              id="reg-nombre"
              v-model="nombre"
              type="text"
              class="form-input with-icon"
              placeholder="Ej. Francis Ramírez"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Correo -->
        <div class="form-group">
          <label class="form-label" for="reg-email">Correo Electrónico</label>
          <div class="input-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <input
              id="reg-email"
              v-model="correo"
              type="email"
              class="form-input with-icon"
              placeholder="nombre@ejemplo.com"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label class="form-label" for="reg-pass">Contraseña</label>
          <div class="input-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="reg-pass"
              v-model="contrasena"
              :type="showPassword ? 'text' : 'password'"
              class="form-input with-icon password-input"
              placeholder="Mín. 6 caracteres"
              required
              :disabled="loading"
            />
            <button type="button" class="password-toggle-btn" @click="showPassword = !showPassword" tabindex="-1">
              <span v-if="showPassword">Ocultar</span>
              <span v-else>Mostrar</span>
            </button>
          </div>
        </div>

        <!-- Confirmar Contraseña -->
        <div class="form-group">
          <label class="form-label" for="reg-pass2">Confirmar Contraseña</label>
          <div class="input-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <input
              id="reg-pass2"
              v-model="confirmarContrasena"
              :type="showConfirm ? 'text' : 'password'"
              class="form-input with-icon password-input"
              :class="{ 'input-mismatch': confirmarContrasena && contrasena !== confirmarContrasena }"
              placeholder="Repetir contraseña"
              required
              :disabled="loading"
            />
            <button type="button" class="password-toggle-btn" @click="showConfirm = !showConfirm" tabindex="-1">
              <span v-if="showConfirm">Ocultar</span>
              <span v-else>Mostrar</span>
            </button>
          </div>
          <p v-if="confirmarContrasena && contrasena !== confirmarContrasena" class="mismatch-hint">
            Las contraseñas no coinciden.
          </p>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          class="btn btn-primary btn-submit-reg"
          :disabled="loading || !nombre || !correo || !contrasena || !confirmarContrasena"
        >
          <span v-if="loading" class="login-spinner"></span>
          <span v-else>Crear Cuenta</span>
        </button>
      </form>

      <!-- Link al Login -->
      <div class="login-link-section">
        <p>¿Ya tienes una cuenta? <router-link to="/login" class="login-link">Inicia sesión aquí</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 2rem 1.5rem;
}

/* Stars background */
.bg-stars {
  position: absolute; top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none; z-index: 1;
}
.star {
  position: absolute;
  width: 2px; height: 2px;
  background: white; border-radius: 50%;
  opacity: 0.1;
  animation: starPulse infinite ease-in-out;
}
@keyframes starPulse {
  0%   { transform: scale(0.8); opacity: 0.1; }
  50%  { transform: scale(1.5); opacity: 0.6; box-shadow: 0 0 4px white; }
  100% { transform: scale(0.8); opacity: 0.1; }
}

/* Container */
.register-container {
  width: 100%;
  max-width: 460px;
  padding: 2.5rem;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-color: rgba(255, 255, 255, 0.12);
}

/* Header */
.reg-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-logo-large {
  width: 52px; height: 52px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: white;
  margin-bottom: 1.25rem;
  box-shadow: 0 6px 20px var(--color-primary-glow);
  transform: rotate(45deg);
  animation: logoFloat 4s ease-in-out infinite;
}
.brand-logo-large svg {
  width: 28px; height: 28px;
  transform: rotate(-45deg);
}
@keyframes logoFloat {
  0%   { transform: rotate(45deg) translateY(0px); }
  50%  { transform: rotate(45deg) translateY(-4px); }
  100% { transform: rotate(45deg) translateY(0px); }
}

.reg-title {
  font-size: 1.65rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}
.reg-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 0.4rem;
  line-height: 1.45;
}

/* Alerts */
.alert-error, .alert-success {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.82rem;
  line-height: 1.4;
}
.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}
.alert-success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #6ee7b7;
}
.alert-slide-enter-active, .alert-slide-leave-active { transition: all 0.3s ease; }
.alert-slide-enter-from, .alert-slide-leave-to { opacity: 0; transform: translateY(-10px); }

/* Form */
.reg-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  width: 18px; height: 18px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.form-input.with-icon { padding-left: 2.75rem; width: 100%; }
.password-input { padding-right: 5rem; }

.password-toggle-btn {
  position: absolute; right: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem; border-radius: 4px;
  font-size: 0.7rem; font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer; transition: all 0.2s;
  white-space: nowrap;
}
.password-toggle-btn:hover { color: white; background: rgba(255, 255, 255, 0.12); }

.input-mismatch { border-color: rgba(239, 68, 68, 0.5) !important; }
.input-mismatch:focus { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15) !important; }

.mismatch-hint {
  font-size: 0.75rem;
  color: #f87171;
  margin-top: 0.3rem;
}

.btn-submit-reg {
  margin-top: 0.25rem;
  height: 46px;
  font-size: 0.95rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-spinner {
  width: 20px; height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Login link */
.login-link-section {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}
.login-link {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}
.login-link:hover { color: white; }
</style>
