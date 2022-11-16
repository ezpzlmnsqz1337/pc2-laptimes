import { Laptime } from './LaptimeBuilder'

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
}
