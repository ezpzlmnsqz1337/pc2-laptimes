import { Car } from '@/constants/Car'
import { Track } from '@/constants/Track'
import { laptimeBuilder, Laptime } from '@/builders/LaptimeBuilder'
import RaceBuilder from '@/builders/RaceBuilder'
import type { Race } from '@/builders/RaceBuilder'
import RaceStatisticsBuilder, { DriverRaceTotalRow } from '@/builders/RaceStatisticsBuilder'
import { Driver } from '@/builders/StatisticsBuilder'
import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { Distinct } from '@/constants/Distinct'
import { Game } from '@/constants/Game'
import { ScreenType } from '@/constants/ScreenType'
import { StartType } from '@/constants/StartType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import { WebsocketState } from '@/constants/WebsocketState'
import { v4 as uuidv4 } from 'uuid'
import eb from '@/eventBus'
import { objectToCamel, objectToSnake } from 'ts-case-convert'

export { RACE_GROUP_WINDOW_MS } from '@/builders/RaceBuilder'
export type { Race } from '@/builders/RaceBuilder'

// const debug = process.env.NODE_ENV !== 'production'

export interface LaptimeUpdate {
  uid: string
  carId?: string
  trackId?: string
  trackVariant?: string
  driverId?: string
  transmission?: TransmissionType
  weather?: WeatherType
  brakingLine?: BrakingLine
  controls?: ControlType
  startType?: StartType
  laptime?: string
  game?: Game
  date?: number
  notes?: string
}

export interface FailedAutoSubmitData {
  carName: string
  trackLocation: string
  trackVariation: string
}

export interface LaptimeFilter {
  carId?: string | null
  trackId?: string | null
  trackVariant?: string | null
  driverId?: string | null
  transmission?: TransmissionType
  weather?: WeatherType
  brakingLine?: BrakingLine
  controls?: ControlType
  startType?: StartType
  game?: Game
  date?: Date | null
  distinct?: Distinct
}
// PostgREST/WS are only reachable directly by LAN IP; over the public HTTPS domain
// they're reverse-proxied via separate NPM hosts that terminate TLS (browsers block
// insecure http/ws requests from an https page).
const isSecureContext = window.location.protocol === 'https:'
export const DB_URL = isSecureContext ? 'https://pc2laptimes-api.braun-dev.eu' : 'http://192.168.0.102:3000'
export const WS_NOTIFICATION_URL = isSecureContext ? 'wss://pc2laptimes-ws.braun-dev.eu' : 'ws://192.168.0.102:3002'
export const CARS_ENDPOINT = `${DB_URL}/cars`
export const TRACKS_ENDPOINT = `${DB_URL}/tracks`
export const DRIVERS_ENDPOINT = `${DB_URL}/drivers`
export const TIMES_ENDPOINT = `${DB_URL}/times`
export const FAILED_AUTO_SUBMIT_ENDPOINT = `${DB_URL}/failedAutoSubmitData`

export interface RaceFilter {
  driverId?: string | null
  includeSolo?: boolean
}

let reloadInFlight = false
let queuedReloadTable: string | null = null
let hasConnectedNotifications = false
let pendingNotification: { table: string, uid?: string } | null = null

function toNotificationPayload (table: string, uid?: string) {
  return {
    table,
    operation: 'CHANGE',
    ...(uid ? { uid } : {}),
    timestamp: new Date().toISOString()
  }
}

export interface DataStore {
  websocketState: WebsocketState
  activeScreen: ScreenType
  autoSubmit: boolean
  editLaptime: string | null
  dbNotificationWs: WebSocket | null
  cars: Car[]
  times: Laptime[]
  races: Race[]
  raceTotals: {
    includeSolo: DriverRaceTotalRow[]
    excludeSolo: DriverRaceTotalRow[]
  }
  tracks: Track[]
  drivers: Driver[]
  lastAddedLaptime: Laptime | null
  getCarById(id: string): Car | undefined
  getCarByGameId(id: string): Car | undefined
  getTrackByGameId(id: string): Track | undefined
  getTrackById(id: string): Track | undefined
  getTrackVariants(trackId: string): string[] | undefined
  getTimeById(id: string): Laptime | undefined
  getDriverById(id: string): Driver | undefined
  getDriverByName(name: string): Driver | undefined
  getTimesForDriver(driverId: string): Laptime[]
  getTimes(filter?: LaptimeFilter): Laptime[]
  getLatestTimes(laptimes: Laptime[]): Laptime[]
  getDisplayTimes(filter?: LaptimeFilter): Laptime[]
  getRaces(filter?: RaceFilter): Race[]
  getRaceTotals(includeSolo?: boolean): DriverRaceTotalRow[]
  getDistinctTimes(laptimes: Laptime[]): Laptime[]
  refreshRaceTotals(): void
  toggleAutoSubmit(): void

