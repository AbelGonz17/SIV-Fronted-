<script setup>
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

// El layout de visitante lo gestiona su propio VisitorLayout.vue (nested route)
// Solo mostramos la barra interna si el usuario es un usuario interno autenticado
const isInternalUser = computed(() =>
  authStore.isAuthenticated && authStore.user?.role !== 'Visitante'
)
</script>

<template>
  <div :class="['app-layout', { 'with-sidebar': isInternalUser }]">
    <AppNavbar v-if="isInternalUser" />
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-layout.with-sidebar {
  flex-direction: row;
}

.app-layout.with-sidebar .main-content {
  margin-left: 280px;
  width: calc(100% - 280px);
  padding: 2rem;
}

.main-content {
  flex: 1;
  padding: 2rem 0;
  transition: all 0.3s ease;
}

@media (max-width: 1023px) {
  .app-layout.with-sidebar {
    flex-direction: column;
  }
  .app-layout.with-sidebar .main-content {
    margin-left: 0;
    width: 100%;
    padding: 1rem;
  }
}
</style>
