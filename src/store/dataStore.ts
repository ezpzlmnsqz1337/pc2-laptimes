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
import { arrayUnion, collection, doc, DocumentData, getDocs, limit, orderBy, query, QueryConstraint, QueryDocumentSnapshot, setDoc, updateDoc, where } from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'
import { LaptimeFilter, laptimeFilterStore } from './laptimeFilterStore'

const debug = process.env.NODE_ENV !== 'production'

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
  setTimes (times: Laptime[]): void
  showScreen (screen: ScreenType):void
  setLastAddedLaptime (laptime: Laptime) :void
  setWebsocketState (websocketState: WebsocketState) :void
  addNewCar (name: string) :void
  addNewTrack (name: string) :void
  addNewTrackVariant (trackId: string, variant: string) :void
  addNewDriver (name: string) :void
  addLaptime (laptime: Laptime) :void
  linkCarToGameId (carId: string, gameId: string) :void
  linkTrackToGameId (trackId: string, gameId: string) :void
  setCarImage (carId: string, imageUrl: string) :void
  updateLaptime (laptime: LaptimeUpdate) :void
  getTimesForDriver (driverId: string) : Promise<Laptime[]>
  getTimes (queryLimit: number, filter?: LaptimeFilter) : Promise<Laptime[]>
  getTracksTimes (tracks: Track[]) : Promise<Laptime[]>
  getDistinctTimes (docs: QueryDocumentSnapshot<DocumentData>[]) : Promise<Laptime[]>
  refreshTimes () : void
  bindDb () : void
  _createFilterQuery(filter?: LaptimeFilter): QueryConstraint[]
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
  setTimes (times: Laptime[]) {
    if (!times) return
    this.times.splice(0)
    this.times.push(...times)
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
  async addNewCar (name: string) {
    const car = { uid: uuidv4(), name }
    const docRef = doc(db, 'cars', car.uid)
    await setDoc(docRef, car)
  },
  async addNewTrack (name: string) {
    const t = { uid: uuidv4(), track: name, variants: [] }
    const docRef = doc(db, 'tracks', t.uid)
    await setDoc(docRef, t)
  },
  async addNewTrackVariant (trackId: string, variant: string) {
    const docRef = doc(db, 'tracks', trackId)
    await updateDoc(docRef, { variants: arrayUnion(variant) })
  },
  async addNewDriver (name: string) {
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
  async linkCarToGameId (carId: string, gameId: string) {
    if (!carId || !gameId) return
    const docRef = doc(db, 'cars', carId)
    console.log('Link: ', carId, docRef)
    await updateDoc(docRef, { gameId })
  },
  async linkTrackToGameId (trackId: string, gameId: string) {
    if (!trackId || !gameId) return
    const docRef = doc(db, 'tracks', trackId)
    console.log('Link: ', trackId, docRef)
    await updateDoc(docRef, { gameId })
  },
  async setCarImage (carId: string, imageUrl: string) {
    if (!carId || !imageUrl) return
    const docRef = doc(db, 'cars', carId)
    await updateDoc(docRef, { imageUrl })
  },
  async updateLaptime (laptime: LaptimeUpdate) {
    if (!laptime || !laptime.uid) return
    const docRef = doc(db, 'times', laptime.uid)
    console.log('Laptime: ', laptime, docRef)
    await setDoc(docRef, laptime, { merge: true })
  },
  async getTimesForDriver (driverId: string) {
    if (!driverId) return []
    const q = query(collection(db, 'times'), where('driverId', '==', driverId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(x => x.data()) as Laptime[]
  },
  _createFilterQuery (filter?: LaptimeFilter): QueryConstraint[] {
    const constraints: QueryConstraint[] = []

    if (!filter) return constraints

    if (filter.carId) constraints.push(where('carId', '==', filter.carId))
    if (filter.trackId) constraints.push(where('trackId', '==', filter.trackId))
    if (filter.trackVariant) constraints.push(where('trackVariant', '==', filter.trackVariant))
    if (filter.driverId) constraints.push(where('driverId', '==', filter.driverId))
    if (filter.transmission) constraints.push(where('transmission', '==', filter.transmission))
    if (filter.weather) constraints.push(where('weather', '==', filter.weather))
    if (filter.brakingLine) constraints.push(where('brakingLine', '==', filter.brakingLine))
    if (filter.controls) constraints.push(where('controls', '==', filter.controls))
    if (filter.startType) constraints.push(where('startType', '==', filter.startType))
    if (filter.date) constraints.push(where('dateString', '==', new Date(filter.date).toLocaleDateString('en-GB')))
    if (filter.game) constraints.push(where('game', '==', filter.game))

    return constraints
  },
  async getTimes (queryLimit = 30, filter?: LaptimeFilter) {
    const constraints = this._createFilterQuery(filter)
    constraints.push(orderBy('laptime'))

    const distinct = !!(filter?.distinct === Distinct.YES)

    if (queryLimit > 0) constraints.push(limit(queryLimit))

    const q = query(collection(db, 'times'), ...constraints)
    const querySnapshot = await getDocs(q)
    const times = distinct ? await this.getDistinctTimes(querySnapshot.docs) : querySnapshot.docs.map(x => x.data())

    const ltb = LaptimeBuilder.getInstance()
    return times.sort((a, b) => ltb.compareLaptimes(a.laptime, b.laptime)) as Laptime[]
  },
  async getTracksTimes (tracks: Track[]) {
    const result = {} as any
    tracks.forEach(async x => {
      const q = query(collection(db, 'times'), where('trackId', '==', x.uid), orderBy('laptime'))
      const querySnapshot = await getDocs(q)
      result[x.uid] = await this.getDistinctTimes(querySnapshot.docs)
    })
    return result
  },
  async getDistinctTimes (docs: QueryDocumentSnapshot<DocumentData>[]) {
    const times: Laptime[] = []
    const drivers: Driver[] = []
    const cars: Car[] = []
    const tracks: Track[] = []
    const trackVariants: any[] = []
    docs.forEach((doc: any) => {
      const t = doc.data()
      // filter duplicate times
      if (drivers.includes(t.driverId) && cars.includes(t.carId) && tracks.includes(t.trackId) && trackVariants.includes(t.trackVariant)) return
      times.push(t)
      if (!drivers.includes(t.driverId)) drivers.push(t.driverId)
      if (!cars.includes(t.carId)) cars.push(t.carId)
      if (!tracks.includes(t.trackId)) tracks.push(t.trackId)
      if (!trackVariants.includes(t.trackVariant)) trackVariants.push(t.trackVariant)
    })

    return times
  },
  async refreshTimes () {
    const filter = laptimeFilterStore.getFilter()
    const times = await this.getTimes(30, filter)
    this.setTimes(times)
  },
  async bindDb () {
    // bindFirestoreCollection(commit, 'cars', collection(db, 'cars'))
    // bindFirestoreCollection(commit, 'tracks', collection(db, 'tracks'))
    // bindFirestoreCollection(commit, 'drivers', collection(db, 'drivers'))
  }
}
