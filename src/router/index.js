import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ─── Rutas Públicas ──────────────────────────────────────────────────────
    {
      path: '/',
      name: 'landing',
      component: () => import('../views/public/LandingFidsView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/intranet/login',
      name: 'intranet-login',
      component: () => import('../views/intranet/IntranetLoginView.vue')
    },
    {
      path: '/registro',
      name: 'registro',
      component: () => import('../views/RegisterView.vue')
    },
    {
      path: '/olvide-contrasena',
      name: 'olvide-contrasena',
      component: () => import('../views/ForgotPasswordView.vue')
    },
    {
      path: '/restablecer-contrasena',
      name: 'restablecer-contrasena',
      component: () => import('../views/ResetPasswordView.vue')
    },

    // ─── Rutas de Visitante (layout propio sin sidebar interno) ──────────────
    {
      path: '/visitante',
      component: () => import('../layouts/VisitorLayout.vue'),
      meta: { requiresAuth: true, role: 'Visitante' },
      children: [
        {
          path: '',
          name: 'visitor-flights',
          component: () => import('../views/visitor/VisitorFlightsView.vue')
        },
        {
          path: 'notificaciones',
          name: 'visitor-notifications',
          component: () => import('../views/visitor/VisitorNotificationsView.vue')
        },
        {
          path: 'seguimientos',
          name: 'visitor-following',
          component: () => import('../views/visitor/VisitorFollowingView.vue')
        }
      ]
    },

    // ─── Rutas Internas (layout con sidebar de gestión) ──────────────────────
    {
      path: '/dashboard',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true, role: 'internal' }
    },
    {
      path: '/mantenimiento',
      name: 'mantenimiento',
      component: () => import('../views/FlightManagementView.vue'),
      meta: { requiresAuth: true, role: 'internal' }
    },
    {
      path: '/aerolineas',
      name: 'aerolineas',
      component: () => import('../views/AirlineManagementView.vue'),
      meta: { requiresAuth: true, role: 'internal' }
    },
    {
      path: '/aeropuertos',
      name: 'aeropuertos',
      component: () => import('../views/AirportManagementView.vue'),
      meta: { requiresAuth: true, role: 'internal' }
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: () => import('../views/UserManagementView.vue'),
      meta: { requiresAuth: true, role: 'internal' }
    },
    {
      path: '/auditoria',
      name: 'auditoria',
      component: () => import('../views/AuditView.vue'),
      meta: { requiresAuth: true, role: 'internal' }
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: () => import('../views/ReportsView.vue'),
      meta: { requiresAuth: true, role: 'internal' }
    }
  ]
})

// Guardian global de navegación
router.beforeEach((to) => {
  const authStore = useAuthStore()
  const isVisitor = authStore.user?.role === 'Visitante'

  // Redirigir al login si no autenticado
  if (to.matched.some(r => r.meta.requiresAuth) && !authStore.isAuthenticated) {
    if (to.meta.role === 'internal') {
      return { name: 'intranet-login' }
    }
    return { name: 'login' }
  }

  // Si ya está autenticado y va a rutas de auth (o FIDS) → redirigir según rol
  if (['login', 'intranet-login', 'registro', 'olvide-contrasena', 'restablecer-contrasena', 'landing'].includes(to.name) && authStore.isAuthenticated) {
    return isVisitor ? { name: 'visitor-flights' } : { name: 'home' }
  }

  // Visitante intentando acceder a rutas internas → redirigir a su panel
  if (authStore.isAuthenticated && isVisitor && to.meta.role === 'internal') {
    return { name: 'visitor-flights' }
  }

  // Usuario interno intentando acceder a rutas de visitante → redirigir a visitor (ahora permitido para ver la red pública)
  // if (authStore.isAuthenticated && !isVisitor && to.meta.role === 'Visitante') {
  //   return { name: 'home' }
  // }
})

export default router
