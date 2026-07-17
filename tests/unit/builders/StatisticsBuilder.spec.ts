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
  it('returns UNRANKED when driver not found in totals', () => {
    const driver: Driver = { uid: 'driver-1', name: 'Missing' }
    const totalRaces = [{ driver: { uid: 'driver-2', name: 'Other' }, races: 50 }]

    const result = statisticsBuilder.getRank(driver, totalRaces, [])
    expect(result).toBe(Rank.UNRANKED)
  })

  it('returns UNRANKED for driver with 0 races', () => {
    const driver: Driver = { uid: 'driver-1', name: 'Inactive' }
    const totalRaces = [{ driver: { uid: 'driver-1', name: 'Inactive' }, races: 0 }]

    const result = statisticsBuilder.getRank(driver, totalRaces, [])
    expect(result).toBe(Rank.UNRANKED)
  })

  it('returns GLOBAL for 500+ races with 70%+ win rate', () => {
    const driver: Driver = { uid: 'top', name: 'Top' }
    const totalRaces = [{ driver: { uid: 'top', name: 'Top' }, races: 548 }]
    const medals: Medals[] = [{ driverId: 'top', places: [394, 100, 50] }]

    const result = statisticsBuilder.getRank(driver, totalRaces, medals)
    expect(result).toBe(Rank.GLOBAL)
  })

  it('returns SUPREME for 300+ races with 65%+ win rate', () => {
    const driver: Driver = { uid: 'sup', name: 'Sup' }
    const totalRaces = [{ driver: { uid: 'sup', name: 'Sup' }, races: 341 }]
    const medals: Medals[] = [{ driverId: 'sup', places: [222, 80, 30] }]

    const result = statisticsBuilder.getRank(driver, totalRaces, medals)
    expect(result).toBe(Rank.SUPREME)
  })

  it('returns SILVER3 for a driver with 10 races and 0 wins', () => {
    const driver: Driver = { uid: 'flama', name: 'flama' }
    const totalRaces = [{ driver: { uid: 'flama', name: 'flama' }, races: 10 }]
    const medals: Medals[] = [{ driverId: 'flama', places: [0, 5, 5] }]

    const result = statisticsBuilder.getRank(driver, totalRaces, medals)
    expect(result).toBe(Rank.SILVER3)
  })

  it('returns SILVER1 for a driver with 1 race', () => {
    const driver: Driver = { uid: 'new', name: 'New' }
    const totalRaces = [{ driver: { uid: 'new', name: 'New' }, races: 1 }]
    const medals: Medals[] = [{ driverId: 'new', places: [0, 0, 0] }]

    const result = statisticsBuilder.getRank(driver, totalRaces, medals)
    expect(result).toBe(Rank.SILVER1)
  })
})

describe('getRaceRank', () => {
  it('returns UNRANKED for 0 races', () => {
    expect(statisticsBuilder.getRaceRank(0, 0)).toBe(Rank.UNRANKED)
  })

  it('returns GLOBAL for 500 races at 70%', () => {
    expect(statisticsBuilder.getRaceRank(500, 350)).toBe(Rank.GLOBAL)
  })

  it('returns SUPREME for 300 races at 65%', () => {
    expect(statisticsBuilder.getRaceRank(300, 195)).toBe(Rank.SUPREME)
  })

  it('returns LEM for 200 races at 60%', () => {
    expect(statisticsBuilder.getRaceRank(200, 120)).toBe(Rank.LEM)
  })

  it('returns EAGLE for 100 races at 55%', () => {
    expect(statisticsBuilder.getRaceRank(100, 55)).toBe(Rank.EAGLE)
  })

  it('returns SHERIF for 75 races at 50%', () => {
    expect(statisticsBuilder.getRaceRank(75, 38)).toBe(Rank.SHERIF)
  })

  it('returns AK for 20 races at 35%', () => {
    expect(statisticsBuilder.getRaceRank(20, 7)).toBe(Rank.AK)
  })

  it('returns SILVER3 for 3 races with 0 wins', () => {
    expect(statisticsBuilder.getRaceRank(3, 0)).toBe(Rank.SILVER3)
  })

  it('falls back to SILVER1 for 1 race with 0 wins', () => {
    expect(statisticsBuilder.getRaceRank(1, 0)).toBe(Rank.SILVER1)
  })
})