  addCar(name: string): void
  addTrack(name: string): void
  addTrackVariant(trackId: string, variant: string): void
  addDriver(name: string): void
  addLaptime(laptime: Laptime): void
  storeFailedAutoSubmitData(data: FailedAutoSubmitData): void

  linkCarToGameId(carId: string, gameId: string): void
  linkTrackToGameId(trackId: string, gameId: string): void
  updateLaptime(laptime: LaptimeUpdate): void
  deleteLaptime(laptimeId: string): void

  showScreen(screen: ScreenType): void
  setEditLaptime(laptimeId: string | null): void
  setLastAddedLaptime(laptime: Laptime | null): void
  setWebsocketState(websocketState: WebsocketState): void

  fetchTracks(): void
  fetchCars(): void
  fetchDrivers(): void
  fetchTimes(): void

  bindDb(): void
  setupDbNotifications(): void
  disconnectDbNotifications(): void
  broadcastDataChange(table: string, uid?: string): void
  reloadData(table: string): Promise<void>
}

export const dataStore: DataStore = {
  websocketState: WebsocketState.CLOSED_OR_COULD_NOT_OPEN,
  activeScreen: ScreenType.BROWSE_TIMES,
  autoSubmit: false,
  editLaptime: null,
  dbNotificationWs: null,
  cars: [],
  times: [],
  races: [],
  raceTotals: {
    includeSolo: [],
    excludeSolo: []
  },
  tracks: [],
  drivers: [],
  lastAddedLaptime: null,
  getCarById (id: string) {
    return this.cars.find(x => x.uid === id)
  },
  getCarByGameId (id) {
    return this.cars.find(x => x.gameId === id)
  },
  getTrackByGameId (id) {
    return this.tracks.find(x => x.gameId === id)
  },
  getTrackById (id) {
    return this.tracks.find(x => x.uid === id)
  },
  getTrackVariants (trackId) {
    if (!trackId) return []
    return this.tracks.find(x => x.uid === trackId)?.variants
  },
  getTimeById (id) {
    return this.times.find(x => x.uid === id)
  },
  getDriverById (id) {
    return this.drivers.find(x => x.uid === id)
  },
  getDriverByName (name) {
    return this.drivers.find(x => x.name.toLowerCase() === name.toLowerCase())
  },
  showScreen (screen: ScreenType) {
    this.activeScreen = screen
  },
  setEditLaptime (laptimeId: string | null) {
    this.editLaptime = laptimeId
  },
  setLastAddedLaptime (laptime: Laptime | null) {
    this.lastAddedLaptime = laptime
  },
  setWebsocketState (websocketState: WebsocketState) {
    if (this.websocketState === websocketState) return
    this.websocketState = websocketState
  },
  toggleAutoSubmit () {
    this.autoSubmit = !this.autoSubmit
  },
  async addCar (name: string) {
    const car = { uid: uuidv4(), name, imageUrl: '', gameId: '' }
    const response = await fetch(`${CARS_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objectToSnake(car))
    })
    console.log(response.statusText)
    if (response.ok) {
      this.broadcastDataChange('cars')
    }
  },
  async addTrack (name: string) {
    const track = { uid: uuidv4(), track: name, variants: [] as string[], gameId: '' }
    const response = await fetch(`${TRACKS_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objectToSnake({ ...track, variants: JSON.stringify(track.variants) }))
    })
    console.log(response.statusText)
    if (response.ok) {
      this.broadcastDataChange('tracks')
    }
  },
  async addTrackVariant (trackId: string, variant: string) {
    if (!trackId || !variant) return
    const track = this.getTrackById(trackId)
    if (!track) return
    const variants = track.variants ? [...track.variants] : []
    if (variants.includes(variant)) return
    const updatedTrack = { ...track, variants: [...variants, variant] }
    const response = await fetch(`${TRACKS_ENDPOINT}?uid=eq.${encodeURIComponent(trackId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objectToSnake({ ...updatedTrack, variants: JSON.stringify(updatedTrack.variants) }))
    })
    if (response.ok) {
      track.variants = updatedTrack.variants
      this.broadcastDataChange('tracks')
    }
    console.log(response.statusText)
  },
  async addDriver (name: string) {
    const driver = { uid: uuidv4(), name }
    const response = await fetch(`${DRIVERS_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objectToSnake(driver))
    })
    console.log(response.statusText)
    if (response.ok) {
      this.broadcastDataChange('drivers')
    }
  },
  async addLaptime (laptime: Laptime) {
    const time = { ...laptime, uid: uuidv4(), dateString: new Date(laptime.date).toLocaleDateString('en-GB') }
    this.setLastAddedLaptime(time)
    const payload = {
      ...time,
      brakingLine: time.brakingLine === BrakingLine.ON
    }
    const response = await fetch(`${TIMES_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objectToSnake(payload))
    })
    console.log(response.statusText)
    if (response.ok) {
      this.broadcastDataChange('times', time.uid)
    }
  },
  async updateLaptime (laptime: LaptimeUpdate) {
    if (!laptime || !laptime.uid) return

    const payload: Record<string, any> = { ...this.getTimeById(laptime.uid), ...laptime }
    delete payload.uid
    if (payload.brakingLine !== undefined) {
      payload.brakingLine = payload.brakingLine === BrakingLine.ON
    }
    if (payload.date !== undefined) {
      payload.dateString = new Date(parseInt(payload.date)).toLocaleDateString('en-GB')
    }
    const response = await fetch(`${TIMES_ENDPOINT}?uid=eq.${encodeURIComponent(laptime.uid)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objectToSnake(payload))
    })
    if (!response.ok) {
      console.log(response.statusText)
      return
    }

    const index = this.times.findIndex(x => x.uid === laptime.uid)
    if (index === -1) {
      console.log(response.statusText)
      return
    }

    const sanitizedUpdate = Object.fromEntries(
      Object.entries(laptime).filter(([key, value]) => key !== 'uid' && value !== undefined)
    ) as Record<string, any>

    if (payload.dateString !== undefined) {
      sanitizedUpdate.dateString = payload.dateString
    }
    if (payload.brakingLine !== undefined) {
      sanitizedUpdate.brakingLine = (laptime.brakingLine as BrakingLine) ?? this.times[index].brakingLine
    }

    this.times[index] = { ...this.times[index], ...sanitizedUpdate }
    this.races = RaceBuilder.buildRacesFromTimes(this.times)
    this.refreshRaceTotals()
    console.log(response.statusText)
    this.broadcastDataChange('times')
  },
  async deleteLaptime (laptimeId: string) {
    if (!laptimeId) return
    const response = await fetch(`${TIMES_ENDPOINT}?uid=eq.${encodeURIComponent(laptimeId)}`, {
      method: 'DELETE'
    })
    if (response.ok) {
      this.times = this.times.filter(x => x.uid !== laptimeId)
      this.races = RaceBuilder.buildRacesFromTimes(this.times)
      this.refreshRaceTotals()
      this.broadcastDataChange('times')
    }
    console.log(response.statusText)
  },
  async linkCarToGameId (carId: string, gameId: string) {
    if (!carId || !gameId) return
    const response = await fetch(`${CARS_ENDPOINT}?uid=eq.${encodeURIComponent(carId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objectToSnake({ gameId }))
    })
    if (response.ok) {
      const car = this.getCarById(carId)
      if (car) car.gameId = gameId
      this.broadcastDataChange('cars')
    }
    console.log(response.statusText)
  },
  async linkTrackToGameId (trackId: string, gameId: string) {
    if (!trackId || !gameId) return
    const response = await fetch(`${TRACKS_ENDPOINT}?uid=eq.${encodeURIComponent(trackId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objectToSnake({ gameId }))
    })
    if (response.ok) {
      const track = this.getTrackById(trackId)
      if (track) track.gameId = gameId
      this.broadcastDataChange('tracks')
    }
    console.log(response.statusText)
  },
  async storeFailedAutoSubmitData (data: FailedAutoSubmitData) {
    if (!data) return
    const failedData = { uid: uuidv4(), ...data, dateString: new Date().toLocaleDateString('en-GB') }
    const response = await fetch(`${FAILED_AUTO_SUBMIT_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(objectToSnake(failedData))
    })
    console.log(response.statusText)
  },
  getTimesForDriver (driverId: string) {
    if (!driverId) return []
    return this.times.filter(x => x.driverId === driverId)
  },
  getTimes (filter?: LaptimeFilter) {
    if (!filter) return this.times

    const ltb = laptimeBuilder
    const { distinct, date, ...rest } = filter

    const normalizedDate = date ? new Date(date).toLocaleDateString('en-GB') : null
    const activeFilters = Object.entries(rest).filter(([, value]) => value)

    const times = this.times
      .filter((time: any) => {
        if (normalizedDate && time.dateString !== normalizedDate) return false

        return activeFilters.every(([key, value]) => time[key] === value)
      })
      .sort((a, b) => ltb.compareLaptimes(a.laptime, b.laptime))

    return distinct === Distinct.YES ? this.getDistinctTimes(times) : times
  },
  getLatestTimes (laptimes: Laptime[]) {
    const latestByDriver = new Map<string, Laptime>()

    laptimes.forEach(laptime => {
      const current = latestByDriver.get(laptime.driverId)
      if (!current || laptime.date > current.date) latestByDriver.set(laptime.driverId, laptime)
    })

    return [...latestByDriver.values()]
  },
  getDisplayTimes (filter?: LaptimeFilter) {
    const matching = this.getTimes({ ...filter, distinct: Distinct.NO })
    if (filter?.distinct !== Distinct.YES) return matching

    const lapsByDriver = new Map<string, Laptime[]>()
    matching.forEach(laptime => {
      const laps = lapsByDriver.get(laptime.driverId) ?? []
      laps.push(laptime)
      lapsByDriver.set(laptime.driverId, laps)
    })

    const rows = new Map<string, Laptime>()
    lapsByDriver.forEach(laps => {
      const [best, previousBest] = laps
      rows.set(best.uid, best)

      const latest = laps.reduce((a, b) => (b.date > a.date ? b : a))
      const secondRow = latest.uid === best.uid ? previousBest : latest
      if (secondRow) rows.set(secondRow.uid, secondRow)
    })

    return [...rows.values()].sort((a, b) => laptimeBuilder.compareLaptimes(a.laptime, b.laptime))
  },
  getRaces (filter?: RaceFilter) {
    const includeSolo = filter?.includeSolo ?? false
    const driverId = filter?.driverId

    return this.races
      .filter(x => includeSolo || x.times.length > 1)
      .filter(x => !driverId || x.times.some(t => t.driverId === driverId))
      .sort((a, b) => b.startDate - a.startDate)
  },
  getRaceTotals (includeSolo = false) {
    return includeSolo ? this.raceTotals.includeSolo : this.raceTotals.excludeSolo
  },
  refreshRaceTotals () {
    const buildTotalsFor = (includeSolo: boolean) => {
      const races = includeSolo ? this.races : this.races.filter(x => x.times.length > 1)
      return RaceStatisticsBuilder.buildDriverRaceTotals({
        races,
        resolveDriver: (driverId) => this.getDriverById(driverId),
        resolveTrackName: (trackId) => this.getTrackById(trackId)?.track || 'Unknown',
        resolveCar: (carId) => this.getCarById(carId)
      })
    }

    this.raceTotals = {
      includeSolo: buildTotalsFor(true),
      excludeSolo: buildTotalsFor(false)
    }
  },
  getDistinctTimes (laptimes: Laptime[]) {
    const seenKeys = new Set<string>()

    return laptimes.filter((l: Laptime) => {
      const key = `${l.driverId}|${l.carId}|${l.trackId}|${l.trackVariant ?? ''}`
      if (seenKeys.has(key)) return false
      seenKeys.add(key)
      return true
    })
  },
  async fetchTracks () {
    const response = await fetch(TRACKS_ENDPOINT, { cache: 'no-store' })
    const tracks = await response.json()
    this.tracks = tracks.map((x: Track) => {
      const camelCased = objectToCamel(x) as Track
      // PostgREST returns JSONB as already-parsed objects, not strings
      return {
        ...camelCased,
        variants: camelCased.variants
      }
    })
    this.refreshRaceTotals()
  },
  async fetchCars () {
    const response = await fetch(CARS_ENDPOINT, { cache: 'no-store' })
    const cars = await response.json()
    this.cars = cars.map((x: Car) => objectToCamel(x) as Car)
    this.refreshRaceTotals()
  },
  async fetchDrivers () {
    const response = await fetch(DRIVERS_ENDPOINT, { cache: 'no-store' })
    const drivers = await response.json()
    this.drivers = drivers.map((x: Driver) => objectToCamel(x) as Driver)
    this.refreshRaceTotals()
  },
  async fetchTimes () {
    const response = await fetch(TIMES_ENDPOINT, { cache: 'no-store' })
    const times = await response.json()
    this.times = times.map((x: any) => {
      const camelCased = objectToCamel(x) as any
      return { ...camelCased, date: parseInt(camelCased.date), brakingLine: camelCased.brakingLine ? 'on' : 'off' }
    })
    this.races = RaceBuilder.buildRacesFromTimes(this.times)
    this.refreshRaceTotals()
  },
  bindDb () {
    this.fetchTracks()
    this.fetchCars()
    this.fetchDrivers()
    this.fetchTimes()
  },
  setupDbNotifications () {
    if (this.dbNotificationWs) {
      console.warn('DB notification WebSocket already connected')
      return
    }

    try {
      this.dbNotificationWs = new WebSocket(WS_NOTIFICATION_URL)

      this.dbNotificationWs.onopen = () => {
        console.log('Connected to database notification server')
        if (pendingNotification) {
          this.dbNotificationWs?.send(JSON.stringify(toNotificationPayload(pendingNotification.table, pendingNotification.uid)))
          pendingNotification = null
        }
        if (hasConnectedNotifications) {
          this.reloadData('times')
        }
        hasConnectedNotifications = true
      }

      this.dbNotificationWs.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data)

          if (message.type === 'connected') {
            console.log(message.message)
            return
          }

          // Reload data for the changed table
          if (message.table) {
            await this.reloadData(message.table)
            if (message.uid) {
              const laps = this.getTimeById(message.uid)
              if (laps) this.setLastAddedLaptime(laps)
            }
          }
        } catch (error) {
          console.error('Error parsing notification:', error)
        }
      }

      this.dbNotificationWs.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      this.dbNotificationWs.onclose = () => {
        console.log('Disconnected from database notification server')
        this.dbNotificationWs = null
        // Auto-reconnect after 5 seconds
        setTimeout(() => {
          console.log('Attempting to reconnect to notification server...')
          this.setupDbNotifications()
        }, 5000)
      }
    } catch (error) {
      console.error('Failed to connect to notification server:', error)
    }
  },
  disconnectDbNotifications () {
    if (this.dbNotificationWs) {
      this.dbNotificationWs.close()
      this.dbNotificationWs = null
    }
  },
  broadcastDataChange (table: string, uid?: string) {
    const isOpen = this.dbNotificationWs?.readyState === WebSocket.OPEN

    if (isOpen) {
      this.dbNotificationWs!.send(JSON.stringify(toNotificationPayload(table, uid)))
    } else {
      // Keep the notification until the relay reconnects so the other client
      // still receives the change instead of silently drifting.
      pendingNotification = { table, uid }
      this.setupDbNotifications()
    }

    this.reloadData(table)
  },
  async reloadData (table: string) {
    if (reloadInFlight) {
      queuedReloadTable = table
      return
    }

    reloadInFlight = true
    console.log(`Reloading data for table: ${table}`)

    try {
      switch (table) {
        case 'cars':
          await this.fetchCars()
          console.log('Cars reloaded')
          break
        case 'tracks':
          await this.fetchTracks()
          console.log('Tracks reloaded')
          break
        case 'drivers':
          await this.fetchDrivers()
          console.log('Drivers reloaded')
          break
        case 'times':
          await this.fetchTimes()
          console.log('Laptimes reloaded')
          break
        default:
          console.log(`Unknown table: ${table}`)
      }
    } catch (error) {
      console.error(`Failed to reload data for ${table}:`, error)
    } finally {
      reloadInFlight = false
    }

    eb.emit('laptimes:change')

    const queuedTable = queuedReloadTable
    queuedReloadTable = null
    if (queuedTable) await this.reloadData(queuedTable)
  }
}
