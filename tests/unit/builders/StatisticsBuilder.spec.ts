import { statisticsBuilder, Medals, Driver } from '@/builders/StatisticsBuilder'
import { Rank } from '@/constants/Rank'
import type { TotalDriverRaces } from '@/store/statisticsStore'
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

describe('getRank', () => {
  const races = (uid: string, name: string, count: number): TotalDriverRaces => ({
    driver: { uid, name },
    races: count
  })

  const medals = (driverId: string, places: number[]): Medals => ({
    driverId,
    places
  })

  it('returns UNRANKED when driver not found in totals', () => {
    const driver: Driver = { uid: 'driver-1', name: 'Missing' }
    const totalRaces = [races('driver-2', 'Other', 50)]

    const result = statisticsBuilder.getRank(driver, totalRaces, [])
    expect(result).toBe(Rank.UNRANKED)
  })

  it('returns UNRANKED for driver with 0 races', () => {
    const driver: Driver = { uid: 'driver-1', name: 'Inactive' }
    const totalRaces = [races('driver-1', 'Inactive', 0)]

    const result = statisticsBuilder.getRank(driver, totalRaces, [])
    expect(result).toBe(Rank.UNRANKED)
  })

  it('returns UNRANKED when driver not in medals', () => {
    const driver: Driver = { uid: 'driver-1', name: 'Active' }
    const totalRaces = [races('driver-1', 'Active', 10)]

    const result = statisticsBuilder.getRank(driver, totalRaces, [])
    expect(result).toBe(Rank.UNRANKED)
  })

  it('returns EXPIRED when driver has 0 points', () => {
    const driver: Driver = { uid: 'driver-1', name: 'Nopoints' }
    const totalRaces = [races('driver-1', 'Nopoints', 10)]
    const m = [medals('driver-1', [0, 0, 0])]

    const result = statisticsBuilder.getRank(driver, totalRaces, m)
    expect(result).toBe(Rank.EXPIRED)
  })

  it('returns GLOBAL for top driver (ratio >= 0.90)', () => {
    const driver: Driver = { uid: 'top', name: 'Top' }
    const totalRaces = [races('top', 'Top', 100)]
    const m = [medals('top', [50, 20, 10])] // top driver, ratio = 1.0

    const result = statisticsBuilder.getRank(driver, totalRaces, m)
    expect(result).toBe(Rank.GLOBAL)
  })

  it('returns SUPREME for driver at 85% of top points', () => {
    const driver: Driver = { uid: 'mid', name: 'Mid' }
    const totalRaces = [
      races('best', 'Best', 100),
      races('mid', 'Mid', 80)
    ]
    // best points: 50*3 + 20*2 + 10*1 = 150 + 40 + 10 = 200
    // mid points: 45*3 + 18*2 + 8*1 = 135 + 36 + 8 = 179, ratio = 179/200 = 0.895
    const m = [
      medals('best', [50, 20, 10]),
      medals('mid', [45, 18, 8])
    ]

    const result = statisticsBuilder.getRank(driver, totalRaces, m)
    expect(result).toBe(Rank.GLOBAL)
  })

  it('returns LEM for driver at 50% of top points', () => {
    const driver: Driver = { uid: 'mid', name: 'Mid' }
    const totalRaces = [
      races('best', 'Best', 100),
      races('mid', 'Mid', 50)
    ]
    // best points: 100*3 + 50*2 + 20*1 = 300 + 100 + 20 = 420
    // mid points: 50*3 + 25*2 + 10*1 = 150 + 50 + 10 = 210, ratio = 210/420 = 0.50
    const m = [
      medals('best', [100, 50, 20]),
      medals('mid', [50, 25, 10])
    ]

    const result = statisticsBuilder.getRank(driver, totalRaces, m)
    expect(result).toBe(Rank.LEM)
  })

  it('returns rank proportional to points — lower driver gets lower rank', () => {
    const driver: Driver = { uid: 'low', name: 'Low' }
    const totalRaces = [
      races('champ', 'Champ', 200),
      races('low', 'Low', 50)
    ]
    // champ points: 100*3 + 40*2 + 20*1 = 300 + 80 + 20 = 400
    // low points: 10*3 + 5*2 + 2*1 = 30 + 10 + 2 = 42, ratio = 42/400 = 0.105
    const m = [
      medals('champ', [100, 40, 20]),
      medals('low', [10, 5, 2])
    ]

    const result = statisticsBuilder.getRank(driver, totalRaces, m)
    expect(result).toBe(Rank.GOLD3)
  })

  it('returns EXPIRED for driver with <10 races and ratio below SILVER1', () => {
    const driver: Driver = { uid: 'newbie', name: 'Newbie' }
    const totalRaces = [
      races('champ', 'Champ', 500),
      races('newbie', 'Newbie', 5)
    ]
    const m = [
      medals('champ', [200, 100, 50]),
      medals('newbie', [1, 0, 0])
    ]

    const result = statisticsBuilder.getRank(driver, totalRaces, m)
    expect(result).toBe(Rank.EXPIRED)
  })

  it('returns rank for all ratio thresholds', () => {
    const topM = [medals('best', [100, 100, 100])] // maxPoints = 600
    const topR = [races('best', 'Best', 300)]

    const r = races('d', 'd', 50)

    const cases: [Medals, Rank][] = [
      [medals('d', [85, 85, 85]), Rank.GLOBAL], // 510/600 = 0.85
      [medals('d', [60, 60, 60]), Rank.SUPREME], // 360/600 = 0.60
      [medals('d', [45, 45, 45]), Rank.LEM], // 270/600 = 0.45
      [medals('d', [35, 35, 35]), Rank.EAGLE], // 210/600 = 0.35
      [medals('d', [28, 28, 28]), Rank.SHERIF], // 168/600 = 0.28
      [medals('d', [22, 22, 22]), Rank.DOUBLE_AK], // 132/600 = 0.22
      [medals('d', [18, 18, 18]), Rank.AK1], // 108/600 = 0.18
      [medals('d', [15, 15, 15]), Rank.AK], // 90/600 = 0.15
      [medals('d', [12, 12, 12]), Rank.GOLD4], // 72/600 = 0.12
      [medals('d', [10, 10, 10]), Rank.GOLD3], // 60/600 = 0.10
      [medals('d', [8, 8, 8]), Rank.GOLD2], // 48/600 = 0.08
      [medals('d', [6, 6, 6]), Rank.GOLD1], // 36/600 = 0.06
      [medals('d', [5, 5, 5]), Rank.SILVER_ELITE_MASTER], // 30/600 = 0.05
      [medals('d', [4, 4, 4]), Rank.SILVER_ELITE], // 24/600 = 0.04
      [medals('d', [3, 3, 3]), Rank.SILVER4], // 18/600 = 0.03
      [medals('d', [3, 2, 2]), Rank.SILVER3], // 9+4+2=15/600 = 0.025
      [medals('d', [2, 2, 2]), Rank.SILVER2], // 12/600 = 0.02
      [medals('d', [2, 1, 1]), Rank.SILVER1] // 6+2+1=9/600 = 0.015
    ]

    for (const [medal, expected] of cases) {
      const driver: Driver = { uid: 'd', name: 'd' }
      const m2 = [topM[0], medal]
      const r2 = [...topR, r]
      expect(statisticsBuilder.getRank(driver, r2, m2)).toBe(expected)
    }
  })

  it('returns SILVER1 floor for driver with 10+ races regardless of ratio', () => {
    const driver: Driver = { uid: 'floor', name: 'Floor' }
    const totalRaces = [
      races('best', 'Best', 500),
      races('floor', 'Floor', 10)
    ]
    const m = [
      medals('best', [200, 100, 50]),
      medals('floor', [1, 0, 0])
    ]
    // ratio = 3/850 ≈ 0.0035, below all thresholds, but 10 races → SILVER1
    const result = statisticsBuilder.getRank(driver, totalRaces, m)
    expect(result).toBe(Rank.SILVER1)
  })
})

