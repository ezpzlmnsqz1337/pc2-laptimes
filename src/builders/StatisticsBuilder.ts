import { Rank } from '@/constants/Rank'
import { Laptime } from './LaptimeBuilder'
import { TotalDriverRaces } from '@/store/statisticsStore'

export interface Driver {
  uid: string
  name: string
}

export interface Medals {
  driverId: string
  places: number[]
}

export class StatisticsBuilder {
  calculatePoints (medals: Medals) {
    const firstPlacePoints = 3
    const secondPlacePoints = 2
    const thirdPlacePoints = 1
    return medals.places[0] * firstPlacePoints + medals.places[1] * secondPlacePoints + medals.places[2] * thirdPlacePoints
  }

  handleDistinct (laptimes: Laptime[]) {
    const drivers: string[] = []
    return laptimes.filter(x => {
      if (drivers.includes(x.driverId)) {
        return false
      }
      drivers.push(x.driverId)
      return true
    })
  }

  getRank (driver: Driver, totalRaces: TotalDriverRaces[], medals: Medals[]) {
    const dr = totalRaces.find((x: TotalDriverRaces) => x.driver.name === driver.name)
    if (!dr || dr.races <= 0) return Rank.UNRANKED

    const dm = medals.find((x: Medals) => x.driverId === driver.uid)
    if (!dm) return Rank.UNRANKED

    const driverPoints = this.calculatePoints(dm)
    if (driverPoints <= 0) return Rank.EXPIRED

    // ponytail: ratio to top driver; geometric thresholds for natural spread; >=10 races floor at SILVER1
    const maxPoints = medals.length > 0 ? this.calculatePoints(medals[0]) : 1
    const ratio = driverPoints / maxPoints

    const tiers: [Rank, number][] = [
      [Rank.GLOBAL, 0.85],
      [Rank.SUPREME, 0.60],
      [Rank.LEM, 0.45],
      [Rank.EAGLE, 0.35],
      [Rank.SHERIF, 0.28],
      [Rank.DOUBLE_AK, 0.22],
      [Rank.AK1, 0.18],
      [Rank.AK, 0.15],
      [Rank.GOLD4, 0.12],
      [Rank.GOLD3, 0.10],
      [Rank.GOLD2, 0.08],
      [Rank.GOLD1, 0.06],
      [Rank.SILVER_ELITE_MASTER, 0.05],
      [Rank.SILVER_ELITE, 0.04],
      [Rank.SILVER4, 0.03],
      [Rank.SILVER3, 0.025],
      [Rank.SILVER2, 0.02],
      [Rank.SILVER1, 0.015]
    ]

    for (const [rank, threshold] of tiers) {
      if (ratio >= threshold) return rank
    }

    // ponytail: active drivers with 10+ events always get at least SILVER1
    if (dr.races >= 10) return Rank.SILVER1

    return Rank.EXPIRED
  }
}

export const statisticsBuilder = new StatisticsBuilder()
