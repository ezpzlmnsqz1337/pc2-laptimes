import LaptimeBuilder from '@/builders/LaptimeBuilder'
import StatisticsBuilder from '@/builders/StatisticsBuilder'
import Distinct from '@/constants/Distinct'
import StatisticsScreenType from '@/constants/StatisticsScreenType'
import WeatherType from '@/constants/WeatherType'

const state = () => ({
  driverId: null,
  position: null,
  totalRaces: [],
  medals: [],
  trackCarBoardData: [],
  distinct: Distinct.NO,
  activeScreen: StatisticsScreenType.MEDALS
})

// getters
const getters = {
  getFilter: (state) => () => {
    return {
      driverId: state.driverId,
      position: state.position,
      distinct: state.distinct
    }
  },
  getDriverTotalRaces: (state) => (driverId) => {
    return state.totalRaces.find(x => x.driverId === driverId)?.races
  }
}

// actions
const actions = {
  async handleMedals ({ dispatch, commit }, { laptimes }) {
    commit('addMedal', { laptimes: laptimes.filter(x => x.weather === WeatherType.SUN) })
    commit('addMedal', { laptimes: laptimes.filter(x => x.weather === WeatherType.RAIN) })
    commit('addMedal', { laptimes: laptimes.filter(x => x.weather === WeatherType.SNOW) })
    commit('sortMedals')
  },
  handlePositionFilter ({ state }, { laptimes }) {
    if (!state.driverId || !state.position || state.distinct !== Distinct.YES) return true
    // if enough times AND driver is at the wanted position
    return laptimes.length >= state.position && laptimes[state.position - 1].driverId === state.driverId
  },
  async refreshData ({ state, commit, dispatch }, { laptimes, drivers, tracks, cars }) {
    commit('resetState')
    const totalRaces = []
    drivers.forEach(async x => {
      totalRaces.push({ driverId: x.uid, driver: x.name, races: laptimes.filter(y => y.driverId === x.uid).length })
      totalRaces.sort((a, b) => (b.races - a.races))
    })
    commit('setTotalRaces', { totalRaces })

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
          if (state.distinct === Distinct.YES) trackAndVariantAndCar = sb.handleDistinct(trackAndVariantAndCar)

          await dispatch('handleMedals', { laptimes: trackAndVariantAndCar })
          // only push laptime board when it matches the filter
          const matchFilter = await dispatch('handlePositionFilter', { laptimes: trackAndVariantAndCar })
          if (matchFilter) row.push(trackAndVariantAndCar)
        }
        // if any laptime board remain in this row after filtering, add it
        if (row.length > 0) trackCarBoardData.push(row)
      }
    }
    commit('setTrackCarBoardData', { trackCarBoardData })
  }
}

// mutations
const mutations = {
  setFilter (state, { driverId, distinct, position }) {
    if (driverId !== undefined) state.driverId = driverId
    if (position !== undefined) state.position = position
    if (distinct !== undefined) state.distinct = distinct
  },
  clearFilter (state) {
    state.driverId = null
    state.position = null
    state.distinct = Distinct.NO
  },
  showScreen (state, { screen }) {
    state.activeScreen = screen
  },
  addMedal (state, { laptimes }) {
    // filter duplicate drivers
    Array.from(new Set(laptimes.map(x => x.driverId)))
      .forEach((x, index) => {
        if (index > 3) return
        let driver = state.medals.find(y => y.driverId === x)
        if (!driver) {
          driver = { driverId: x, first: 0, second: 0, third: 0 }
          state.medals.push(driver)
        }
        if (index === 0) {
          driver.first++
        } else if (index === 1) {
          driver.second++
        } else if (index === 2) {
          driver.third++
        }
      })
  },
  sortMedals (state) {
    const sb = StatisticsBuilder.getInstance()
    state.medals.sort((a, b) => sb.calculatePoints(b) - sb.calculatePoints(a))
  },
  setMedals (state, { medals }) {
    state.medals = medals
  },
  setTotalRaces (state, { totalRaces }) {
    state.totalRaces = totalRaces
  },
  setTrackCarBoardData (state, { trackCarBoardData }) {
    state.trackCarBoardData = trackCarBoardData
  },
  resetState (state) {
    state.totalRaces = []
    state.medals = []
    state.trackCarBoardData = []
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
