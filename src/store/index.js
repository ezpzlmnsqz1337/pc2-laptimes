import { createLogger, createStore } from 'vuex'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/firebase'
import { collection, doc, setDoc } from 'firebase/firestore'
import { bindFirestoreCollection, vuexMutations } from '@/vuex-firestore-binding'

const debug = process.env.NODE_ENV !== 'production'

export default createStore({
  state: {
    cars: [],
    tracks: [],
    times: [],
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
    },
    getTimes: (state) => ({ carId, trackId, trackVariant, driverId, transmission, weather, brakingLine, date }) => {
      let result = [...state.times]
      if (carId) result = result.filter(x => x.carId === carId)
      if (trackId) result = result.filter(x => x.trackId === trackId)
      if (trackVariant) result = result.filter(x => x.trackVariant === trackVariant)
      if (driverId) result = result.filter(x => x.driverId === driverId)
      if (transmission) result = result.filter(x => x.transmission === transmission)
      if (weather) result = result.filter(x => x.weather === weather)
      if (brakingLine) result = result.filter(x => x.brakingLine === brakingLine)
      if (date) result = result.filter(x => x.date === date)
      console.log(result)
      return result.sort((a, b) => a.laptime > b.laptime ? 1 : -1)
    }
  },
  mutations: {
    reset (state) {
    },
    ...vuexMutations
  },
  actions: {
    async addNewDriver ({ commit }, { name }) {
      const driver = { uid: uuidv4(), name }
      const docRef = doc(db, 'drivers', driver.uid)
      await setDoc(docRef, driver)
    },
    async addLaptime ({ commit }, { carId, trackId, trackVariant, driverId, laptime, transmission, weather, brakingLine, date }) {
      const time = { uid: uuidv4(), carId, trackId, trackVariant, driverId, laptime, transmission, weather, brakingLine, date }
      const docRef = doc(db, 'times', time.uid)
      await setDoc(docRef, time)
    },
    bindDb ({ commit }) {
      commit('reset')
      bindFirestoreCollection(commit, 'cars', collection(db, 'cars'))
      bindFirestoreCollection(commit, 'tracks', collection(db, 'tracks'))
      bindFirestoreCollection(commit, 'times', collection(db, 'times'))
      bindFirestoreCollection(commit, 'drivers', collection(db, 'drivers'))
    }
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
