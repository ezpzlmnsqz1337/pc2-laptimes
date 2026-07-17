import RaceBuilder, { RACE_GROUP_WINDOW_MS } from '@/builders/RaceBuilder'
import { Laptime } from '@/builders/LaptimeBuilder'
import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { Game } from '@/constants/Game'
import { StartType } from '@/constants/StartType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import { describe, expect, it } from 'vitest'

function makeLaptime (overrides: Partial<Laptime> & { uid: string }): Laptime {
  return {
    carId: 'car-a',
    trackId: 'track-a',
    trackVariant: 'Variant A',
    driverId: 'driver-1',
    transmission: TransmissionType.SEQUENTIAL,
    weather: WeatherType.SUN,
    brakingLine: BrakingLine.OFF,
    controls: ControlType.STEERING_WHEEL,
    startType: StartType.RUNNING,
    laptime: '1:30.000',
    game: Game.PC2,
    date: 1000000,
    notes: '',
    ...overrides
  }
}

describe('buildRacesFromTimes', () => {
  it('returns empty array for empty input', () => {
    expect(RaceBuilder.buildRacesFromTimes([])).toEqual([])
  })

  it('returns a single race for a single laptime (solo session)', () => {
    const races = RaceBuilder.buildRacesFromTimes([
      makeLaptime({ uid: 't1' })
    ])
    expect(races).toHaveLength(1)
    expect(races[0].winnerDriverId).toBeNull()
    expect(races[0].times).toHaveLength(1)
  })

  it('groups two laps with same track+variant within 5-min window into one race', () => {
    const races = RaceBuilder.buildRacesFromTimes([
      makeLaptime({ uid: 't1', driverId: 'driver-a', laptime: '1:32.000', date: 1000000 }),
      makeLaptime({ uid: 't2', driverId: 'driver-b', laptime: '1:30.000', date: 1060000 })
    ])
    expect(races).toHaveLength(1)
    expect(races[0].times).toHaveLength(2)
    expect(races[0].winnerDriverId).toBe('driver-b')
  })

  it('splits into two races when laps exceed 5-min window even with same track', () => {
    const races = RaceBuilder.buildRacesFromTimes([
      makeLaptime({ uid: 't1', trackId: 'track-a', driverId: 'driver-a', date: 1000000 }),
      makeLaptime({ uid: 't2', trackId: 'track-a', driverId: 'driver-b', date: 1000000 + RACE_GROUP_WINDOW_MS + 1 })
    ])
    expect(races).toHaveLength(2)
    expect(races[0].times).toHaveLength(1)
    expect(races[1].times).toHaveLength(1)
  })

  it('groups at exact boundary of 5-min window', () => {
    const races = RaceBuilder.buildRacesFromTimes([
      makeLaptime({ uid: 't1', trackId: 'track-a', driverId: 'driver-a', date: 1000000 }),
      makeLaptime({ uid: 't2', trackId: 'track-a', driverId: 'driver-b', date: 1000000 + RACE_GROUP_WINDOW_MS })
    ])
    expect(races).toHaveLength(1)
  })

  it('splits when track differs', () => {
    const races = RaceBuilder.buildRacesFromTimes([
      makeLaptime({ uid: 't1', trackId: 'track-a', driverId: 'driver-a', date: 1000000 }),
      makeLaptime({ uid: 't2', trackId: 'track-b', driverId: 'driver-b', date: 1001000 })
    ])
    expect(races).toHaveLength(2)
  })

  it('splits when trackVariant differs', () => {
    const races = RaceBuilder.buildRacesFromTimes([
      makeLaptime({ uid: 't1', trackId: 'track-a', trackVariant: 'Layout 1', driverId: 'driver-a', date: 1000000 }),
      makeLaptime({ uid: 't2', trackId: 'track-a', trackVariant: 'Layout 2', driverId: 'driver-b', date: 1001000 })
    ])
    expect(races).toHaveLength(2)
  })

  it('starts a new session when same driver appears twice within 5-min window', () => {
    const races = RaceBuilder.buildRacesFromTimes([
      makeLaptime({ uid: 't1', driverId: 'driver-a', date: 1000000 }),
      makeLaptime({ uid: 't2', driverId: 'driver-b', date: 1001000 }),
      makeLaptime({ uid: 't3', driverId: 'driver-a', date: 1002000 })
    ])
    expect(races).toHaveLength(2)
    expect(races[0].times).toHaveLength(2)
    expect(races[1].times).toHaveLength(1)
  })

  it('sorts interleaved tracks into separate sessions', () => {
    const races = RaceBuilder.buildRacesFromTimes([
      makeLaptime({ uid: 't1', trackId: 'track-b', driverId: 'driver-a', date: 500000 }),
      makeLaptime({ uid: 't2', trackId: 'track-a', driverId: 'driver-b', date: 1000000 }),
      makeLaptime({ uid: 't3', trackId: 'track-b', driverId: 'driver-c', date: 550000 }),
      makeLaptime({ uid: 't4', trackId: 'track-a', driverId: 'driver-d', date: 1300000 })
    ])
    expect(races).toHaveLength(2)
    expect(races[0].trackId).toBe('track-a')
    expect(races[1].trackId).toBe('track-b')
  })

  it('determines winner correctly: fastest laptime wins', () => {
    const races = RaceBuilder.buildRacesFromTimes([
      makeLaptime({ uid: 't1', driverId: 'driver-a', laptime: '1:32.000', date: 1000000 }),
      makeLaptime({ uid: 't2', driverId: 'driver-b', laptime: '1:30.000', date: 1010000 }),
      makeLaptime({ uid: 't3', driverId: 'driver-c', laptime: '1:31.000', date: 1020000 })
    ])
    expect(races[0].winnerDriverId).toBe('driver-b')
  })

  it('handles manual entries outside window: each manual entry is its own solo session', () => {
    const races = RaceBuilder.buildRacesFromTimes([
      makeLaptime({ uid: 't1', driverId: 'driver-a', date: 1000000 }),
      makeLaptime({ uid: 't2', driverId: 'driver-b', date: 2000000 }),
      makeLaptime({ uid: 't3', driverId: 'driver-c', date: 3000000 })
    ])
    expect(races).toHaveLength(3)
  })

  it('builds unique race UIDs containing track and sorted time IDs', () => {
    const races = RaceBuilder.buildRacesFromTimes([
      makeLaptime({ uid: 'zzz', driverId: 'driver-a', date: 1000000 }),
      makeLaptime({ uid: 'aaa', driverId: 'driver-b', date: 1010000 })
    ])
    expect(races[0].uid).toContain('track-a')
    expect(races[0].uid).toContain('aaa')
    expect(races[0].uid).toContain('zzz')
  })

  it('sets correct startDate and endDate from first and last time in session', () => {
    const races = RaceBuilder.buildRacesFromTimes([
      makeLaptime({ uid: 't1', driverId: 'driver-a', date: 1000000 }),
      makeLaptime({ uid: 't2', driverId: 'driver-b', date: 1060000 })
    ])
    expect(races[0].startDate).toBe(1000000)
    expect(races[0].endDate).toBe(1060000)
  })
})
