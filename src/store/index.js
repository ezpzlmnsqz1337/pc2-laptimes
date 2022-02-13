import { createStore } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/firebase'
import { enableIndexedDbPersistence, collection, doc, getDocs, limit, orderBy, query, setDoc, where, updateDoc, arrayUnion } from 'firebase/firestore'
import { bindFirestoreCollection, vuexMutations } from '@/vuex-firestore-binding'
import ScreenType from '@/constants/ScreenType'
import laptimeFilter from '@/store/modules/laptimeFilter'
import realtimeData from '@/store/modules/realtimeData'
import Distinct from '@/constants/Distinct'
import LaptimeBuilder from '@/builders/LaptimeBuilder'
import WebsocketState from '@/constants/WebsocketState'

const debug = process.env.NODE_ENV !== 'production'

enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Unable to activate local persistance, failed-precondition')
    } else if (err.code === 'unimplemented') {
      console.log('Unable to activate local persistance, unidentified browser')
    }
  })

export default createStore({
  modules: {
    laptimeFilter,
    realtimeData
  },
  state: {
    websocketState: WebsocketState.CLOSED_OR_COULD_NOT_OPEN,
    activeScreen: ScreenType.LAPTIME_BOARD,
    cars: [],
    times: [],
    tracks: [],
    drivers: [],
    lastAddedLaptime: null
  },
  getters: {
    getCarById: (state) => (id) => {
      return state.cars.find(x => x.uid === id)
    },
    getCarByGameId: (state) => (id) => {
      return state.cars.find(x => x.gameId === id)
    },
    getTrackByGameId: (state) => (id) => {
      return state.tracks.find(x => x.gameId === id)
    },
    getTrackById: (state) => (id) => {
      return state.tracks.find(x => x.uid === id)
    },
    getTrackVariants: (state) => (trackId) => {
      if (!trackId) return []
      return state.tracks.find(x => x.uid === trackId).variants
    },
    getTimeById: (state) => (id) => {
      return state.times.find(x => x.uid === id)
    },
    getDriverById: (state) => (id) => {
      return state.drivers.find(x => x.uid === id)
    }
  },
  mutations: {
    setTimes (state, times) {
      if (!times) return
      state.times.splice(0)
      state.times.push(...times)
    },
    showScreen (state, { screen }) {
      state.activeScreen = screen
    },
    setLastAddedLaptime (state, { laptime }) {
      state.lastAddedLaptime = laptime
    },
    setWebsocketState (state, websocketState) {
      if (state.websocketState === websocketState) return
      state.websocketState = websocketState
    },
    ...vuexMutations
  },
  actions: {
    async addNewCar ({ commit }, { name }) {
      const car = { uid: uuidv4(), name }
      const docRef = doc(db, 'cars', car.uid)
      await setDoc(docRef, car)
    },
    async addNewTrack ({ commit }, { track }) {
      const t = { uid: uuidv4(), track, variants: [] }
      const docRef = doc(db, 'tracks', t.uid)
      await setDoc(docRef, t)
    },
    async addNewTrackVariant ({ commit }, { trackId, variant }) {
      const docRef = doc(db, 'tracks', trackId)
      await updateDoc(docRef, { variants: arrayUnion(variant) })
    },
    async addNewDriver ({ commit }, { name }) {
      const driver = { uid: uuidv4(), name }
      const docRef = doc(db, 'drivers', driver.uid)
      await setDoc(docRef, driver)
    },
    async addLaptime ({ commit }, { carId, trackId, trackVariant, driverId, laptime, transmission, weather, brakingLine, controls, startType, date, notes }) {
      const time = { uid: uuidv4(), carId, trackId, trackVariant, driverId, laptime, transmission, weather, brakingLine, controls, startType, date, notes }
      const docRef = doc(db, 'times', time.uid)
      commit('setLastAddedLaptime', { laptime: time })
      await setDoc(docRef, time)
    },
    async linkCarToGameId ({ commit }, { carId, gameId }) {
      if (!carId || !gameId) return
      const docRef = doc(db, 'cars', carId)
      console.log('Link: ', carId, docRef)
      await updateDoc(docRef, { gameId })
    },
    async linkTrackToGameId ({ commit }, { trackId, gameId }) {
      if (!trackId || !gameId) return
      const docRef = doc(db, 'tracks', trackId)
      console.log('Link: ', trackId, docRef)
      await updateDoc(docRef, { gameId })
    },
    async setCarImage ({ commit }, { carId, imageUrl }) {
      if (!carId || !imageUrl) return
      const docRef = doc(db, 'cars', carId)
      await updateDoc(docRef, { imageUrl })
    },
    async updateLaptime ({ commit }, laptime) {
      if (!laptime.uid) return
      const docRef = doc(db, 'times', laptime.uid)
      console.log('Laptime: ', laptime, docRef)
      await setDoc(docRef, laptime, { merge: true })
    },
    async getTimesForDriver ({ commit }, { driverId }) {
      if (!driverId) return
      const q = query(collection(db, 'times'), where('driverId', '==', driverId))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(x => x.data())
    },
    async getTimes ({ commit, dispatch }, { carId, trackId, trackVariant, driverId, transmission, weather, brakingLine, controls, startType, date, distinct, queryLimit = 30 }) {
      distinct = distinct === Distinct.YES
      const constraints = []

      if (carId) constraints.push(where('carId', '==', carId))
      if (trackId) constraints.push(where('trackId', '==', trackId))
      if (trackVariant) constraints.push(where('trackVariant', '==', trackVariant))
      if (driverId) constraints.push(where('driverId', '==', driverId))
      if (transmission) constraints.push(where('transmission', '==', transmission))
      if (weather) constraints.push(where('weather', '==', weather))
      if (brakingLine) constraints.push(where('brakingLine', '==', brakingLine))
      if (controls) constraints.push(where('controls', '==', controls))
      if (startType) constraints.push(where('startType', '==', startType))
      if (date) constraints.push(where('date', '==', date))
      constraints.push(orderBy('laptime'))
      if (queryLimit > 0) constraints.push(limit(queryLimit))

      const q = query(collection(db, 'times'), ...constraints)
      const querySnapshot = await getDocs(q)
      const times = distinct ? await dispatch('getDistinctTimes', querySnapshot.docs) : querySnapshot.docs.map(x => x.data())

      const ltb = LaptimeBuilder.getInstance()
      return times.sort((a, b) => ltb.compareLaptimes(a.laptime, b.laptime))
    },
    async getTracksTimes ({ dispatch }, { tracks }) {
      const result = {}
      tracks.forEach(async x => {
        const q = query(collection(db, 'times'), where('trackId', '==', x.uid), orderBy('laptime'))
        const querySnapshot = await getDocs(q)
        result[x.uid] = await dispatch('getDistinctTimes', querySnapshot.docs)
      })
      return result
    },
    async getDistinctTimes ({ commit }, docs) {
      const times = []
      const drivers = []
      const cars = []
      const tracks = []
      const trackVariants = []
      docs.forEach(doc => {
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
    async refreshTimes ({ commit, dispatch, rootGetters }) {
      const filter = rootGetters['laptimeFilter/getFilter']()
      const times = await dispatch('getTimes', filter)
      commit('setTimes', times)
    },
    async bindDb ({ commit }) {
      bindFirestoreCollection(commit, 'cars', collection(db, 'cars'))
      bindFirestoreCollection(commit, 'tracks', collection(db, 'tracks'))
      bindFirestoreCollection(commit, 'drivers', collection(db, 'drivers'))
    }
  },
  strict: debug,
  plugins: debug ? [] : []
})
