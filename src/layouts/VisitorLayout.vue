<script setup>
import { RouterView } from 'vue-router'
import VisitorSidebar from '../components/VisitorSidebar.vue'
</script>

<template>
  <div class="visitor-layout">
    <VisitorSidebar />
    <main class="visitor-main">
      <RouterView />
    </main>
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
}

@media (max-width: 900px) {
  .visitor-main {
    margin-left: 0;
    width: 100%;
    padding: 1rem;
  }
}
</style>
