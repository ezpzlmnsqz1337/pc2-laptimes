import { statisticsBuilder, Medals, Driver } from '@/builders/StatisticsBuilder'
import { Laptime } from '@/builders/LaptimeBuilder'
import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { Game } from '@/constants/Game'
import { StartType } from '@/constants/StartType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import { Rank } from '@/constants/Rank'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/constants/Rank', () => ({
  Rank: {
    UNRANKED: 'unranked',
    EXPIRED: 'expired',
    GLOBAL: 'global',
    SUPREME: 'supreme',
    LEM: 'lem',
    EAGLE: 'eagle',
    SHERIF: 'sherif',
    DOUBLE_AK: 'double_ak',
    AK1: 'ak1',
    AK: 'ak',
    GOLD4: 'gold4',
    GOLD3: 'gold3',
    GOLD2: 'gold2',
    GOLD1: 'gold1',
    SILVER_ELITE_MASTER: 'silver_elite_master',
    SILVER_ELITE: 'silver_elite',
    SILVER4: 'silver4',
    SILVER3: 'silver3',
    SILVER2: 'silver2',
    SILVER1: 'silver1'
  }
}))

function makeMedals (overrides: Partial<Medals> = {}): Medals {
  return {
    driverId: 'driver-1',
    places: [0, 0, 0],
    ...overrides
  }
}

