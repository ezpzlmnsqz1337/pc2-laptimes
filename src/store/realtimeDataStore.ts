import { RaceState } from '@/constants/RaceState'

export interface Tyre {
  name: string | null
  tyreFlags: number | null
  terrain: number | null
  tyreY: number | null
  tyreRPS: number | null
  tyreTemp: number | null
  tyreHeightAboveGround: number | null
  tyreWear: number | null
  brakeDamage: number | null
  suspensionDamage: number | null
  brakeTempCelsius: number | null
  tyreTreadTemp: number | null
  tyreLayerTemp: number | null
  tyreCarcassTemp: number | null
  tyreRimTemp: number | null
  tyreInternalAirTemp: number | null
  tyreTempLeft: number | null
  tyreTempCenter: number | null
  tyreTempRight: number | null
  wheelLocalPositionY: number | null
  rideHeight: number | null
  suspensionTravel: number | null
  suspensionVelocity: number | null
  suspensionRideHeight: number | null
  airPressure: number | null
  tyreCompound: number | null
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
  mPacketNumber: number | null
  mCategoryPacketNumber: number | null
  mPartialPacketIndex: number | null
  mPartialPacketNumber: number | null
  mPacketType: number | null
  mPacketVersion: number | null
}

export interface PC2TelemetryData {
  unfilteredThrottle: number | null
  unfilteredBrake: number | null
  unfilteredSteering: number | null
  unfilteredClutch: number | null
  raceStateFlags: number | null
  oilTempCelsius: number | null
  oilPressureKPa: number | null
  waterTempCelsius: number | null
  waterPressureKPa: number | null
  fuelPressureKPa: number | null
  fuelCapacity: number | null
  brake: number | null
  throttle: number | null
  clutch: number | null
  fuelLevel: number | null
  speed: number | null
  rpm: number | null
  maxRpm: number | null
  steering: number | null
  gearNumGears: number | null
  boostAmount: number | null
  crashState: number | null
}

export interface PC2MotionData {
  odometerKM: number | null
  orientationX: number | null
  orientationY: number | null
  orientationZ: number | null
  localVelocityX: number | null
  localVelocityY: number | null
  localVelocityZ: number | null
  worldVelocityX: number | null
  worldVelocityY: number | null
  worldVelocityZ: number | null
  angularVelocityX: number | null
  angularVelocityY: number | null
  angularVelocityZ: number | null
  localAccelerationX: number | null
  localAccelerationY: number | null
  localAccelerationZ: number | null
  worldAccelerationX: number | null
  worldAccelerationY: number | null
  worldAccelerationZ: number | null
  extentsCentreX: number | null
  extentsCentreY: number | null
  extentsCentreZ: number | null
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
  carName: string | null
  carClassName: string | null
  trackLocation: string | null
  trackVariation: string | null
  participants: PC2ParticipantData[]
  raceState: RaceState | null
}

export interface PC2StructureData {
  engineSpeed: number | null
  engineTorque: number | null
  wings1: number | null
  wings2: number | null
  handBrake: number | null
  aeroDamage: number | null
  engineDamage: number | null
  joyPad: number | null
  dPad: number | null
}

export type TelemetryPacket = Record<string, unknown>

export interface RealtimeDataStore extends PC2PacketHeader, PC2TelemetryData, PC2MotionData, PC2StructureData, PC2UDPData {
  viewedParticipantIndex: number | null
  tires: Tyre[]
  setValueByKey (key: string, value: unknown): void
  setValues (data: TelemetryPacket): void
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
  setValueByKey (key: string, value: unknown) {
    const currentValue = Reflect.get(this, key)
    if (currentValue === undefined || typeof currentValue === 'function') return
    Reflect.set(this, key, value)
  },
  setValues (data: TelemetryPacket) {
    const offset = typeof data.offset === 'number' ? data.offset : 0
    const participants = data.participants

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'participants' || key === 'offset') return
      this.setValueByKey(key, value)
    })

    if (!Array.isArray(participants)) return
    participants.forEach((participant, index) => {
      if (typeof participant !== 'object' || participant === null) return
      const targetIndex = offset + index
      this.participants[targetIndex] = {
        ...this.participants[targetIndex],
        ...(participant as Partial<PC2ParticipantData>)
      } as PC2ParticipantData
    })
  }
}
