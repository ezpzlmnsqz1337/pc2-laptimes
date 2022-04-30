export default class StatisticsBuilder {
    static instance

    static getInstance () {
      if (!StatisticsBuilder.instance) {
        StatisticsBuilder.instance = new StatisticsBuilder()
      }
      return StatisticsBuilder.instance
    }

    calculatePoints (medals) {
      const firstPlacePoints = 3
      const secondPlacePoints = 2
      const thirdPlacePoints = 1
      return medals.first * firstPlacePoints + medals.second * secondPlacePoints + medals.third * thirdPlacePoints
    }

    calculateBonus ({ first, second, third }, totalRaces) {
      let bonus = 0

      for (let i = 0; i < 1000; i = i + 10) {
        if (((first / totalRaces) * 100) > i) bonus += i
        if (((second / totalRaces) * 100) > i) bonus += i
        if (((third / totalRaces) * 100) > i) bonus += i
        if (totalRaces > i) bonus += i
      }

      return bonus
    }

    handleDistinct (laptimes) {
      const drivers = []
      return laptimes.filter(x => {
        if (drivers.includes(x.driverId)) {
          return false
        }
        drivers.push(x.driverId)
        return true
      })
    }
}
