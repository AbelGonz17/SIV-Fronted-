import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/mantenimiento',
      name: 'mantenimiento',
      component: () => import('../views/FlightManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/aerolineas',
      name: 'aerolineas',
      component: () => import('../views/AirlineManagementView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Guardian global de navegación
router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  
  // Si la ruta requiere autenticación y el usuario no está logueado
  if (to.matched.some(record => record.meta.requiresAuth) && !authStore.isAuthenticated) {
    return { name: 'login' }
  } 
  // Si el usuario ya está autenticado y trata de ir al login
  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'home' }
  }
})

export default router
