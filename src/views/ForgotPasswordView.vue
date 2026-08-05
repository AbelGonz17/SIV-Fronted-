<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService'

const router = useRouter()

const email = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const handleForgotPassword = async () => {
  if (!email.value) return
  
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  
  try {
    await authService.forgotPassword({
      correoElectronico: email.value,
      urlBaseFrontend: window.location.origin
    })
    
    successMessage.value = 'Se han enviado las instrucciones de recuperación a tu correo electrónico.'
    email.value = ''
  } catch (error: any) {
    errorMessage.value = error.response?.data?.detail || error.response?.data?.message || 'Hubo un error al procesar tu solicitud.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="bg-stars">
      <div v-for="n in 20" :key="n" class="star" :style="{
        left: Math.random() * 100 + '%',
        top: Math.random() * 100 + '%',
        animationDelay: Math.random() * 8 + 's',
        animationDuration: 4 + Math.random() * 6 + 's'
      }"></div>
    </div>

    <div class="login-container glass-card animate-fade-in">
      <div class="login-header">
        <h1 class="login-title">Recuperar Contraseña</h1>
        <p class="login-subtitle">Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.</p>
      </div>

      <transition name="alert-slide">
        <div v-if="errorMessage" class="login-alert-error">
          <div class="alert-text">{{ errorMessage }}</div>
        </div>
      </transition>
      
      <transition name="alert-slide">
        <div v-if="successMessage" class="login-alert-success" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); color: #34d399; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <div class="alert-text">{{ successMessage }}</div>
        </div>
      </transition>

      <form @submit.prevent="handleForgotPassword" class="login-form">
        <div class="form-group">
          <label class="form-label" for="login-email">Correo Electrónico</label>
          <div class="input-wrapper">
            <input 
              id="login-email" 
              v-model="email"
              type="email" 
              class="form-input" 
              placeholder="nombre@ejemplo.com"
              required
              :disabled="loading"
              style="width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(0, 0, 0, 0.2); color: white;"
            />
          </div>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary" 
          style="width: 100%; padding: 0.75rem; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 1rem;"
          :disabled="loading || !email"
        >
          <span v-if="loading">Enviando...</span>
          <span v-else>Enviar Instrucciones</span>
        </button>
      </form>

      <div class="register-link-section" style="text-align: center; margin-top: 1.5rem;">
        <p><router-link to="/login" style="color: #60a5fa; text-decoration: none;">Volver al inicio de sesión</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  width: 100vw;
  min-height: 100vh;
  margin-top: -70px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 1.5rem;
}

.bg-stars {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #1a2332 0%, #0d1117 100%);
  z-index: -1;
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem 2rem;
  z-index: 10;
  border-radius: 16px;
  background: rgba(26, 32, 44, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
  margin-bottom: 0.5rem;
  text-align: center;
}

.login-subtitle {
  color: #94a3b8;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  text-align: center;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #cbd5e1;
  margin-bottom: 0.5rem;
}

.login-alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}
</style>
