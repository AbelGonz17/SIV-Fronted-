import { ref, computed } from 'vue'

// Mock de vuelos para simular la base de datos de la aerolínea
const MOCK_FLIGHTS = [
  {
    id: 'FL-101',
    airline: 'Dominican Wings',
    flightNumber: 'DW-302',
    origin: 'SDQ',
    originName: 'Santo Domingo (AILA)',
    destination: 'MIA',
    destinationName: 'Miami International',
    departureTime: '2026-07-28T08:30:00',
    arrivalTime: '2026-07-28T10:45:00',
    price: 250,
    status: 'On Time',
    gate: 'A4',
    aircraft: 'Boeing 737-800'
  },
  {
    id: 'FL-102',
    airline: 'Caribbean Express',
    flightNumber: 'CX-415',
    origin: 'SDQ',
    originName: 'Santo Domingo (AILA)',
    destination: 'JFK',
    destinationName: 'New York (JFK)',
    departureTime: '2026-07-28T14:15:00',
    arrivalTime: '2026-07-28T18:00:00',
    price: 380,
    status: 'Delayed',
    gate: 'B12',
    aircraft: 'Airbus A320'
  },
  {
    id: 'FL-103',
    airline: 'Dominican Wings',
    flightNumber: 'DW-108',
    origin: 'PUJ',
    originName: 'Punta Cana International',
    destination: 'MAD',
    destinationName: 'Madrid Barajas',
    departureTime: '2026-07-28T20:00:00',
    arrivalTime: '2026-07-29T10:15:00',
    price: 750,
    status: 'On Time',
    gate: 'C2',
    aircraft: 'Boeing 787 Dreamliner'
  },
  {
    id: 'FL-104',
    airline: 'Copa Airlines',
    flightNumber: 'CM-268',
    origin: 'SDQ',
    originName: 'Santo Domingo (AILA)',
    destination: 'PTY',
    destinationName: 'Panamá Tocumen',
    departureTime: '2026-07-28T06:00:00',
    arrivalTime: '2026-07-28T08:30:00',
    price: 320,
    status: 'Boarding',
    gate: 'A1',
    aircraft: 'Boeing 737 MAX 9'
  },
  {
    id: 'FL-105',
    airline: 'Dominican Wings',
    flightNumber: 'DW-704',
    origin: 'SDQ',
    originName: 'Santo Domingo (AILA)',
    destination: 'MIA',
    destinationName: 'Miami International',
    departureTime: '2026-07-28T18:30:00',
    arrivalTime: '2026-07-28T20:45:00',
    price: 280,
    status: 'On Time',
    gate: 'A5',
    aircraft: 'Boeing 737-800'
  },
  {
    id: 'FL-106',
    airline: 'Caribbean Express',
    flightNumber: 'CX-992',
    origin: 'STI',
    originName: 'Santiago (AIC)',
    destination: 'JFK',
    destinationName: 'New York (JFK)',
    departureTime: '2026-07-28T23:30:00',
    arrivalTime: '2026-07-29T03:15:00',
    price: 410,
    status: 'Cancelled',
    gate: 'T1',
    aircraft: 'Airbus A321'
  },
  {
    id: 'FL-107',
    airline: 'Iberia',
    flightNumber: 'IB-6500',
    origin: 'SDQ',
    originName: 'Santo Domingo (AILA)',
    destination: 'MAD',
    destinationName: 'Madrid Barajas',
    departureTime: '2026-07-28T16:20:00',
    arrivalTime: '2026-07-29T06:30:00',
    price: 890,
    status: 'On Time',
    gate: 'B3',
    aircraft: 'Airbus A350-900'
  }
]

export function useFlights() {
  const flights = ref([])
  const loading = ref(false)
  const error = ref(null)
  const searchFilter = ref({
    origin: '',
    destination: '',
    status: ''
  })

  // Simulación de llamada a API
  const fetchFlights = async () => {
    loading.value = true
    error.value = null
    try {
      // Simular retraso de red de 800ms
      await new Promise(resolve => setTimeout(resolve, 800))
      flights.value = [...MOCK_FLIGHTS]
    } catch (err) {
      error.value = 'Error al cargar la información de vuelos.'
    } finally {
      loading.value = false
    }
  }

  // Filtrado de vuelos reactivo
  const filteredFlights = computed(() => {
    return flights.value.filter(flight => {
      const matchOrigin = !searchFilter.value.origin || 
        flight.origin.toLowerCase().includes(searchFilter.value.origin.toLowerCase()) ||
        flight.originName.toLowerCase().includes(searchFilter.value.origin.toLowerCase())
      
      const matchDestination = !searchFilter.value.destination || 
        flight.destination.toLowerCase().includes(searchFilter.value.destination.toLowerCase()) ||
        flight.destinationName.toLowerCase().includes(searchFilter.value.destination.toLowerCase())
      
      const matchStatus = !searchFilter.value.status || 
        flight.status === searchFilter.value.status

      return matchOrigin && matchDestination && matchStatus
    })
  })

  // Obtener estadísticas de vuelos para el dashboard
  const stats = computed(() => {
    const total = flights.value.length
    if (total === 0) return { total: 0, onTime: 0, delayed: 0, cancelled: 0 }
    
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

  return {
    flights,
    loading,
    error,
    searchFilter,
    filteredFlights,
    stats,
    fetchFlights
  }
}
