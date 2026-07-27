import { ref, computed } from 'vue'

const AIRPORT_CODES = {
  'miami international airport': 'MIA',
  'las américas international airport': 'SDQ',
  'las americas international airport': 'SDQ',
  'john f. kennedy international airport': 'JFK',
  'punta cana international airport': 'PUJ',
  'aeropuerto internacional el dorado': 'BOG',
  'el dorado international airport': 'BOG'
}

function getAirportCode(name) {
  if (!name) return 'N/A'
  const key = name.toLowerCase().trim()
  if (AIRPORT_CODES[key]) return AIRPORT_CODES[key]
  
  // Fallback: si tiene palabras, tomar iniciales, de lo contrario las primeras 3 letras
  const parts = key.split(/\s+/)
  if (parts.length >= 3) {
    return (parts[0][0] + parts[1][0] + parts[2][0]).toUpperCase()
  }
  return name.substring(0, 3).toUpperCase()
}

export function useFlights() {
  const flights = ref([])
  const airlines = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  const searchFilter = ref({
    origin: '',
    destination: '',
    status: '',
    esLlegada: '', // '' (todos), 'true' (llegadas), 'false' (salidas)
    fecha: '',
    aerolineaId: '',
    pageNumber: 1,
    pageSize: 20
  })

  const totalPages = ref(1)
  const totalCount = ref(0)

  const apiUrl = import.meta.env.VITE_API_URL

  const fetchAirlines = async () => {
    try {
      const token = localStorage.getItem('skyflow_token')
      const headers = {
        'Accept': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${apiUrl}/Aerolineas`, {
        headers
      })

      if (response.ok) {
        const data = await response.json()
        airlines.value = data.value || data || []
      }
    } catch (err) {
      console.error('Error fetching airlines:', err)
    }
  }

  const fetchFlights = async () => {
    loading.value = true
    error.value = null
    try {
      const url = new URL(`${apiUrl}/Vuelos/fids`)
      
      // Parámetros de paginación obligatorios
      url.searchParams.append('pageNumber', searchFilter.value.pageNumber.toString())
      url.searchParams.append('pageSize', searchFilter.value.pageSize.toString())
      
      // Filtros opcionales de la API
      if (searchFilter.value.esLlegada !== '') {
        url.searchParams.append('esLlegada', searchFilter.value.esLlegada)
      }
      if (searchFilter.value.status) {
        url.searchParams.append('estado', searchFilter.value.status)
      }
      if (searchFilter.value.aerolineaId) {
        url.searchParams.append('aerolineaId', searchFilter.value.aerolineaId)
      }
      if (searchFilter.value.fecha) {
        url.searchParams.append('fecha', searchFilter.value.fecha)
      }

      const token = localStorage.getItem('skyflow_token')
      const headers = {
        'Accept': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(url.toString(), {
        headers
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada o no autorizada. Por favor inicia sesión nuevamente.')
        }
        throw new Error(`Error en el servidor (${response.status})`)
      }

      const data = await response.json()
      
      // Extraer datos de la estructura de respuesta
      const payload = data.value || {}
      const items = payload.items || []
      
      totalPages.value = payload.totalPages || 1
      totalCount.value = payload.totalCount || 0

      // Map a la estructura requerida por la UI
      flights.value = items.map(item => {
        // Determinar si es llegada buscando 'las américas' en destino
        const isArrival = item.destino?.toLowerCase().includes('las américas') || 
                          item.destino?.toLowerCase().includes('las americas') ||
                          searchFilter.value.esLlegada === 'true'

        const mainTimeStr = item.horarioEstimado || item.horarioPlanificado
        const mainTime = new Date(mainTimeStr)
        
        let departureTime = mainTimeStr
        let arrivalTime = mainTimeStr

        if (mainTimeStr) {
          if (isArrival) {
            // Llegada: horario principal es de llegada. Salida estimada 2 horas antes.
            const depDate = new Date(mainTime.getTime() - 2 * 60 * 60 * 1000)
            departureTime = depDate.toISOString()
          } else {
            // Salida: horario principal es de salida. Llegada estimada 2 horas después.
            const arrDate = new Date(mainTime.getTime() + 2 * 60 * 60 * 1000)
            arrivalTime = arrDate.toISOString()
          }
        }

        // Traducir estados para la UI
        let uiStatus = 'On Time'
        const estadoLower = item.estado?.toLowerCase() || ''
        if (estadoLower.includes('cancel') || estadoLower.includes('cancelado')) {
          uiStatus = 'Cancelled'
        } else if (estadoLower.includes('demora') || estadoLower.includes('delay') || estadoLower.includes('retras')) {
          uiStatus = 'Delayed'
        } else if (estadoLower.includes('abord') || estadoLower.includes('board')) {
          uiStatus = 'Boarding'
        } else if (estadoLower.includes('program') || estadoLower.includes('sched')) {
          uiStatus = 'On Time'
        } else {
          uiStatus = item.estado || 'On Time'
        }

        return {
          id: item.id,
          // Compatibilidad con estadísticas de la UI
          airline: item.aerolinea || 'Aerolínea',
          flightNumber: item.numeroVuelo || 'N/A',
          origin: getAirportCode(item.origen),
          originName: item.origen || 'Origen',
          destination: getAirportCode(item.destino),
          destinationName: item.destino || 'Destino',
          departureTime,
          arrivalTime,
          status: uiStatus,
          gate: item.puerta || 'N/A',
          
          // Campos reales del Backend
          numeroVuelo: item.numeroVuelo,
          aerolinea: item.aerolinea,
          origen: item.origen,
          destino: item.destino,
          horarioPlanificado: item.horarioPlanificado,
          horarioEstimado: item.horarioEstimado,
          puerta: item.puerta,
          estado: item.estado
        }
      })
    } catch (err) {
      console.error('Error fetching flights:', err)
      error.value = err.message || 'Error al cargar la información de vuelos.'
    } finally {
      loading.value = false
    }
  }

  // Filtrado de vuelos reactivo local (para origen/destino)
  const filteredFlights = computed(() => {
    return flights.value.filter(flight => {
      const matchOrigin = !searchFilter.value.origin || 
        flight.origin.toLowerCase().includes(searchFilter.value.origin.toLowerCase()) ||
        flight.originName.toLowerCase().includes(searchFilter.value.origin.toLowerCase())
      
      const matchDestination = !searchFilter.value.destination || 
        flight.destination.toLowerCase().includes(searchFilter.value.destination.toLowerCase()) ||
        flight.destinationName.toLowerCase().includes(searchFilter.value.destination.toLowerCase())

      return matchOrigin && matchDestination
    })
  })

  // Obtener estadísticas de vuelos para el dashboard basadas en los vuelos actuales
  const stats = computed(() => {
    const total = flights.value.length
    if (total === 0) return { total: 0, onTime: 0, delayed: 0, cancelled: 0, onTimePercentage: 100 }
    
    const onTime = flights.value.filter(f => f.status === 'On Time' || f.status === 'Boarding').length
    const delayed = flights.value.filter(f => f.status === 'Delayed').length
    const cancelled = flights.value.filter(f => f.status === 'Cancelled').length

    return {
      total,
      onTime,
      delayed,
      cancelled,
      onTimePercentage: Math.round((onTime / total) * 100)
    }
  })

  const fetchFlightDetails = async (flightId) => {
    try {
      const token = localStorage.getItem('skyflow_token')
      const headers = {
        'Accept': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${apiUrl}/Vuelos/${flightId}/detalle`, {
        headers
      })

      if (!response.ok) {
        throw new Error(`Error al obtener los detalles del vuelo (${response.status})`)
      }

      const data = await response.json()
      return data.value || data
    } catch (err) {
      console.error(`Error fetching flight details for ${flightId}:`, err)
      throw err
    }
  }

  return {
    flights,
    airlines,
    loading,
    error,
    searchFilter,
    filteredFlights,
    stats,
    totalPages,
    totalCount,
    fetchFlights,
    fetchAirlines,
    fetchFlightDetails
  }
}
