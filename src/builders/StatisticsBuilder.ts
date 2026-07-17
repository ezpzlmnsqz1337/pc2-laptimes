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

  calculateBonus ({ places }: Medals, totalRaces: number) {
    let bonus = 0

    for (let i = 0; i < 1000; i = i + 10) {
      if (((places[0] / totalRaces) * 100) > i) bonus += i
      if (((places[1] / totalRaces) * 100) > i) bonus += i
      if (((places[2] / totalRaces) * 100) > i) bonus += i
      if (totalRaces > i) bonus += i
    }

    return bonus
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

  mapValueInRange (x: number, inMin: number, inMax: number, outMin: number, outMax: number) {
    return (x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin
  }

  isInRange (n: number, min: number, max: number) {
    return min <= n && n <= max
  }

  getRank (driver: Driver, totalRaces: TotalDriverRaces[], medals: Medals[]) {
    const dr = totalRaces.find((x: TotalDriverRaces) => x.driver.name === driver.name)
    if (!dr || dr.races <= 0) return Rank.UNRANKED

    const dm = medals.find((x: Medals) => x.driverId === driver.uid)
    const wins = dm ? (dm.places[0] || 0) : 0

    return this.getRaceRank(dr.races, wins)
  }

  getRaceRank (races: number, wins: number) {
    if (races <= 0) return Rank.UNRANKED
    const wr = wins / races

    if (races >= 500 && wr >= 0.70) return Rank.GLOBAL
    if (races >= 300 && wr >= 0.65) return Rank.SUPREME
    if (races >= 200 && wr >= 0.60) return Rank.LEM
    if (races >= 100 && wr >= 0.55) return Rank.EAGLE
    if (races >= 75 && wr >= 0.50) return Rank.SHERIF
    if (races >= 50 && wr >= 0.45) return Rank.DOUBLE_AK
    if (races >= 30 && wr >= 0.40) return Rank.AK1
    if (races >= 20 && wr >= 0.35) return Rank.AK
    if (races >= 15 && wr >= 0.30) return Rank.GOLD4
    if (races >= 10 && wr >= 0.25) return Rank.GOLD3
    if (races >= 8 && wr >= 0.20) return Rank.GOLD2
    if (races >= 5 && wr >= 0.15) return Rank.GOLD1
    if (races >= 3 && wr >= 0.10) return Rank.SILVER4
    if (races >= 3) return Rank.SILVER3
    if (races >= 2) return Rank.SILVER2
    if (races >= 1) return Rank.SILVER1

    return Rank.UNRANKED
  }
}

export const statisticsBuilder = new StatisticsBuilder()
