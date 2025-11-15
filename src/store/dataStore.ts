import { Car } from '@/constants/Car'
import { Track } from '@/constants/Track'
import LaptimeBuilder, { Laptime } from '@/builders/LaptimeBuilder'
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
export const DB_URL = 'http://192.168.0.102:3000'
export const WS_NOTIFICATION_URL = 'ws://192.168.0.102:3002'
export const CARS_ENDPOINT = `${DB_URL}/cars`
export const TRACKS_ENDPOINT = `${DB_URL}/tracks`
export const DRIVERS_ENDPOINT = `${DB_URL}/drivers`
export const TIMES_ENDPOINT = `${DB_URL}/times`
export const FAILED_AUTO_SUBMIT_ENDPOINT = `${DB_URL}/failedAutoSubmitData`

export interface DataStore {
  websocketState: WebsocketState
  activeScreen: ScreenType
  autoSubmit: boolean
  editLaptime: string | null
  dbNotificationWs: WebSocket | null
  cars: Car[]
  times: Laptime[]
  mytimes: Laptime[]
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
  getTracksTimes(tracks: Track[]): Laptime[]
  getDistinctTimes(laptimes: Laptime[]): Laptime[]
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
  setLastAddedLaptime(laptime: Laptime): void
  setWebsocketState(websocketState: WebsocketState): void

  fetchTracks(): void
  fetchCars(): void
  fetchDrivers(): void
  fetchTimes(): void

  bindDb(): void
  setupDbNotifications(): void
  disconnectDbNotifications(): void
  broadcastDataChange(table: string): void
  reloadData(table: string): void
}

export const dataStore: DataStore = {
  websocketState: WebsocketState.CLOSED_OR_COULD_NOT_OPEN,
  activeScreen: ScreenType.BROWSE_TIMES,
  autoSubmit: false,
  editLaptime: null,
  dbNotificationWs: null,
  cars: [],
  times: [],
  mytimes: [],
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
  setLastAddedLaptime (laptime: Laptime) {
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
      this.broadcastDataChange('times')
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
  getTracksTimes (tracks: Track[]) {
    const ltb = LaptimeBuilder.getInstance()
    const result = {} as any
    tracks.forEach(x => {
      const trackTimes = this.times
        .filter(x => x.trackId === x.uid)
        .sort((a, b) => ltb.compareLaptimes(b.laptime, a.laptime))

      result[x.uid] = this.getDistinctTimes(trackTimes)
    })
    return result
  },
  getTimes (filter?: LaptimeFilter) {
    if (!filter) return this.times

    const ltb = LaptimeBuilder.getInstance()
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
    const response = await fetch(TRACKS_ENDPOINT)
    const tracks = await response.json()
    this.tracks = tracks.map((x: Track) => {
      const camelCased = objectToCamel(x) as Track
      // PostgREST returns JSONB as already-parsed objects, not strings
      return {
        ...camelCased,
        variants: camelCased.variants
      }
    })
  },
  async fetchCars () {
    const response = await fetch(CARS_ENDPOINT)
    const cars = await response.json()
    this.cars = cars.map((x: Car) => objectToCamel(x) as Car)
  },
  async fetchDrivers () {
    const response = await fetch(DRIVERS_ENDPOINT)
    const drivers = await response.json()
    this.drivers = drivers.map((x: Driver) => objectToCamel(x) as Driver)
  },
  async fetchTimes () {
    const response = await fetch(TIMES_ENDPOINT)
    const times = await response.json()
    this.times = times.map((x: any) => {
      const camelCased = objectToCamel(x) as any
      return { ...camelCased, date: parseInt(camelCased.date), brakingLine: camelCased.brakingLine ? 'on' : 'off' }
    })
    // make races
    const races: any = []
    let found = false
    for (const t1 of this.times) {
      found = false
      for (const t2 of this.times) {
        if (t1.uid !== t2.uid && // not the same time
           t1.driverId !== t2.driverId && // not the same driver
           t1.trackId === t2.trackId && // same track
           t1.trackVariant === t2.trackVariant // same track variant
        ) {
          if (Math.abs(t1.date - t2.date) <= 5 * 60 * 1000) {
            // within 5 minutes
            races.push({ uid: uuidv4(), times: [t1, t2] })
            found = true
            break
          }
        }
      }
      if (!found) races.push({ uid: uuidv4(), times: [t1] })
    }
    console.log(races)
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
      }

      this.dbNotificationWs.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          if (message.type === 'connected') {
            console.log(message.message)
            return
          }

          // Reload data for the changed table
          if (message.table) {
            this.reloadData(message.table)
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
  broadcastDataChange (table: string) {
    if (this.dbNotificationWs && this.dbNotificationWs.readyState === WebSocket.OPEN) {
      const message = {
        table,
        operation: 'CHANGE',
        timestamp: new Date().toISOString()
      }
      this.dbNotificationWs.send(JSON.stringify(message))
      setTimeout(() => {
        this.reloadData(table)
      }, 500)
    }
  },
  async reloadData (table: string) {
    console.log(`Reloading data for table: ${table}`)

    try {
      switch (table) {
        case 'cars':
          await this.fetchTracks()
          console.log('Cars reloaded')
          break
        case 'tracks':
          await this.fetchCars()
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
    }
    eb.emit('laptimes:change')
  }
}
