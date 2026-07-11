import { Laptime } from '@/builders/LaptimeBuilder'
import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { Game } from '@/constants/Game'
import { StartType } from '@/constants/StartType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import RaceStatisticsBuilder, { RaceStatsLike } from '@/builders/RaceStatisticsBuilder'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/constants/Rank', () => ({
  Rank: {
    UNRANKED: 'unranked'
  }
}))

const drivers = [
  { uid: 'driver-1', name: 'Driver One' },
  { uid: 'driver-2', name: 'Driver Two' },
  { uid: 'driver-3', name: 'Driver Three' }
]

const tracks: Record<string, string> = {
  'track-a': 'Track A',
  'track-b': 'Track B'
}

const cars = {
  'car-a': { name: 'Car A', imageUrl: 'car-a.png' },
  'car-b': { name: 'Car B', imageUrl: 'car-b.png' }
}

function createLaptime (overrides: Partial<Laptime> = {}): Laptime {
  return {
    uid: 'time-id',
    carId: 'car-a',
    trackId: 'track-a',
    trackVariant: 'Grand Prix Circuit',
    driverId: 'driver-1',
    transmission: TransmissionType.SEQUENTIAL,
    weather: WeatherType.SUN,
    brakingLine: BrakingLine.OFF,
    controls: ControlType.STEERING_WHEEL,
    startType: StartType.RUNNING,
    laptime: '1:30.000',
    game: Game.PC2,
    date: Date.UTC(2025, 0, 15, 12),
    notes: '',
    ...overrides
  }
}

function createRace (
  trackId: string,
  winnerDriverId: string | null,
  times: Laptime[]
): RaceStatsLike {
  return {
    trackId,
    trackVariant: 'Grand Prix Circuit',
    winnerDriverId,
    times
  }
}

function buildTotals (races: RaceStatsLike[]) {
  return RaceStatisticsBuilder.buildDriverRaceTotals({
    races,
    resolveDriver: (driverId) => drivers.find(driver => driver.uid === driverId),
    resolveTrackName: (trackId) => tracks[trackId] || 'Unknown',
    resolveCar: (carId) => cars[carId as keyof typeof cars],
    compareLaptimes: (left, right) => left.localeCompare(right)
  })
}

describe('buildDriverRaceTotals', () => {
  it('builds win totals, favorite track and car, and yearly head-to-head records', () => {
    const totals = buildTotals([
      createRace('track-a', 'driver-1', [
        createLaptime({ uid: 'race-1-driver-1', driverId: 'driver-1', laptime: '1:30.000', date: Date.UTC(2025, 0, 15) }),
        createLaptime({ uid: 'race-1-driver-2', driverId: 'driver-2', laptime: '1:31.000', date: Date.UTC(2025, 0, 15) })
      ]),
      createRace('track-a', 'driver-2', [
        createLaptime({ uid: 'race-2-driver-1', driverId: 'driver-1', laptime: '1:31.000', date: Date.UTC(2024, 0, 15) }),
        createLaptime({ uid: 'race-2-driver-2', driverId: 'driver-2', laptime: '1:30.000', date: Date.UTC(2024, 0, 15) })
      ]),
      createRace('track-b', 'driver-1', [
        createLaptime({ uid: 'race-3-driver-1', carId: 'car-b', driverId: 'driver-1', laptime: '1:29.000' }),
        createLaptime({ uid: 'race-3-driver-3', driverId: 'driver-3', laptime: '1:35.000' })
      ]),
      createRace('track-a', 'driver-1', [
        createLaptime({ uid: 'race-4-driver-1', driverId: 'driver-1', laptime: '1:30.000' }),
        createLaptime({ uid: 'race-4-driver-3', driverId: 'driver-3', laptime: '1:33.000' })
      ])
    ])

    const driverOne = totals.find(total => total.driverId === 'driver-1')
    expect(driverOne).toMatchObject({
      driverName: 'Driver One',
      totalRaces: 4,
      wonRaces: 3,
      winRateLabel: '75.0%',
      mostWonTrackLabel: 'Track A (2)',
      mostWonCarLabel: 'Car A (2)',
      mostWonCarImage: 'images/car-a.png',
      topWonTracks: [
        { id: 'track-a', label: 'Track A', count: 2 },
        { id: 'track-b', label: 'Track B', count: 1 }
      ],
      topWonCars: [
        { id: 'car-a', label: 'Car A', count: 2, imageUrl: 'images/car-a.png' },
        { id: 'car-b', label: 'Car B', count: 1, imageUrl: 'images/car-b.png' }
      ]
    })
    expect(driverOne?.headToHead).toEqual(expect.arrayContaining([
      {
        opponentId: 'driver-2',
        opponentName: 'Driver Two',
        wins: 1,
        losses: 1,
        yearlyRecords: [
          { year: 2025, wins: 1, losses: 0 },
          { year: 2024, wins: 0, losses: 1 }
        ]
      },
      {
        opponentId: 'driver-3',
        opponentName: 'Driver Three',
        wins: 2,
        losses: 0,
        yearlyRecords: [{ year: 2025, wins: 2, losses: 0 }]
      }
    ]))
  })

  it('keeps solo sessions in race totals but excludes them from winner-based details', () => {
    const totals = buildTotals([
      createRace('track-a', null, [createLaptime({ driverId: 'driver-1' })])
    ])

    expect(totals).toEqual([expect.objectContaining({
      driverId: 'driver-1',
      totalRaces: 1,
      wonRaces: 0,
      winRateLabel: '0.0%',
      mostWonTrackLabel: '-',
      mostWonCarLabel: '-',
      mostWonCarImage: '',
      topWonTracks: [],
      topWonCars: [],
      headToHead: []
    })])
  })
})
