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

export default class StatisticsBuilder {
  static instance: StatisticsBuilder

  static getInstance () {
    if (!StatisticsBuilder.instance) {
      StatisticsBuilder.instance = new StatisticsBuilder()
    }
    return StatisticsBuilder.instance
  }

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
    const MIN_RACES_FOR_RANK = 10
    // if (driver.name === 'mazel') return Rank.GLOBAL
    // if (driver.name === 'jara') return Rank.SILVER1

    const driverTotalRaces = totalRaces.find((x: TotalDriverRaces) => x.driver.name === driver.name)
    if (!driverTotalRaces) return Rank.UNRANKED
    if (driverTotalRaces.races < MIN_RACES_FOR_RANK) return Rank.UNRANKED

    const driverMedals = medals.find((x: Medals) => x.driverId === driver.uid)
    if (!driverMedals) return Rank.UNRANKED

    // get max points currently
    const maxBonus = this.calculateBonus(medals[0], totalRaces[0].races)
    const maxPoints = driverTotalRaces.races / this.calculatePoints(medals[0]) * 10 + maxBonus

    const bonus = this.calculateBonus(driverMedals, driverTotalRaces.races)
    const points = driverTotalRaces.races / this.calculatePoints(driverMedals) * 10 + bonus

    const weightedPoints = this.mapValueInRange(points, 0, maxPoints, 0, 1) * 1000

    if (weightedPoints > 910) return Rank.GLOBAL
    if (this.isInRange(weightedPoints, 510, 910)) return Rank.SUPREME
    if (this.isInRange(weightedPoints, 310, 510)) return Rank.LEM
    if (this.isInRange(weightedPoints, 200, 310)) return Rank.EAGLE
    if (this.isInRange(weightedPoints, 100, 200)) return Rank.SHERIF
    if (this.isInRange(weightedPoints, 80, 100)) return Rank.DOUBLE_AK
    if (this.isInRange(weightedPoints, 61, 80)) return Rank.AK1
    if (this.isInRange(weightedPoints, 59, 61)) return Rank.AK
    if (this.isInRange(weightedPoints, 57, 59)) return Rank.GOLD4
    if (this.isInRange(weightedPoints, 55, 57)) return Rank.GOLD3
    if (this.isInRange(weightedPoints, 51, 55)) return Rank.GOLD2
    if (this.isInRange(weightedPoints, 46, 51)) return Rank.GOLD1
    if (this.isInRange(weightedPoints, 41, 46)) return Rank.SILVER_ELITE_MASTER
    if (this.isInRange(weightedPoints, 36, 41)) return Rank.SILVER_ELITE
    if (this.isInRange(weightedPoints, 31, 36)) return Rank.SILVER4
    if (this.isInRange(weightedPoints, 23, 61)) return Rank.SILVER3
    if (this.isInRange(weightedPoints, 11, 23)) return Rank.SILVER2
    if (this.isInRange(weightedPoints, 0, 11)) return Rank.SILVER1

    return Rank.EXPIRED
  }
}
