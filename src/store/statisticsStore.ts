import { Car } from '@/assets/db/cars'
import { Track } from '@/assets/db/tracks'
import LaptimeBuilder, { Laptime } from '@/builders/LaptimeBuilder'
import StatisticsBuilder, { Driver, Medals } from '@/builders/StatisticsBuilder'
import { Distinct } from '@/constants/Distinct'
import { StatisticsScreenType } from '@/constants/StatisticsScreenType'
import { WeatherType } from '@/constants/WeatherType'

export interface TotalDriverRaces {
  driver: Driver
  races: number
}

export interface StatisticsFilter {
  driverId: string
  position: number
  distinct: Distinct
}

export interface StatisticsStore {
  driverId: string | null,
  position: number | null,
  totalRaces: TotalDriverRaces[],
  medals: Medals[],
  trackCarBoardData: any[]
  distinct: Distinct
  activeScreen: StatisticsScreenType
  getFilter(): StatisticsFilter
  getDriverTotalRaces(driverId: string): number | undefined
  handleMedals (laptimes: Laptime[]): void
  handlePositionFilter (laptimes: Laptime[]): boolean
  refreshData (laptimes: Laptime[], drivers: Driver[], tracks: Track[], cars: Car[]): void
  setFilter (filter: StatisticsFilter): void
  clearFilter (): void
  showScreen (screen: StatisticsScreenType): void
  addMedal (laptimes: Laptime[]): void
  sortMedals (): void
  setMedals (medals: Medals[]): void
  setTotalRaces (totalRaces: TotalDriverRaces[]): void
  setTrackCarBoardData (trackCarBoardData: any[]): void
  resetState (): void
}

export const statisticsStore: StatisticsStore = {
  driverId: null,
  position: null,
  totalRaces: [],
  medals: [],
  trackCarBoardData: [],
  distinct: Distinct.NO,
  activeScreen: StatisticsScreenType.MEDALS,
  getFilter () {
    return {
      driverId: this.driverId || '',
      position: this.position || 0,
      distinct: this.distinct
    }
  },
  getDriverTotalRaces (driverId: string) {
    return this.totalRaces.find(x => x.driver.uid === driverId)?.races
  },
  handleMedals (laptimes: Laptime[]) {
    this.addMedal(laptimes.filter(x => x.weather === WeatherType.SUN))
    this.addMedal(laptimes.filter(x => x.weather === WeatherType.RAIN))
    this.addMedal(laptimes.filter(x => x.weather === WeatherType.SNOW))
    this.sortMedals()
  },
  handlePositionFilter (laptimes: Laptime[]) {
    if (!this.driverId || !this.position || this.distinct !== Distinct.YES) return true
    // if enough times AND driver is at the wanted position
    return laptimes.length >= this.position && laptimes[this.position - 1].driverId === this.driverId
  },
  refreshData (laptimes: Laptime[], drivers: Driver[], tracks: Track[], cars: Car[]) {
    this.resetState()
    const totalRaces: TotalDriverRaces[] = []
    drivers.forEach((x: Driver) => {
      const driver: Driver = { uid: x.uid, name: x.name }
      totalRaces.push({ driver, races: laptimes.filter(y => y.driverId === x.uid).length })
      totalRaces.sort((a, b) => (b.races - a.races))
    })
    this.setTotalRaces(totalRaces)

    const trackCarBoardData = []
    const ltb = LaptimeBuilder.getInstance()
    const sb = StatisticsBuilder.getInstance()

    for (const x of tracks) {
      for (const v of x.variants) {
        const row = []
        const trackAndVariant = laptimes.filter(y => x.uid === y.trackId && v === y.trackVariant)
        if (!trackAndVariant.length) continue
        for (const y of cars) {
          let trackAndVariantAndCar = trackAndVariant.filter(z => z.carId === y.uid)
          if (!trackAndVariantAndCar.length) continue
          trackAndVariantAndCar = trackAndVariantAndCar.map(z => ({ ...z, losing: ltb.getLaptimeDiff(trackAndVariantAndCar[0].laptime, z.laptime) }))
          // filtering out duplicates if distinct is set to true
          if (this.distinct === Distinct.YES) trackAndVariantAndCar = sb.handleDistinct(trackAndVariantAndCar)

          this.handleMedals(trackAndVariantAndCar)
          // only push laptime board when it matches the filter
          const matchFilter = this.handlePositionFilter(trackAndVariantAndCar)
          if (matchFilter) row.push(trackAndVariantAndCar)
        }
        // if any laptime board remain in this row after filtering, add it
        if (row.length > 0) trackCarBoardData.push(row)
      }
    }
    this.setTrackCarBoardData(trackCarBoardData)
  },
  setFilter ({ driverId, position, distinct }: StatisticsFilter) {
    if (driverId !== undefined) this.driverId = driverId
    if (position !== undefined) this.position = position
    if (distinct !== undefined) this.distinct = distinct
  },
  clearFilter () {
    this.driverId = null
    this.position = null
    this.distinct = Distinct.NO
  },
  showScreen (screen) {
    this.activeScreen = screen
  },
  addMedal (laptimes: Laptime[]) {
    // filter duplicate drivers
    Array.from(new Set(laptimes.map(x => x.driverId)))
      .forEach((x, index) => {
        if (index > 3) return
        let driverMedals = this.medals.find(y => y.driverId === x)
        if (!driverMedals) {
          driverMedals = { driverId: x, first: 0, second: 0, third: 0 }
          this.medals.push(driverMedals)
        }
        if (index === 0) {
          driverMedals.first++
        } else if (index === 1) {
          driverMedals.second++
        } else if (index === 2) {
          driverMedals.third++
        }
      })
  },
  sortMedals () {
    const sb = StatisticsBuilder.getInstance()
    this.medals.sort((a, b) => sb.calculatePoints(b) - sb.calculatePoints(a))
  },
  setMedals (medals: Medals[]) {
    this.medals = medals
  },
  setTotalRaces (totalRaces: TotalDriverRaces[]) {
    this.totalRaces = totalRaces
  },
  setTrackCarBoardData (trackCarBoardData: any[]) {
    this.trackCarBoardData = trackCarBoardData
  },
  resetState () {
    this.totalRaces = []
    this.medals = []
    this.trackCarBoardData = []
  }
}
