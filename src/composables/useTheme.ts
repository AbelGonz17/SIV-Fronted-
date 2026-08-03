import { ref, watch } from 'vue'

export type ThemeKey = 'blue' | 'cyan' | 'green' | 'red' | 'purple' | 'orange'

export interface ThemeConfig {
  label: string
  swatch: string
  vars: Record<string, string>
}

// Paletas de tema: cada tema define un conjunto completo de variables CSS primarias
export const THEMES: Record<ThemeKey, ThemeConfig> = {
  blue: {
    label: 'Azul',
    swatch: '#3b82f6',
    vars: {
      '--color-primary':           '#3b82f6',
      '--color-primary-hover':     '#2563eb',
      '--color-primary-glow':      'rgba(59, 130, 246, 0.25)',
      '--color-border-focus':      'rgba(59, 130, 246, 0.5)',
      '--color-bg-dark':           '#080e1c',
      '--color-bg-card':           'rgba(10, 20, 45, 0.75)',
      '--color-bg-card-hover':     'rgba(15, 30, 65, 0.9)',
      '--gradient-radial':         'radial-gradient(circle at 50% 0%, #1e2f5e 0%, #080e1c 70%)',
    }
  },
  cyan: {
    label: 'Cian',
    swatch: '#06b6d4',
    vars: {
      '--color-primary':           '#06b6d4',
      '--color-primary-hover':     '#0891b2',
      '--color-primary-glow':      'rgba(6, 182, 212, 0.25)',
      '--color-border-focus':      'rgba(6, 182, 212, 0.5)',
      '--color-bg-dark':           '#060d12',
      '--color-bg-card':           'rgba(8, 22, 32, 0.75)',
      '--color-bg-card-hover':     'rgba(12, 35, 48, 0.9)',
      '--gradient-radial':         'radial-gradient(circle at 50% 0%, #0c3040 0%, #060d12 70%)',
    }
  },
  green: {
    label: 'Verde',
    swatch: '#10b981',
    vars: {
      '--color-primary':           '#10b981',
      '--color-primary-hover':     '#059669',
      '--color-primary-glow':      'rgba(16, 185, 129, 0.25)',
      '--color-border-focus':      'rgba(16, 185, 129, 0.5)',
      '--color-bg-dark':           '#050f0b',
      '--color-bg-card':           'rgba(8, 24, 18, 0.75)',
      '--color-bg-card-hover':     'rgba(12, 38, 28, 0.9)',
      '--gradient-radial':         'radial-gradient(circle at 50% 0%, #0c3024 0%, #050f0b 70%)',
    }
  },
  red: {
    label: 'Rojo',
    swatch: '#ef4444',
    vars: {
      '--color-primary':           '#ef4444',
      '--color-primary-hover':     '#dc2626',
      '--color-primary-glow':      'rgba(239, 68, 68, 0.25)',
      '--color-border-focus':      'rgba(239, 68, 68, 0.5)',
      '--color-bg-dark':           '#0f0808',
      '--color-bg-card':           'rgba(28, 12, 12, 0.75)',
      '--color-bg-card-hover':     'rgba(45, 18, 18, 0.9)',
      '--gradient-radial':         'radial-gradient(circle at 50% 0%, #3c1010 0%, #0f0808 70%)',
    }
  },
  purple: {
    label: 'Morado',
    swatch: '#8b5cf6',
    vars: {
      '--color-primary':           '#8b5cf6',
      '--color-primary-hover':     '#7c3aed',
      '--color-primary-glow':      'rgba(139, 92, 246, 0.25)',
      '--color-border-focus':      'rgba(139, 92, 246, 0.5)',
      '--color-bg-dark':           '#0a070f',
      '--color-bg-card':           'rgba(20, 12, 35, 0.75)',
      '--color-bg-card-hover':     'rgba(32, 18, 55, 0.9)',
      '--gradient-radial':         'radial-gradient(circle at 50% 0%, #271540 0%, #0a070f 70%)',
    }
  },
  orange: {
    label: 'Naranja',
    swatch: '#f97316',
    vars: {
      '--color-primary':           '#f97316',
      '--color-primary-hover':     '#ea580c',
      '--color-primary-glow':      'rgba(249, 115, 22, 0.25)',
      '--color-border-focus':      'rgba(249, 115, 22, 0.5)',
      '--color-bg-dark':           '#0f0905',
      '--color-bg-card':           'rgba(28, 18, 8, 0.75)',
      '--color-bg-card-hover':     'rgba(45, 28, 10, 0.9)',
      '--gradient-radial':         'radial-gradient(circle at 50% 0%, #3c2008 0%, #0f0905 70%)',
    }
  }
}

const STORAGE_KEY = 'skyflow_theme'
const THEME_KEYS = Object.keys(THEMES) as ThemeKey[]

// Estado reactivo compartido (singleton)
const activeTheme = ref<ThemeKey>((localStorage.getItem(STORAGE_KEY) as ThemeKey) || 'blue')

// Función de aplicación de tema: inyecta las variables CSS en :root
function applyTheme(themeKey: ThemeKey) {
  const theme = THEMES[themeKey]
  if (!theme) return

  const root = document.documentElement
  Object.entries(theme.vars).forEach(([property, value]) => {
    root.style.setProperty(property, value)
  })

  // Actualizar el gradiente de fondo del body
  document.body.style.background = theme.vars['--gradient-radial']
  document.body.style.backgroundAttachment = 'fixed'
}

// Aplicar al cargar
applyTheme(activeTheme.value)

// Observar cambios para persistirlos y aplicarlos
watch(activeTheme, (newTheme) => {
  localStorage.setItem(STORAGE_KEY, newTheme)
  applyTheme(newTheme)
})

export function useTheme() {
  const setTheme = (themeKey: string) => {
    if (THEME_KEYS.includes(themeKey as ThemeKey)) {
      activeTheme.value = themeKey as ThemeKey
    }
  }

  return {
    activeTheme,
    themes: THEMES,
    themeKeys: THEME_KEYS,
    setTheme
  }
}
