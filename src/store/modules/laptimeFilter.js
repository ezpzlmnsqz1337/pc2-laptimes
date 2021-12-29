const state = () => ({
  carId: null,
  trackId: null,
  trackVariant: null,
  driverId: null,
  transmission: null,
  weather: null,
  brakingLine: null,
  controls: null
})

// getters
const getters = {
}

// actions
const actions = {
}

// mutations
const mutations = {
  reset (state) {
  },
  setFilter (state, { carId, trackId, trackVariant, driverId, transmission, weather, brakingLine, controls }) {
    if (carId !== undefined) state.carId = carId
    if (trackId !== undefined) state.trackId = trackId
    if (trackVariant !== undefined) state.trackVariant = trackVariant
    if (driverId !== undefined) state.driverId = driverId
    if (transmission !== undefined) state.transmission = transmission
    if (weather !== undefined) state.weather = weather
    if (brakingLine !== undefined) state.brakingLine = brakingLine
    if (controls !== undefined) state.controls = controls
  },
  clearFilter (state) {
    state.carId = null
    state.trackId = null
    state.trackVariant = null
    state.driverId = null
    state.transmission = null
    state.weather = null
    state.brakingLine = null
    state.controls = null
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}