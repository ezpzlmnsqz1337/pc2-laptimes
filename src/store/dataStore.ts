import { Car } from '@/assets/db/cars'
import { Track } from '@/assets/db/tracks'
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
import { db } from '@/firebase'
import { bindFirestoreCollection } from '@/vuex-firestore-binding'
import { arrayUnion, collection, doc, setDoc, updateDoc } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'

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

export interface DataStore {
  websocketState: WebsocketState
  activeScreen: ScreenType
  cars: Car[],
  times: Laptime[],
  tracks: Track[],
  drivers: Driver[],
  lastAddedLaptime: Laptime | null
  getCarById(id: string): Car | undefined
  getCarByGameId(id: string): Car | undefined
  getTrackByGameId(id: string): Track | undefined
  getTrackById(id: string): Track | undefined
  getTrackVariants(trackId: string): string[] | undefined
  getTimeById(id: string): Laptime | undefined
  getDriverById(id: string): Driver | undefined
  getDriverByName(name: string): Driver | undefined
  getTimesForDriver (driverId: string) : Laptime[]
  getTimes (filter?: LaptimeFilter) : Laptime[]
  getTracksTimes (tracks: Track[]) : Laptime[]
  getDistinctTimes (laptimes: Laptime[]): Laptime[]

  addCar (name: string) :void
  addTrack (name: string) :void
  addTrackVariant (trackId: string, variant: string) :void
  addDriver (name: string) :void
  addLaptime (laptime: Laptime) :void

  showScreen (screen: ScreenType):void
  setLastAddedLaptime (laptime: Laptime) :void
  setWebsocketState (websocketState: WebsocketState) :void
  updateLaptime (laptime: LaptimeUpdate) :void
  bindDb () : void
}

export const dataStore: DataStore = {
  websocketState: WebsocketState.CLOSED_OR_COULD_NOT_OPEN,
  activeScreen: ScreenType.LAPTIME_BOARD,
  cars: [],
  times: [],
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
  setLastAddedLaptime (laptime: Laptime) {
    this.lastAddedLaptime = laptime
  },
  setWebsocketState (websocketState: WebsocketState) {
    if (this.websocketState === websocketState) return
    this.websocketState = websocketState
  },
  async addCar (name: string) {
    const car = { uid: uuidv4(), name }
    const docRef = doc(db, 'cars', car.uid)
    await setDoc(docRef, car)
  },
  async addTrack (name: string) {
    const t = { uid: uuidv4(), track: name, variants: [] }
    const docRef = doc(db, 'tracks', t.uid)
    await setDoc(docRef, t)
  },
  async addTrackVariant (trackId: string, variant: string) {
    const docRef = doc(db, 'tracks', trackId)
    await updateDoc(docRef, { variants: arrayUnion(variant) })
  },
  async addDriver (name: string) {
    const driver = { uid: uuidv4(), name }
    const docRef = doc(db, 'drivers', driver.uid)
    await setDoc(docRef, driver)
  },
  async addLaptime (laptime: Laptime) {
    const time = { ...laptime, uid: uuidv4(), dateString: new Date(laptime.date).toLocaleDateString('en-GB') }
    const docRef = doc(db, 'times', time.uid)
    this.setLastAddedLaptime(time)
    await setDoc(docRef, time)
  },
  async updateLaptime (laptime: LaptimeUpdate) {
    if (!laptime || !laptime.uid) return
    const docRef = doc(db, 'times', laptime.uid)
    console.log('Laptime: ', laptime, docRef)
    await setDoc(docRef, laptime, { merge: true })
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
        .sort((a, b) => ltb.compareLaptimes(a.laptime, b.laptime))

      result[x.uid] = this.getDistinctTimes(trackTimes)
    })
    return result
  },
  getTimes (filter?: LaptimeFilter) {
    if (!filter) return this.times

    const filterKeys = Object.keys(filter).filter(x => x !== 'distinct')

    const times = this.times.filter((time: any) => {
      for (const key of filterKeys) {
        const filterValue = (filter as any)[key]
        if (!filterValue) continue
        if (time[key] !== filterValue) {
          return false
        }
      }
      return true
    })

    return filter.distinct === Distinct.YES ? this.getDistinctTimes(times) : times
  },
  getDistinctTimes (laptimes: Laptime[]) {
    const times: Laptime[] = []
    const drivers: string[] = []
    const cars: string[] = []
    const tracks: string[] = []
    const trackVariants: string[] = []
    laptimes.forEach((l: Laptime) => {
      // filter duplicate times
      if (drivers.includes(l.driverId) && cars.includes(l.carId) && tracks.includes(l.trackId) && trackVariants.includes(l.trackVariant)) return
      times.push(l)
      if (!drivers.includes(l.driverId)) drivers.push(l.driverId)
      if (!cars.includes(l.carId)) cars.push(l.carId)
      if (!tracks.includes(l.trackId)) tracks.push(l.trackId)
      if (!trackVariants.includes(l.trackVariant)) trackVariants.push(l.trackVariant)
    })

    return times
  },
  bindDb () {
    bindFirestoreCollection(this, 'cars', collection(db, 'cars'))
    bindFirestoreCollection(this, 'tracks', collection(db, 'tracks'))
    bindFirestoreCollection(this, 'drivers', collection(db, 'drivers'))
    bindFirestoreCollection(this, 'times', collection(db, 'times'))
  }
}
