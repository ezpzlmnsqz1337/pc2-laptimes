import { createStore } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/firebase'
import { enableIndexedDbPersistence, collection, doc, getDocs, limit, orderBy, query, setDoc, where } from 'firebase/firestore'
import { bindFirestoreCollection, vuexMutations } from '@/vuex-firestore-binding'
import ScreenType from '@/constants/ScreenType'
import laptimeFilter from '@/store/modules/laptimeFilter'
import realtimeData from '@/store/modules/realtimeData'
import Distinct from '@/constants/Distinct'

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
    activeScreen: ScreenType.LAPTIME_BOARD,
    cars: [],
    times: [],
    tracks: [],
    drivers: []
  },
  getters: {
    getCarById: (state) => (id) => {
      return state.cars.find(x => x.uid === id)
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
    reset (state) {
    },
    setTimes (state, times) {
      if (!times) return
      state.times.splice(0)
      state.times.push(...times)
    },
    showScreen (state, { screen }) {
      state.activeScreen = screen
    },
    ...vuexMutations
  },
  actions: {
    async addNewCar ({ commit }, { name }) {
      const car = { uid: uuidv4(), name }
      const docRef = doc(db, 'cars', car.uid)
      await setDoc(docRef, car)
    },
    async addNewDriver ({ commit }, { name }) {
      const driver = { uid: uuidv4(), name }
      const docRef = doc(db, 'drivers', driver.uid)
      await setDoc(docRef, driver)
    },
    async addLaptime ({ commit }, { carId, trackId, trackVariant, driverId, laptime, transmission, weather, brakingLine, controls, startType, date, notes }) {
      const time = { uid: uuidv4(), carId, trackId, trackVariant, driverId, laptime, transmission, weather, brakingLine, controls, startType, date, notes }
      const docRef = doc(db, 'times', time.uid)
      await setDoc(docRef, time)
    },
    async updateLaptime ({ commit }, laptime) {
      if (!laptime.uid) return
      const docRef = doc(db, 'times', laptime.uid)
      console.log('Laptime: ', laptime, docRef)
      await setDoc(docRef, laptime, { merge: true })
    },
    async getTimes ({ commit, dispatch }, { carId, trackId, trackVariant, driverId, transmission, weather, brakingLine, controls, startType, date, distinct }) {
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
      constraints.push(limit(30))

      const q = query(collection(db, 'times'), ...constraints)
      const querySnapshot = await getDocs(q)
      const times = distinct ? await dispatch('getDistinctTimes', querySnapshot.docs) : querySnapshot.docs.map(x => x.data())

      return times
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
    async bindDb ({ commit }) {
      commit('reset')
      bindFirestoreCollection(commit, 'cars', collection(db, 'cars'))
      bindFirestoreCollection(commit, 'tracks', collection(db, 'tracks'))
      bindFirestoreCollection(commit, 'drivers', collection(db, 'drivers'))
    }
  },
  strict: debug,
  plugins: debug ? [] : []
})
