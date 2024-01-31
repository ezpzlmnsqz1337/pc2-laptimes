export interface Tyre {
  name: string | null
  tyreFlags: any | null,
  terrain: any | null,
  tyreY: any | null,
  tyreRPS: any | null,
  tyreTemp: any | null,
  tyreHeightAboveGround: any | null,
  tyreWear: any | null,
  brakeDamage: any | null,
  suspensionDamage: any | null,
  brakeTempCelsius: any | null,
  tyreTreadTemp: any | null,
  tyreLayerTemp: any | null,
  tyreCarcassTemp: any | null,
  tyreRimTemp: any | null,
  tyreInternalAirTemp: any | null,
  tyreTempLeft: any | null,
  tyreTempCenter: any | null,
  tyreTempRight: any | null,
  wheelLocalPositionY: any | null,
  rideHeight: any | null,
  suspensionTravel: any | null,
  suspensionVelocity: any | null,
  suspensionRideHeight: any | null,
  airPressure: any | null,
  tyreCompound: any | null
}

function createTire (name: string): Tyre {
  return {
    name,
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
  }
}

export interface PC2PacketHeader {
  mPacketNumber: any | null
  mCategoryPacketNumber: any | null
  mPartialPacketIndex: any | null
  mPartialPacketNumber: any | null
  mPacketType: any | null
  mPacketVersion: any | null
}

export interface PC2TelemetryData {
  unfilteredThrottle: any | null
  unfilteredBrake: any | null
  unfilteredSteering: any | null
  unfilteredClutch: any | null
  raceStateFlags: any | null
  oilTempCelsius: any | null
  oilPressureKPa: any | null
  waterTempCelsius: any | null
  waterPressureKPa: any | null
  fuelPressureKPa: any | null
  fuelCapacity: any | null
  brake: any | null
  throttle: any | null
  clutch: any | null
  fuelLevel: any | null
  speed: any | null
  rpm: any | null
  maxRpm: any | null
  steering: any | null
  gearNumGears: any | null
  boostAmount: any | null
  crashState: any | null
}

export interface PC2MotionData {
   odometerKM: any | null
   orientationX: any | null
   orientationY: any | null
   orientationZ: any | null
   localVelocityX: any | null
   localVelocityY: any | null
   localVelocityZ: any | null
   worldVelocityX: any | null
   worldVelocityY: any | null
   worldVelocityZ: any | null
   angularVelocityX: any | null
   angularVelocityY: any | null
   angularVelocityZ: any | null
   localAccelerationX: any | null
   localAccelerationY: any | null
   localAccelerationZ: any | null
   worldAccelerationX: any | null
   worldAccelerationY: any | null
   worldAccelerationZ: any | null
   extentsCentreX: any | null
   extentsCentreY: any | null
   extentsCentreZ: any | null
}

export interface PC2ParticipantData {
  name: string
  fastestLapTime: number
  classSameAsPlayer: boolean
  currentLap: number
  currentLapDistance: number
  isActive: 1 | 0
  lapInvalidated: number
  lapsCompleted: number
  lastSectorTime: number
  racePosition: number
  sector: number
  worldPositionX: number
  worldPositionY: number
  worldPositionZ: number
}

export interface PC2UDPData {
  carName: any | null
  carClassName: any | null
  trackLocation: any | null
  trackVariation: any | null
  participants: PC2ParticipantData[]
  raceState: any | null
}

export interface PC2StructureData {
  engineSpeed: any | null
  engineTorque: any | null
  wings1: any | null
  wings2: any | null
  handBrake: any | null
  aeroDamage: any | null
  engineDamage: any | null
  joyPad: any | null
  dPad: any | null
}

export interface RealtimeDataStore extends PC2PacketHeader, PC2TelemetryData, PC2MotionData, PC2StructureData, PC2UDPData{
  viewedParticipantIndex: null
  tires: Tyre[]
  setValueByKey (key: string, value: any): void
  setValues (data: any): void
}

export const realtimeDataStore: RealtimeDataStore = {
  mPacketNumber: null,
  mCategoryPacketNumber: null,
  mPartialPacketIndex: null,
  mPartialPacketNumber: null,
  mPacketType: null,
  mPacketVersion: null,
  viewedParticipantIndex: null,
  unfilteredThrottle: null,
  unfilteredBrake: null,
  unfilteredSteering: null,
  unfilteredClutch: null,
  raceStateFlags: null,
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
  tires: [
    createTire('LF'),
    createTire('RF'),
    createTire('LR'),
    createTire('RR')
  ],
  engineSpeed: null,
  engineTorque: null,
  wings1: null,
  wings2: null,
  handBrake: null,
  aeroDamage: null,
  engineDamage: null,
  joyPad: null,
  dPad: null,
  carName: null,
  carClassName: null,
  trackLocation: null,
  trackVariation: null,
  participants: [],
  raceState: null,
  setValueByKey (key: string, value: any) {
    if ((this as any)[key] === undefined) return
    (this as any)[key] = value
  },
  setValues (data: any) {
    Object.keys(data).forEach(x => {
      // console.log(x)
      if ((this as any)[x] === undefined) return
      if (x === 'participants') {
        const offset = data.offset || 0 // participants are split into two packets of 16
        data[x].forEach((p: PC2ParticipantData, index: number) =>
          (this.participants[offset + index] = this.participants[offset + index] ? { ...this.participants[offset + index], ...p } : { ...p })
        )
        return
      }
      (this as any)[x] = data[x]
    })
  }
}
