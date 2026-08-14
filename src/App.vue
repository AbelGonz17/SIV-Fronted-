<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
import { useAuthStore } from './stores/auth'
import { useLayoutStore } from './stores/layout'

const authStore = useAuthStore()
const layoutStore = useLayoutStore()
const route = useRoute()

// Solo mostramos la barra interna si la ruta actual pertenece al área interna administrativa
const isInternalRoute = computed(() => route.meta?.role === 'internal')
</script>

<template>
  <div :class="['app-layout', { 'with-sidebar': isInternalRoute, 'sidebar-collapsed': layoutStore.isSidebarCollapsed }]">
    <AppNavbar v-if="isInternalRoute" />
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

.app-layout.with-sidebar.sidebar-collapsed .main-content {
  margin-left: 80px;
  width: calc(100% - 80px);
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
