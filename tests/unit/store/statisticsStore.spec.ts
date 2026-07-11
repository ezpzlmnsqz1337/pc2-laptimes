import { Laptime } from '@/builders/LaptimeBuilder'
import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { Distinct } from '@/constants/Distinct'
import { Game } from '@/constants/Game'
import { StartType } from '@/constants/StartType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import { dataStore } from '@/store/dataStore'
import { statisticsStore } from '@/store/statisticsStore'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/constants/Rank', () => ({
  Rank: {
    UNRANKED: 'unranked'
  }
}))

function createLaptime (overrides: Partial<Laptime> = {}): Laptime {
  return {
    uid: 'time-id',
    carId: 'car-id',
    trackId: 'track-id',
    trackVariant: 'Grand Prix Circuit',
    driverId: 'driver-1',
    transmission: TransmissionType.SEQUENTIAL,
    weather: WeatherType.SUN,
    brakingLine: BrakingLine.OFF,
    controls: ControlType.STEERING_WHEEL,
    startType: StartType.RUNNING,
    laptime: '1:31.234',
    game: Game.PC2,
    date: Date.UTC(2025, 0, 15, 12),
    notes: '',
    ...overrides
  }
}

describe('statisticsStore', () => {
  beforeEach(() => {
    dataStore.drivers = [
      { uid: 'driver-1', name: 'Driver One' },
      { uid: 'driver-2', name: 'Driver Two' }
    ]
    statisticsStore.resetState()
    statisticsStore.clearFilter()
  })

  it('builds sorted distinct leaderboards, medals, and race totals', () => {
    statisticsStore.refreshData([
      createLaptime({ uid: 'time-1', driverId: 'driver-1', laptime: '1:32.000', weather: WeatherType.SUN }),
      createLaptime({ uid: 'time-2', driverId: 'driver-2', laptime: '1:30.000', weather: WeatherType.SUN }),
      createLaptime({ uid: 'time-3', driverId: 'driver-1', laptime: '1:29.000', weather: WeatherType.RAIN })
    ])

    const leaderboard = statisticsStore.leaderboardsData['track-id']['Grand Prix Circuit']['car-id']
    expect(leaderboard.map(x => x.uid)).toEqual(['time-3', 'time-2'])
    expect(statisticsStore.totalRaces).toMatchObject([
      { driver: { uid: 'driver-1' }, races: 2 },
      { driver: { uid: 'driver-2' }, races: 1 }
    ])
    expect(statisticsStore.medals).toEqual(expect.arrayContaining([
      { driverId: 'driver-1', places: [1, 0, 0, 0, 0, 0, 0] },
      { driverId: 'driver-2', places: [1, 0, 0, 0, 0, 0, 0] }
    ]))
  })

  it('keeps a leaderboard only when the selected driver has the requested position', () => {
    statisticsStore.setFilter({ driverId: 'driver-2', position: 2, distinct: Distinct.YES })
    statisticsStore.refreshData([
      createLaptime({ uid: 'time-1', driverId: 'driver-1', laptime: '1:29.000' }),
      createLaptime({ uid: 'time-2', driverId: 'driver-2', laptime: '1:30.000' })
    ])

    expect(statisticsStore.leaderboardsData['track-id']['Grand Prix Circuit']['car-id']).toHaveLength(2)

    statisticsStore.setFilter({ driverId: 'driver-2', position: 1, distinct: Distinct.YES })
    statisticsStore.refreshData([
      createLaptime({ uid: 'time-1', driverId: 'driver-1', laptime: '1:29.000' }),
      createLaptime({ uid: 'time-2', driverId: 'driver-2', laptime: '1:30.000' })
    ])

    expect(statisticsStore.leaderboardsData).toEqual({})
  })
})