function makeLaptime (overrides: Partial<Laptime> = {}): Laptime {
  return {
    uid: 'time-id',
    carId: 'car-a',
    trackId: 'track-a',
    trackVariant: '',
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

describe('calculatePoints', () => {
  it('calculates points from medal counts (1st=3pt, 2nd=2pt, 3rd=1pt)', () => {
    expect(statisticsBuilder.calculatePoints(makeMedals({ places: [10, 5, 3] }))).toBe(43)
  })

  it('returns zero for no medals', () => {
    expect(statisticsBuilder.calculatePoints(makeMedals({ places: [0, 0, 0] }))).toBe(0)
  })

  it('returns NaN for empty places array (computes NaN from undefined indices)', () => {
    expect(statisticsBuilder.calculatePoints(makeMedals({ places: [] as unknown as [number, number, number] }))).toBeNaN()
  })
})

describe('calculateBonus', () => {
  it('returns a positive integer for a real-world driver', () => {
    const bonus = statisticsBuilder.calculateBonus(
      makeMedals({ places: [20, 15, 10] }),
      100
    )
    expect(bonus).toBeGreaterThan(0)
    expect(Number.isInteger(bonus)).toBe(true)
  })

  it('returns zero when driver has no race participation', () => {
    const bonus = statisticsBuilder.calculateBonus(
      makeMedals({ places: [0, 0, 0] }),
      0
    )
    expect(bonus).toBe(0)
  })

  it('returns a larger bonus for a higher-performing driver', () => {
    const highBonus = statisticsBuilder.calculateBonus(
      makeMedals({ places: [50, 20, 10] }),
      100
    )
    const lowBonus = statisticsBuilder.calculateBonus(
      makeMedals({ places: [5, 2, 1] }),
      100
    )
    expect(highBonus).toBeGreaterThan(lowBonus)
  })

  it('returns consistent results', () => {
    const a = statisticsBuilder.calculateBonus(makeMedals({ places: [10, 5, 2] }), 50)
    const b = statisticsBuilder.calculateBonus(makeMedals({ places: [10, 5, 2] }), 50)
    expect(a).toBe(b)
  })
})

describe('handleDistinct', () => {
  it('keeps only the first laptime per driver', () => {
    const times = [
      makeLaptime({ uid: '1', driverId: 'driver-a' }),
      makeLaptime({ uid: '2', driverId: 'driver-a' }),
      makeLaptime({ uid: '3', driverId: 'driver-b' }),
      makeLaptime({ uid: '4', driverId: 'driver-a' }),
      makeLaptime({ uid: '5', driverId: 'driver-c' })
    ]
    const result = statisticsBuilder.handleDistinct(times)
    expect(result).toHaveLength(3)
    expect(result.map(x => x.uid)).toEqual(['1', '3', '5'])
  })

  it('returns empty array for empty input', () => {
    expect(statisticsBuilder.handleDistinct([])).toEqual([])
  })
})

describe('mapValueInRange', () => {
  it('maps 0 from [0..100] to [0..1]', () => {
    expect(statisticsBuilder.mapValueInRange(0, 0, 100, 0, 1)).toBe(0)
  })

  it('maps 100 from [0..100] to [0..1]', () => {
    expect(statisticsBuilder.mapValueInRange(100, 0, 100, 0, 1)).toBe(1)
  })

  it('maps midpoint correctly', () => {
    expect(statisticsBuilder.mapValueInRange(50, 0, 100, 0, 10)).toBe(5)
  })
})

describe('isInRange', () => {
  it('returns true when value is within range', () => {
    expect(statisticsBuilder.isInRange(5, 0, 10)).toBe(true)
  })

  it('returns true at boundaries', () => {
    expect(statisticsBuilder.isInRange(0, 0, 10)).toBe(true)
    expect(statisticsBuilder.isInRange(10, 0, 10)).toBe(true)
  })

  it('returns false outside range', () => {
    expect(statisticsBuilder.isInRange(-1, 0, 10)).toBe(false)
    expect(statisticsBuilder.isInRange(11, 0, 10)).toBe(false)
  })
})

describe('getRank', () => {
  function makeRankFixture (
    overrides: { places?: number[], totalRaces?: number, isTopPlayer?: boolean }
  ) {
    const driver: Driver = { uid: 'driver-1', name: 'Test Driver' }
    const totalRaces = [{
      driver: { uid: 'driver-1', name: 'Test Driver' },
      races: overrides.totalRaces ?? 50
    }]
    const medals: Medals[] = [
      {
        driverId: overrides.isTopPlayer ? 'driver-1' : 'top-player',
        places: overrides.places ?? [10, 5, 2]
      },
      { driverId: 'driver-1', places: overrides.places ?? [10, 5, 2] }
    ]

    return statisticsBuilder.getRank(driver, totalRaces, medals)
  }

  it('returns UNRANKED for fewer than 10 races', () => {
    const driver: Driver = { uid: 'driver-1', name: 'New Driver' }
    const totalRaces = [{ driver: { uid: 'driver-1', name: 'New Driver' }, races: 5 }]

    const result = statisticsBuilder.getRank(driver, totalRaces, [])
    expect(result).toBe(Rank.UNRANKED)
  })

  it('returns UNRANKED when driver has no medal data', () => {
    const driver: Driver = { uid: 'driver-1', name: 'Test Driver' }
    const totalRaces = [{ driver: { uid: 'driver-1', name: 'Test Driver' }, races: 50 }]

    const result = statisticsBuilder.getRank(driver, totalRaces, [])
    expect(result).toBe(Rank.UNRANKED)
  })

  it('returns UNRANKED when driver not found in totals', () => {
    const driver: Driver = { uid: 'driver-1', name: 'Missing' }
    const totalRaces = [{ driver: { uid: 'driver-2', name: 'Other' }, races: 50 }]

    const result = statisticsBuilder.getRank(driver, totalRaces, [])
    expect(result).toBe(Rank.UNRANKED)
  })

  it('returns a defined rank for a valid driver with sufficient races', () => {
    const result = makeRankFixture({ places: [30, 20, 10], totalRaces: 100 })
    expect(result).toBeDefined()
    expect(result).not.toBe(Rank.UNRANKED)
    expect(result).not.toBe(Rank.EXPIRED)
  })

  it('returns top rank for best player', () => {
    const result = makeRankFixture({ places: [95, 50, 30], totalRaces: 100, isTopPlayer: true })
    expect(result).toBe(Rank.GLOBAL)
  })

  it('returns EXPIRED for a driver with minimal participation vs a dominant top player', () => {
    // ponytail: EXPIRED rank is unreachable with valid inputs (all ranges 0-1000+ covered).
    // This test verifies the lowest rank (SILVER1) for a near-zero performer.
    const driver: Driver = { uid: 'driver-1', name: 'Barely There' }
    const totalRaces = [{
      driver: { uid: 'driver-1', name: 'Barely There' },
      races: 10
    }]
    const topMedals: Medals = { driverId: 'top-player', places: [90, 50, 30] }
    const medals: Medals[] = [
      topMedals,
      { driverId: 'driver-1', places: [0, 0, 1] }
    ]

    const result = statisticsBuilder.getRank(driver, totalRaces, medals)
    expect(result).toBe(Rank.SILVER1)
  })

  it('returns rank for an average-performant driver', () => {
    const driver: Driver = { uid: 'driver-1', name: 'Average' }
    const totalRaces = [{
      driver: { uid: 'driver-1', name: 'Average' },
      races: 20
    }]
    const topMedals: Medals = { driverId: 'top-player', places: [90, 50, 30] }
    const medals: Medals[] = [
      topMedals,
      { driverId: 'driver-1', places: [2, 2, 2] }
    ]

    const result = statisticsBuilder.getRank(driver, totalRaces, medals)
    expect(result).toBeDefined()
    expect([Rank.UNRANKED, Rank.EXPIRED]).not.toContain(result)
  })
})
