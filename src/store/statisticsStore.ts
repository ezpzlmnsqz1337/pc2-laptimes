import LaptimeBuilder, { Laptime } from '@/builders/LaptimeBuilder'
import StatisticsBuilder, { Driver, Medals } from '@/builders/StatisticsBuilder'
import { Distinct } from '@/constants/Distinct'
import { StatisticsScreenType } from '@/constants/StatisticsScreenType'
import { WeatherType } from '@/constants/WeatherType'
import { dataStore } from './dataStore'

export namespace Leaderboards {
  export interface TrackVariantData {
    [carId: string]: Laptime[]
  }

  export interface TrackData {
    [variant: string]: TrackVariantData
  }

  export interface Data {
    [trackId: string]: TrackData
  }
};

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
  filter: StatisticsFilter,
  totalRaces: TotalDriverRaces[],
  medals: Medals[],
  leaderboardsData: Leaderboards.Data
  activeScreen: StatisticsScreenType
  getDriverTotalRaces(driverId: string): number | undefined
  handleMedals (laptimes: Laptime[]): void
  handlePositionFilter (laptimes: Laptime[]): boolean
  refreshData (laptimes: Laptime[]): void
  setFilter (filter: StatisticsFilter): void
  clearFilter (): void
  showScreen (screen: StatisticsScreenType): void
  addMedal (laptimes: Laptime[]): void
  sortMedals (): void
  setMedals (medals: Medals[]): void
  calculateTotalRacesPerDriver(laptimes: Laptime[]): void
  setLeaderboardsData (leaderboardsData: Leaderboards.Data): void
  resetState (): void
}

export const statisticsStore: StatisticsStore = {
  filter: {
    driverId: '',
    position: 0,
    distinct: Distinct.NO
  },
  totalRaces: [],
  medals: [],
  leaderboardsData: {},
  activeScreen: StatisticsScreenType.MEDALS,
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
    if (!this.filter.driverId || !this.filter.position || this.filter.distinct !== Distinct.YES) return true
    // if enough times AND driver is at the wanted position
    return laptimes.length >= this.filter.position && laptimes[this.filter.position - 1].driverId === this.filter.driverId
  },
  refreshData (laptimes: Laptime[]) {
    this.resetState()
    this.calculateTotalRacesPerDriver(laptimes)

    const ltb = LaptimeBuilder.getInstance()
    const sb = StatisticsBuilder.getInstance()

    const leaderboardsData = laptimes.reduce((acc, cur) => {
      if (!acc[cur.trackId]) {
        acc[cur.trackId] = {}
      }
      if (!acc[cur.trackId][cur.trackVariant]) {
        acc[cur.trackId][cur.trackVariant] = {}
      }
      if (!acc[cur.trackId][cur.trackVariant][cur.carId]) {
        acc[cur.trackId][cur.trackVariant][cur.carId] = []
      }
      acc[cur.trackId][cur.trackVariant][cur.carId].push(cur)
      return acc
    }, {} as Leaderboards.Data)

    for (const track in leaderboardsData) {
      for (const variant in leaderboardsData[track]) {
        for (const carId in leaderboardsData[track][variant]) {
          leaderboardsData[track][variant][carId].sort((a, b) => ltb.compareLaptimes(a.laptime, b.laptime))
          leaderboardsData[track][variant][carId] = sb.handleDistinct(leaderboardsData[track][variant][carId])
          this.handleMedals(leaderboardsData[track][variant][carId])

          const filter = this.handlePositionFilter(leaderboardsData[track][variant][carId])
          if (!filter) {
            delete leaderboardsData[track][variant][carId]
            if (!Object.keys(leaderboardsData[track][variant]).length) {
              delete leaderboardsData[track][variant]
            }
            if (!Object.keys(leaderboardsData[track]).length) {
              delete leaderboardsData[track]
            }
          }
        }
      }
    }
    this.setLeaderboardsData(leaderboardsData)
  },
  setFilter ({ driverId, position, distinct }: StatisticsFilter) {
    if (driverId !== undefined) this.filter.driverId = driverId
    if (position !== undefined) this.filter.position = position
    if (distinct !== undefined) this.filter.distinct = distinct
  },
  clearFilter () {
    this.filter.driverId = ''
    this.filter.position = 0
    this.filter.distinct = Distinct.NO
  },
  showScreen (screen) {
    this.activeScreen = screen
  },
  addMedal (laptimes: Laptime[]) {
    const MAX_SAVED_PLACES = 7
    // filter duplicate drivers
    Array.from(new Set(laptimes.map(x => x.driverId)))
      .forEach((x, index) => {
        if (index >= MAX_SAVED_PLACES) return
        let driverMedals = this.medals.find(y => y.driverId === x)
        if (!driverMedals) {
          driverMedals = { driverId: x, places: new Array(MAX_SAVED_PLACES).fill(0) }
          this.medals.push(driverMedals)
        }
        driverMedals.places[index] += 1
      })
  },
  sortMedals () {
    const cp = StatisticsBuilder.getInstance().calculatePoints
    this.medals.sort((a, b) => cp(b) - cp(a))
  },
  setMedals (medals: Medals[]) {
    this.medals = medals
  },
  calculateTotalRacesPerDriver (laptimes: Laptime[]) {
    this.totalRaces = Object.values(
      laptimes.reduce((acc, cur) => {
        if (!acc[cur.driverId]) {
          acc[cur.driverId] = {
            driver: dataStore.getDriverById(cur.driverId)!,
            races: 0
          }
        }
        acc[cur.driverId].races++
        return acc
      }, {} as Record<string, TotalDriverRaces>))
      .sort((a, b) => (b.races - a.races))
  },
  setLeaderboardsData (leaderboardsData: Leaderboards.Data) {
    this.leaderboardsData = leaderboardsData
  },
  resetState () {
    this.totalRaces = []
    this.medals = []
    this.leaderboardsData = {}
  }
}
