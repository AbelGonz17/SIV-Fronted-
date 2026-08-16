import { ref } from 'vue'

export type Language = 'es' | 'en'

const currentLanguage = ref<Language>((localStorage.getItem('user-lang') as Language) || 'es')

const translations: Record<Language, Record<string, string>> = {
  es: {
    // FIDS Landing Page
    'fids.title': 'SkyFlow',
    'fids.subtitle': 'SISTEMA DE INFORMACIÓN DE VUELOS',
    'fids.btn.login': 'Ingresar / Seguir Vuelos',
    'fids.col.airline': 'AEROLÍNEA',
    'fids.col.flight': 'VUELO',
    'fids.col.origin': 'ORIGEN',
    'fids.col.destination': 'DESTINO',
    'fids.col.time': 'HORA',
    'fids.col.gate': 'PUERTA',
    'fids.col.status': 'ESTADO',
    'fids.empty': 'NO HAY VUELOS PROGRAMADOS EN ESTE MOMENTO',
    'fids.loading': 'CARGANDO INFORMACIÓN DE VUELOS...',
    'fids.error': 'ERROR DE COMUNICACIÓN CON LA TORRE DE CONTROL',
    'fids.modal.title': 'Acceso Restringido',
    'fids.modal.subtitle': 'Ingrese el código de acceso para continuar a la Intranet.',
    'fids.modal.placeholder': 'Código secreto',
    'fids.modal.error': 'Código incorrecto. Intente nuevamente.',
    'fids.modal.btn': 'Verificar',

    // Visitor Layout / Navigation
    'nav.navigation': 'NAVEGACIÓN',
    'nav.flights': 'Panel de Vuelos',
    'nav.following': 'Mis Seguimientos',
    'nav.notifications': 'Notificaciones',
    'nav.settings': 'Ajustes',

    // Settings Modal
    'settings.title': 'Configuración',
    'settings.subtitle': 'Detalles de tu cuenta',
    'settings.lang': 'IDIOMA',
    'settings.profile.title': 'Ver Perfil',
    'settings.profile.desc': 'Consulta tus datos personales',
    'settings.password.title': 'Cambiar Contraseña',
    'settings.password.desc': 'Actualiza tu clave de acceso',
    'settings.logout.title': 'Cerrar Sesión',
    'settings.logout.desc': 'Salir de tu cuenta actual',

    // Visitor Flights View
    'flights.title': 'Panel de Vuelos',
    'flights.subtitle': 'Consulta vuelos en tiempo real y sigue los que te interesen.',
    'flights.search': 'Vuelo, aerolínea, origen, destino...',
    'flights.tab.all': 'Todos',
    'flights.tab.departures': 'Salidas',
    'flights.tab.arrivals': 'Llegadas',
    'flights.card.flight': 'Vuelo:',
    'flights.card.gate': 'Puerta:',
    'flights.follow.btn': 'Seguir',
    'flights.follow.btn.following': 'Siguiendo',
    'flights.follow.btn.unfollow': 'Dejar de seguir',
    'flights.follow.loading.follow': 'Siguiendo...',
    'flights.follow.loading.unfollow': 'Quitando...',

    // Visitor Following View
    'following.title': 'Mis Seguimientos',
    'following.subtitle': 'Vuelos que estás monitoreando activamente.',
    'following.count.single': 'vuelo',
    'following.count.plural': 'vuelos',
    'following.empty.title': 'Aún no sigues ningún vuelo',
    'following.empty.desc': 'Explora el Panel de Vuelos y presiona "Seguir" para recibir actualizaciones aquí.',
    'following.empty.action': 'Ir al Panel de Vuelos',
    'following.loading.unfollow': 'Eliminando...',

    // Flight Statuses
    'status.scheduled': 'PROGRAMADO',
    'status.boarding': 'ABORDANDO',
    'status.inflight': 'EN VUELO',
    'status.landed': 'ATERRIZADO',
    'status.completed': 'COMPLETADO',
    'status.delayed': 'DEMORADO',
    'status.cancelled': 'CANCELADO',
    'status.advanced': 'ADELANTADO',
    'status.ontime': 'EN HORA',

    // Notifications View
    'notifications.title': 'Notificaciones',
    'notifications.subtitle': 'Actualizaciones sobre los vuelos que estás siguiendo.',
    'notifications.markAllRead': 'Marcar todas como leídas',
    'notifications.loading': 'Cargando notificaciones...',
    'notifications.empty.title': 'No tienes notificaciones aún.',
    'notifications.empty.desc': 'Sigue un vuelo desde el Panel para recibir actualizaciones.',
    'notifications.unread': 'Sin leer',
    'notifications.read': 'Anteriores',
    'notifications.card.title': 'Ver detalles del vuelo',
    'notifications.card.markRead': 'Marcar como leída',
    'notifications.hideRead': 'Ocultar leídas',
    'notifications.showRead': 'Mostrar leídas',

    // Login View
    'login.title': 'Bienvenido a SkyFlow',
    'login.subtitle': 'Ingresa tus credenciales para acceder a la terminal de vuelos.',
    'login.email.label': 'Correo Electrónico',
    'login.password.label': 'Contraseña',
    'login.rememberMe': 'Mantener sesión iniciada',
    'login.forgotPassword': '¿Olvidaste tu contraseña?',
    'login.btn.loading': 'Iniciando...',
    'login.btn.submit': 'Iniciar Sesión',
    'login.register.prompt': '¿No tienes cuenta? ',
    'login.register.action': 'Regístrate aquí',
    'login.backToPublic': 'Volver al Portal Público'
  },
  en: {
    // FIDS Landing Page
    'fids.title': 'SkyFlow',
    'fids.subtitle': 'FLIGHT INFORMATION DISPLAY SYSTEM',
    'fids.btn.login': 'Login / Follow Flights',
    'fids.col.airline': 'AIRLINE',
    'fids.col.flight': 'FLIGHT',
    'fids.col.origin': 'ORIGIN',
    'fids.col.destination': 'DESTINATION',
    'fids.col.time': 'TIME',
    'fids.col.gate': 'GATE',
    'fids.col.status': 'STATUS',
    'fids.empty': 'NO SCHEDULED FLIGHTS AT THE MOMENT',
    'fids.loading': 'LOADING FLIGHT INFORMATION...',
    'fids.error': 'COMMUNICATION ERROR WITH THE CONTROL TOWER',
    'fids.modal.title': 'Restricted Access',
    'fids.modal.subtitle': 'Enter access code to proceed to the Intranet.',
    'fids.modal.placeholder': 'Secret code',
    'fids.modal.error': 'Incorrect code. Please try again.',
    'fids.modal.btn': 'Verify',

    // Visitor Layout / Navigation
    'nav.navigation': 'NAVIGATION',
    'nav.flights': 'Flight Board',
    'nav.following': 'My Follows',
    'nav.notifications': 'Notifications',
    'nav.settings': 'Settings',

    // Settings Modal
    'settings.title': 'Settings',
    'settings.subtitle': 'Account details',
    'settings.lang': 'LANGUAGE',
    'settings.profile.title': 'View Profile',
    'settings.profile.desc': 'View your personal profile details',
    'settings.password.title': 'Change Password',
    'settings.password.desc': 'Update your login password',
    'settings.logout.title': 'Logout',
    'settings.logout.desc': 'Exit your current account',

    // Visitor Flights View
    'flights.title': 'Flight Board',
    'flights.subtitle': 'Search flights in real-time and follow those that interest you.',
    'flights.search': 'Flight, airline, origin, destination...',
    'flights.tab.all': 'All',
    'flights.tab.departures': 'Departures',
    'flights.tab.arrivals': 'Arrivals',
    'flights.card.flight': 'Flight:',
    'flights.card.gate': 'Gate:',
    'flights.follow.btn': 'Follow',
    'flights.follow.btn.following': 'Following',
    'flights.follow.btn.unfollow': 'Unfollow',
    'flights.follow.loading.follow': 'Following...',
    'flights.follow.loading.unfollow': 'Removing...',

    // Visitor Following View
    'following.title': 'My Follows',
    'following.subtitle': 'Flights you are actively tracking.',
    'following.count.single': 'flight',
    'following.count.plural': 'flights',
    'following.empty.title': 'You are not following any flights yet',
    'following.empty.desc': 'Explore the Flight Board and click "Follow" to receive updates here.',
    'following.empty.action': 'Go to Flight Board',
    'following.loading.unfollow': 'Deleting...',

    // Flight Statuses
    'status.scheduled': 'SCHEDULED',
    'status.boarding': 'BOARDING',
    'status.inflight': 'IN FLIGHT',
    'status.landed': 'LANDED',
    'status.completed': 'COMPLETED',
    'status.delayed': 'DELAYED',
    'status.cancelled': 'CANCELLED',
    'status.advanced': 'ADVANCED',
    'status.ontime': 'ON TIME',

    // Notifications View
    'notifications.title': 'Notifications',
    'notifications.subtitle': 'Updates about the flights you are actively following.',
    'notifications.markAllRead': 'Mark all as read',
    'notifications.loading': 'Loading notifications...',
    'notifications.empty.title': 'You have no notifications yet.',
    'notifications.empty.desc': 'Follow a flight from the board to receive updates.',
    'notifications.unread': 'Unread',
    'notifications.read': 'Earlier',
    'notifications.card.title': 'View flight details',
    'notifications.card.markRead': 'Mark as read',
    'notifications.hideRead': 'Hide read',
    'notifications.showRead': 'Show read',

    // Login View
    'login.title': 'Welcome to SkyFlow',
    'login.subtitle': 'Enter your credentials to access the flight terminal.',
    'login.email.label': 'Email Address',
    'login.password.label': 'Password',
    'login.rememberMe': 'Keep me logged in',
    'login.forgotPassword': 'Forgot your password?',
    'login.btn.loading': 'Signing in...',
    'login.btn.submit': 'Sign In',
    'login.register.prompt': "Don't have an account? ",
    'login.register.action': 'Register here',
    'login.backToPublic': 'Back to Public Portal'
  }
}

export function useLanguage() {
  const setLanguage = (lang: Language) => {
    currentLanguage.value = lang
    localStorage.setItem('user-lang', lang)
  }

  const t = (key: string): string => {
    return translations[currentLanguage.value][key] || key
  }

  return {
    currentLanguage,
    setLanguage,
    t
  }
}