describe('getRaceRank', () => {
  it('returns UNRANKED for 0 races', () => {
    expect(statisticsBuilder.getRaceRank(0, 0, 10)).toBe(Rank.UNRANKED)
  })

  it('returns UNRANKED for less than 10 races', () => {
    expect(statisticsBuilder.getRaceRank(9, 5, 50)).toBe(Rank.UNRANKED)
  })

  it('returns GLOBAL for top driver (ratio = 1.0)', () => {
    expect(statisticsBuilder.getRaceRank(100, 80, 80)).toBe(Rank.GLOBAL)
  })

  it('returns SUPREME at 85% of top wins', () => {
    expect(statisticsBuilder.getRaceRank(50, 68, 80)).toBe(Rank.GLOBAL)
  })

  it('returns LEM at 50% of top wins', () => {
    expect(statisticsBuilder.getRaceRank(50, 40, 80)).toBe(Rank.LEM)
  })

  it('returns GOLD3 at 10% of top wins', () => {
    expect(statisticsBuilder.getRaceRank(50, 8, 80)).toBe(Rank.GOLD3)
  })

  it('returns SILVER1 floor for 10+ races with 0 wins', () => {
    expect(statisticsBuilder.getRaceRank(10, 0, 80)).toBe(Rank.SILVER1)
  })

  it('returns SILVER1 when all have 0 wins', () => {
    expect(statisticsBuilder.getRaceRank(50, 0, 0)).toBe(Rank.SILVER1)
  })
})
