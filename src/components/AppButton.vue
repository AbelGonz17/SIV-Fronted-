<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary' // 'primary' | 'secondary' | 'danger'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['btn', `btn-${variant}`]"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.4);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px 0 rgba(239, 68, 68, 0.6);
  background: linear-gradient(135deg, #f87171 0%, #dc2626 100%);
}
</style>
