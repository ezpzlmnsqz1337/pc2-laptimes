const createTire = (name) => ({
  tyreFlags: null,
  terrain: null,
  tyreY: null,
  tyreRPS: null,
  tyreTemp: null,
  tyreHeightAboveGround: null,
  tyreWear: null,
  brakeDamage: null,
  suspensionDamage: null,
  brakeTempCelsius: null,
  tyreTreadTemp: null,
  tyreLayerTemp: null,
  tyreCarcassTemp: null,
  tyreRimTemp: null,
  tyreInternalAirTemp: null,
  tyreTempLeft: null,
  tyreTempCenter: null,
  tyreTempRight: null,
  wheelLocalPositionY: null,
  rideHeight: null,
  suspensionTravel: null,
  suspensionVelocity: null,
  suspensionRideHeight: null,
  airPressure: null,
  tyreCompound: null
})

const state = () => ({
  // header
  mPacketNumber: null,
  mCategoryPacketNumber: null,
  mPartialPacketIndex: null,
  mPartialPacketNumber: null,
  mPacketType: null,
  mPacketVersion: null,
  // 0. telemetry data
  viewedParticipantIndex: null,
  // Unfiltered input
  unfilteredThrottle: null,
  unfilteredBrake: null,
  unfilteredSteering: null,
  unfilteredClutch: null,
  // Flags
  raceStateFlags: null,
  // Data
  oilTempCelsius: null,
  oilPressureKPa: null,
  waterTempCelsius: null,
  waterPressureKPa: null,
  fuelPressureKPa: null,
  fuelCapacity: null,
  brake: null,
  throttle: null,
  clutch: null,
  fuelLevel: null,
  speed: null,
  rpm: null,
  maxRpm: null,
  steering: null,
  gearNumGears: null,
  boostAmount: null,
  crashState: null,
  // Motion and device
  odometerKM: null,
  orientationX: null,
  orientationY: null,
  orientationZ: null,
  localVelocityX: null,
  localVelocityY: null,
  localVelocityZ: null,
  worldVelocityX: null,
  worldVelocityY: null,
  worldVelocityZ: null,
  angularVelocityX: null,
  angularVelocityY: null,
  angularVelocityZ: null,
  localAccelerationX: null,
  localAccelerationY: null,
  localAccelerationZ: null,
  worldAccelerationX: null,
  worldAccelerationY: null,
  worldAccelerationZ: null,
  extentsCentreX: null,
  extentsCentreY: null,
  extentsCentreZ: null,
  // tires structure
  tires: [
    createTire('LF'),
    createTire('RF'),
    createTire('LR'),
    createTire('RR')
  ],
  // structure 2
  engineSpeed: null,
  engineTorque: null,
  wings1: null,
  wings2: null,
  handBrake: null,
  aeroDamage: null,
  engineDamage: null,
  joyPad: null,
  dPad: null,
  // UDP1
  carName: null,
  carClassName: null,
  trackLocation: null,
  trackVariation: null,
  participants: []
})

// getters
const getters = {
}

// actions
const actions = {
}

// mutations
const mutations = {
  setValueByKey (state, { key, value }) {
    if (state[key] === undefined) return
    state[key] = value
  },
  setValues (state, { data }) {
    Object.keys(data).forEach(x => {
      if (state[x] === undefined) return
      if (x === 'participants' && !data[x][0].fastestLapTime) return
      state[x] = data[x]
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
