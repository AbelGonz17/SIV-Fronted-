import { ref, computed } from 'vue'
import { flightsService } from '../services/flightsService'
import { airlinesService } from '../services/airlinesService'
import { airportsService } from '../services/airportsService'
import type { FlightDTO, FlightFilterDTO } from '../models/FlightDTO'
import type { AirlineDTO } from '../models/AirlineDTO'
import type { AirportDTO } from '../models/AirportDTO'

const AIRPORT_CODES: Record<string, string> = {
  'miami international airport': 'MIA',
  'las américas international airport': 'SDQ',
  'las americas international airport': 'SDQ',
  'john f. kennedy international airport': 'JFK',
  'punta cana international airport': 'PUJ',
  'aeropuerto internacional el dorado': 'BOG',
  'el dorado international airport': 'BOG'
}

function getAirportCode(name: string | undefined): string {
  if (!name) return 'N/A'
  const key = name.toLowerCase().trim()
  if (AIRPORT_CODES[key]) return AIRPORT_CODES[key]
  
  const parts = key.split(/\s+/)
  if (parts.length >= 3) {
    return (parts[0][0] + parts[1][0] + parts[2][0]).toUpperCase()
  }
  return name.substring(0, 3).toUpperCase()
}

export function useFlights() {
  const flights = ref<FlightDTO[]>([])
  const airlines = ref<AirlineDTO[]>([])
  const airports = ref<AirportDTO[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  
  const searchFilter = ref<FlightFilterDTO>({
    pageNumber: 1,
    pageSize: 20,
    esLlegada: '',
    estado: '',
    aerolineaId: '',
    fecha: ''
  })

  const totalPages = ref<number>(1)
  const totalCount = ref<number>(0)

  const fetchAirlines = async () => {
    try {
      airlines.value = await airlinesService.getAll()
    } catch (err: any) {
      console.error('Error fetching airlines:', err)
    }
  }

  const fetchAirports = async () => {
    try {
      airports.value = await airportsService.getAll()
    } catch (err: any) {
      console.error('Error fetching airports:', err)
      error.value = err.message || 'Error al cargar catálogo de aeropuertos.'
    }
  }

  const fetchFlights = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await flightsService.getFids(searchFilter.value)
      
      const payload = data || { items: [], totalPages: 1, totalCount: 0 }
      const items = payload.items || []
      
      totalPages.value = payload.totalPages || 1
      totalCount.value = payload.totalCount || 0

      flights.value = items.map((item: any) => {
        const isArrival = item.destino?.toLowerCase().includes('las américas') || 
                          item.destino?.toLowerCase().includes('las americas') ||
                          searchFilter.value.esLlegada === 'true'

        const mainTimeStr = item.horarioEstimado || item.horarioPlanificado
        const mainTime = new Date(mainTimeStr)
        
        let departureTime = mainTimeStr
        let arrivalTime = mainTimeStr

        if (mainTimeStr) {
          if (isArrival) {
            const depDate = new Date(mainTime.getTime() - 2 * 60 * 60 * 1000)
            departureTime = depDate.toISOString()
          } else {
            const arrDate = new Date(mainTime.getTime() + 2 * 60 * 60 * 1000)
            arrivalTime = arrDate.toISOString()
          }
        }

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
          numeroVuelo: item.numeroVuelo,
          aerolineaId: item.aerolineaId || '',
          aerolineaNombre: item.aerolinea,
          origen: item.origen,
          destino: item.destino,
          horarioPlanificado: item.horarioPlanificado,
          horarioEstimado: item.horarioEstimado,
          estado: item.estado,
          precioBase: item.precioBase,
          puertaEmbarque: item.puerta,
          
          uiStatus,
          uiType: isArrival ? 'Arrival' : 'Departure',
          // Campos legacy para UI vieja (si se usaban)
          airline: item.aerolinea || 'Aerolínea',
          flightNumber: item.numeroVuelo || 'N/A',
          originName: item.origen || 'Origen',
          destinationName: item.destino || 'Destino',
          departureTime,
          arrivalTime,
          status: uiStatus,
          gate: item.puerta || 'N/A'
        }
      }) as unknown as FlightDTO[]
    } catch (err: any) {
      console.error('Error fetching flights:', err)
      if (err.response?.status === 401) {
          error.value = 'Sesión expirada o no autorizada. Por favor inicia sesión nuevamente.'
      } else {
          error.value = err.message || 'Error al cargar la información de vuelos.'
      }
    } finally {
      loading.value = false
    }
  }

  const updateFlightFromPayload = (payload: any) => {
    const idx = flights.value.findIndex(f => f.id === payload.vueloId)
    if (idx !== -1) {
      const flight = flights.value[idx] as any
      
      if (payload.numeroVuelo) { flight.numeroVuelo = payload.numeroVuelo; flight.flightNumber = payload.numeroVuelo; }
      if (payload.estadoActual) { flight.estado = payload.estadoActual; }
      if (payload.puerta) { flight.puertaEmbarque = payload.puerta; flight.gate = payload.puerta; }
      if (payload.horarioPlanificado) { flight.horarioPlanificado = payload.horarioPlanificado; }
      if (payload.horarioEstimado) { flight.horarioEstimado = payload.horarioEstimado; }

      let uiStatus = 'On Time'
      const estadoLower = flight.estado?.toLowerCase() || ''
      if (estadoLower.includes('cancel') || estadoLower.includes('cancelado')) {
        uiStatus = 'Cancelled'
      } else if (estadoLower.includes('demora') || estadoLower.includes('delay') || estadoLower.includes('retras')) {
        uiStatus = 'Delayed'
      } else if (estadoLower.includes('abord') || estadoLower.includes('board')) {
        uiStatus = 'Boarding'
      } else if (estadoLower.includes('program') || estadoLower.includes('sched')) {
        uiStatus = 'On Time'
      } else {
        uiStatus = flight.estado || 'On Time'
      }
      flight.uiStatus = uiStatus
      flight.status = uiStatus
    }
  }

  const filteredFlights = computed(() => {
    return flights.value.filter((flight: any) => {
      // Necesitamos as any local temporalmente por las properties extras, lo correcto es agregarlas al DTO opcionalmente
      // pero por simplicidad se usan los campos mapeados.
      return true; // Asumiremos que el filtro real viene de la API, y esto es sólo por si se necesita
    })
  })

  const stats = computed(() => {
    const total = flights.value.length
    if (total === 0) return { total: 0, onTime: 0, delayed: 0, cancelled: 0, onTimePercentage: 100 }
    
    const onTime = flights.value.filter(f => f.uiStatus === 'On Time' || f.uiStatus === 'Boarding' || (f as any).status === 'On Time' || (f as any).status === 'Boarding').length
    const delayed = flights.value.filter(f => f.uiStatus === 'Delayed' || (f as any).status === 'Delayed').length
    const cancelled = flights.value.filter(f => f.uiStatus === 'Cancelled' || (f as any).status === 'Cancelled').length

    return {
      total,
      onTime,
      delayed,
      cancelled,
      onTimePercentage: Math.round((onTime / total) * 100)
    }
  })

  const fetchFlightDetails = async (flightId: string) => {
    try {
      return await flightsService.getDetails(flightId)
    } catch (err: any) {
      console.error(`Error fetching flight details for ${flightId}:`, err)
      throw err
    }
  }

  const createFlight = async (command: any) => {
    try {
      await flightsService.register(command)
    } catch (err: any) {
      throw new Error(err.response?.data?.errorMessage || 'Error al crear el vuelo.')
    }
  }

  const updateFlightBasics = async (id: string, request: any) => {
    try {
      await flightsService.updateBasic(id, request)
    } catch (err: any) {
      throw new Error(err.response?.data?.errorMessage || 'Error al actualizar datos del vuelo.')
    }
  }

  const updateFlightStatus = async (command: any) => {
    try {
      await flightsService.updateStatus(command)
    } catch (err: any) {
      throw new Error(err.response?.data?.errorMessage || 'Error al actualizar estado del vuelo.')
    }
  }

  const registerDelay = async (command: any) => {
    try {
      await flightsService.registerDelay(command)
    } catch (err: any) {
      throw new Error(err.response?.data?.errorMessage || 'Error al registrar retraso.')
    }
  }

  const registerAdvance = async (command: any) => {
    try {
      await flightsService.registerAdvance(command)
    } catch (err: any) {
      throw new Error(err.response?.data?.errorMessage || 'Error al registrar adelanto.')
    }
  }

  const cancelFlight = async (command: any) => {
    try {
      await flightsService.cancel(command)
    } catch (err: any) {
      throw new Error(err.response?.data?.errorMessage || 'Error al cancelar el vuelo.')
    }
  }

  return {
    flights,
    airlines,
    airports,
    loading,
    error,
    searchFilter,
    filteredFlights, // deprecated local filtering but kept for compat
    stats,
    totalPages,
    totalCount,
    fetchFlights,
    fetchAirlines,
    fetchAirports,
    fetchFlightDetails,
    createFlight,
    updateFlightBasics,
    updateFlightStatus,
    registerDelay,
    registerAdvance,
    cancelFlight,
    updateFlightFromPayload
  }
}
