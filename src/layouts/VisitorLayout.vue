<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import VisitorSidebar from '../components/VisitorSidebar.vue'
import { useSignalR } from '../composables/useSignalR'
import { useLayoutStore } from '../stores/layout'

const { startConnection, onPersonalAlert, offPersonalAlert } = useSignalR()
const layoutStore = useLayoutStore()

const toast = ref({
  show: false,
  message: '',
  type: 'info'
})

const showToast = (message) => {
  toast.value = { show: true, message, type: 'info' }
  setTimeout(() => {
    toast.value.show = false
  }, 5000)
}

const handlePersonalAlert = (mensaje) => {
  showToast(mensaje)
}

onMounted(async () => {
  await startConnection()
  onPersonalAlert(handlePersonalAlert)
})

onUnmounted(() => {
  offPersonalAlert(handlePersonalAlert)
})
</script>

<template>
  <div :class="['visitor-layout', { 'sidebar-collapsed': layoutStore.isSidebarCollapsed }]">
    <VisitorSidebar />
    <main class="visitor-main">
      <RouterView />
    </main>

    <!-- Global Toast Notification for Visitor -->
    <Transition name="slide-fade">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <div class="toast-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.visitor-layout {
  display: flex;
  min-height: 100vh;
}

.visitor-main {
  margin-left: 260px;
  width: calc(100% - 260px);
  padding: 2rem;
  min-height: 100vh;
  transition: all 0.3s ease;
}

.visitor-layout.sidebar-collapsed .visitor-main {
  margin-left: 80px;
  width: calc(100% - 80px);
}

@media (max-width: 900px) {
  .visitor-main, .visitor-layout.sidebar-collapsed .visitor-main {
    margin-left: 0;
    width: 100%;
    padding: 1rem;
    padding-bottom: 80px; /* Space for bottom nav */
  }
}
</style>
