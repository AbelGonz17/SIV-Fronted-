<script setup>
import { RouterView } from 'vue-router'
import AppNavbar from './components/AppNavbar.vue'
</script>

<template>
  <AppNavbar />
  <main class="main-content">
    <RouterView />
  </main>
</template>

<style scoped>
.main-content {
  flex: 1;
  padding: 2rem 0;
}
</style>
