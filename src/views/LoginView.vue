<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) return
  
  const success = await authStore.login(email.value, password.value)
  if (success) {
    router.push('/')
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Animated background particles -->
    <div class="bg-stars">
      <div v-for="n in 20" :key="n" class="star" :style="{
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 8 + 's',
        animationDuration: 4 + Math.random() * 6 + 's'
      }"></div>
    </div>

    <!-- Login Container -->
    <div class="login-container glass-card animate-fade-in">
      <div class="login-header">
        <div class="brand-logo-large">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1.1.1-1.3.6l-.3.7c-.2.5 0 1.1.4 1.4L9 12l-3 3-2.5-.5c-.4-.1-.8.1-1 .4l-.3.5c-.2.4-.1.9.3 1.1L6 18l1.5 3.5c.2.4.7.5 1.1.3l.5-.3c.3-.2.5-.6.4-1L9 18l3-3 3.1 5.4c.3.5.9.6 1.4.4l.7-.3c.5-.2.7-.8.6-1.3z" />
          </svg>
        </div>
        <h1 class="login-title">Bienvenido a SkyFlow</h1>
        <p class="login-subtitle">Ingresa tus credenciales para acceder a la terminal de vuelos.</p>
      </div>

      <!-- Error Alerts -->
      <transition name="alert-slide">
        <div v-if="authStore.error" class="login-alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div class="alert-text">{{ authStore.error }}</div>
        </div>
      </transition>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Email Input -->
        <div class="form-group">
          <label class="form-label" for="login-email">Correo Electrónico</label>
          <div class="input-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input 
              id="login-email" 
              v-model="email"
              type="email" 
              class="form-input with-icon" 
              placeholder="nombre@ejemplo.com"
              required
              :disabled="authStore.loading"
            />
          </div>
        </div>

        <!-- Password Input -->
        <div class="form-group">
          <label class="form-label" for="login-password">Contraseña</label>
          <div class="input-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input 
              id="login-password" 
              v-model="password"
              :type="showPassword ? 'text' : 'password'" 
              class="form-input with-icon password-input" 
              placeholder="••••••••"
              required
              :disabled="authStore.loading"
            />
            <button 
              type="button" 
              class="password-toggle-btn"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <span v-if="showPassword">Ocultar</span>
              <span v-else>Mostrar</span>
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          class="btn btn-primary btn-submit-login" 
          :disabled="authStore.loading || !email || !password"
        >
          <span v-if="authStore.loading" class="login-spinner"></span>
          <span v-else>Iniciar Sesión</span>
        </button>
      </form>   
    </div>
  </div>
</template>

<style scoped>
.login-page {
  width: 100vw;
  min-height: 100vh;
  margin-top: -70px; /* Offset navigation bar height */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
}

/* Background star effect */
.bg-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  opacity: 0.1;
  animation: starPulse infinite ease-in-out;
}

@keyframes starPulse {
  0% { transform: scale(0.8); opacity: 0.1; }
  50% { transform: scale(1.5); opacity: 0.6; box-shadow: 0 0 4px white; }
  100% { transform: scale(0.8); opacity: 0.1; }
}

/* Container */
.login-container {
  width: 100%;
  max-width: 440px;
  padding: 2.5rem;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  border-color: rgba(255, 255, 255, 0.12);
}

.login-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-logo-large {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #1e40af 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1.25rem;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transform: rotate(45deg);
  animation: logoFloat 4s ease-in-out infinite;
}

.brand-logo-large svg {
  width: 28px;
  height: 28px;
  transform: rotate(-45deg);
}

@keyframes logoFloat {
  0% { transform: rotate(45deg) translateY(0px); }
  50% { transform: rotate(45deg) translateY(-4px); }
  100% { transform: rotate(45deg) translateY(0px); }
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.login-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin-top: 0.35rem;
  line-height: 1.4;
}

/* Alert styling */
.login-alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #fca5a5;
  font-size: 0.8rem;
}

.alert-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.alert-text {
  line-height: 1.4;
}

.alert-slide-enter-active, .alert-slide-leave-active {
  transition: all 0.3s ease;
}

.alert-slide-enter-from, .alert-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Form inputs & icons */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  width: 18px;
  height: 18px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.form-input.with-icon {
  padding-left: 2.75rem;
  width: 100%;
}

.password-input {
  padding-right: 3.5rem;
}

.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.password-toggle-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.12);
}

.btn-submit-login {
  margin-top: 0.5rem;
  height: 46px;
  font-size: 0.95rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Hint Box */
.credentials-hint {
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.01);
  border-radius: 8px;
  padding: 0.85rem 1rem;
  font-size: 0.8rem;
}

.hint-header {
  margin-bottom: 0.4rem;
}

.hint-tag {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.hint-body {
  color: var(--color-text-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.hint-body code {
  color: white;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  font-family: monospace;
}
</style>
