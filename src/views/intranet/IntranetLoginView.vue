<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

const handleLogin = async () => {
  if (!email.value || !password.value) return
  
  const success = await authStore.login(email.value, password.value, rememberMe.value)
  if (success) {
    const isVisitor = authStore.user?.role === 'Visitante'
    if (isVisitor) {
      // Simulate invalid credentials for visitors to hide intranet existence/roles
      authStore.error = 'Credenciales incorrectas'
      await authStore.logout()
      return
    }
    // Employee logic: redirect to intranet dashboard
    router.push('/dashboard')
  }
}
</script>

<template>
  <div class="intranet-login-page">
    <div class="intranet-login-container animate-fade-in">
      <div class="intranet-login-header">
        <div class="intranet-brand-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-1.1.1-1.3.6l-.3.7c-.2.5 0 1.1.4 1.4L9 12l-3 3-2.5-.5c-.4-.1-.8.1-1 .4l-.3.5c-.2.4-.1.9.3 1.1L6 18l1.5 3.5c.2.4.7.5 1.1.3l.5-.3c.3-.2.5-.6.4-1L9 18l3-3 3.1 5.4c.3.5.9.6 1.4.4l.7-.3c.5-.2.7-.8.6-1.3z" />
          </svg>
        </div>
        <h1 class="intranet-login-title">SkyFlow Intranet</h1>
        <p class="intranet-login-subtitle">Acceso exclusivo para personal administrativo y operativo.</p>
      </div>

      <!-- Error Alerts -->
      <transition name="alert-slide">
        <div v-if="authStore.error" class="intranet-alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div class="alert-text">{{ authStore.error }}</div>
        </div>
      </transition>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="intranet-login-form">
        <!-- Email Input -->
        <div class="form-group">
          <label class="form-label" for="intranet-email">Correo Institucional</label>
          <div class="input-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input 
              id="intranet-email" 
              v-model="email"
              type="email" 
              class="form-input with-icon corporate-input" 
              placeholder="usuario@skyflow.com"
              required
              :disabled="authStore.loading"
            />
          </div>
        </div>

        <!-- Password Input -->
        <div class="form-group">
          <label class="form-label" for="intranet-password">Contraseña</label>
          <div class="input-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input 
              id="intranet-password" 
              v-model="password"
              :type="showPassword ? 'text' : 'password'" 
              class="form-input with-icon corporate-input password-input" 
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
              <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="form-actions-row">
          <div class="remember-me-container">
            <input type="checkbox" id="intranet-remember-me" v-model="rememberMe">
            <label for="intranet-remember-me">Mantener sesión</label>
          </div>
          <router-link to="/olvide-contrasena" class="forgot-link">
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          class="btn btn-primary btn-submit-intranet" 
          :disabled="authStore.loading || !email || !password"
        >
          <span v-if="authStore.loading" class="login-spinner"></span>
          <span>{{ authStore.loading ? 'Autenticando...' : 'Acceder al Sistema' }}</span>
        </button>
      </form>

      <div class="back-link-section">
        <router-link to="/" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Volver al Portal Público
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.intranet-login-page {
  width: 100vw;
  min-height: 100vh;
  margin-top: -70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1f5f9; /* Corporate light gray */
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
}

/* Background subtle pattern */
.intranet-login-page::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.5;
  pointer-events: none;
}

.intranet-login-container {
  width: 100%;
  max-width: 440px;
  padding: 2.5rem;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.intranet-login-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.intranet-brand-logo {
  width: 56px;
  height: 56px;
  background: #1e3a8a; /* Corporate blue */
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1.25rem;
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
}

.intranet-brand-logo svg {
  width: 32px;
  height: 32px;
}

.intranet-login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}

.intranet-login-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.35rem;
  line-height: 1.4;
}

.intranet-alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #ef4444;
  font-size: 0.85rem;
}

.alert-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.intranet-login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-label {
  color: #334155;
  font-weight: 600;
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
  color: #94a3b8;
  pointer-events: none;
}

.corporate-input {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #0f172a;
}
.corporate-input:focus {
  background: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
.corporate-input::placeholder {
  color: #94a3b8;
}

.corporate-input.with-icon {
  padding-left: 2.75rem;
  width: 100%;
}

.password-input {
  padding-right: 3.5rem;
}

.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  transition: all 0.2s;
}
.password-toggle-btn:hover {
  color: #0f172a;
  background: #e2e8f0;
}

.form-actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.remember-me-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.remember-me-container input {
  accent-color: #1e3a8a;
  cursor: pointer;
}
.remember-me-container label {
  color: #475569;
  font-size: 0.85rem;
  cursor: pointer;
  margin: 0;
}

.forgot-link {
  color: #3b82f6;
  font-size: 0.85rem;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}
.forgot-link:hover {
  color: #1e40af;
  text-decoration: underline;
}

.btn-submit-intranet {
  margin-top: 0.5rem;
  height: 46px;
  font-size: 0.95rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  background: #1e3a8a;
  color: white;
  border: none;
  font-weight: 600;
  transition: background 0.2s;
  border-radius: 6px;
  cursor: pointer;
}
.btn-submit-intranet:hover:not(:disabled) {
  background: #1e40af;
}
.btn-submit-intranet:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

.back-link-section {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.back-link:hover {
  color: #0f172a;
}
</style>
