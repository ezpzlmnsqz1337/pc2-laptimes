<template>
  <div class="__statistics">
    <div class="__controls">
      <Button
        :type="ButtonType.SECONDARY"
        @click="refresh()"
      >
        <div
          class="fa fa-redo"
        /><span>Refresh</span>
      </Button>
    </div>
    <div class="__generalStatisticsSection">
      <div
        class="__item"
      >
        <h2>Total races</h2>
        <table class="__totalRacesTable">
          <tr><th>Driver</th><th>No. of races</th></tr>
          <tr
            v-show="!totalRaces.length"
          >
            <td
              colspan="2"
              class="__loading"
            >
              <PulseLoader
                color="#188cff"
                size="15px"
              />
            </td>
          </tr>
          <tr
            v-for="tr in totalRaces"
            :key="tr.driver"
            class="__driver"
          >
            <td class="__name">
              {{ tr.driver }}
            </td><td class="__totalRaces">
              {{ tr.races }}
            </td>
          </tr>
        </table>
      </div>
      <div
        class="__item"
      >
        <h2>Medals</h2>
        <table class="__medalsTable">
          <tr><th>Driver</th><th>1st</th><th>2nd</th><th>3rd</th><th>Points</th><th>Rank</th></tr>
          <tr
            v-show="!medals.length"
          >
            <td
              colspan="6"
              class="__loading"
            >
              <PulseLoader
                color="#188cff"
                size="15px"
              />
            </td>
          </tr>
          <tr
            v-for="(m, index) in medals"
            :key="m.driverId"
            class="__driver"
          >
            <td class="__name">
              {{ getDriver({driverId: m.driverId}) }}
            </td>
            <td class="__first">
              <span @click="setFilter({ distinct: Distinct.YES, driverId: m.driverId, position: 1})">{{ m.first }}</span>
            </td>
            <td class="__second">
              <span @click="setFilter({ distinct: Distinct.YES, driverId: m.driverId, position: 2})">{{ m.second }}</span>
            </td>
            <td class="__third">
              <span @click="setFilter({ distinct: Distinct.YES, driverId: m.driverId, position: 3})">{{ m.third }}</span>
            </td>
            <td class="__points">
              <span>{{ calculatePoints(m) }}</span>
            </td>
            <td class="__rank">
              <img
                :src="getRank(m.driverId, index)"
                alt="rank"
              >
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div
      class="__trackCarMatrixSection"
    >
      <h2
        v-if="trackCarBoardData.length"
        class="__center"
      >
        Track times
      </h2>
      <div class="__filter">
        <div class="__item">
          <div class="__header">
            Distinct
          </div>
          <div>
            <RadioButtons
              name="distinct"
              :values="Object.values(Distinct)"
              :value="distinct"
              @changed="e => setFilter({distinct: e})"
            />
          </div>
        </div>
        <div
          v-if="driverId"
          class="__item"
        >
          <div class="__header">
            Driver
          </div>
          <Button :type="ButtonType.SECONDARY">
            {{ getDriverById(driverId).name }}
          </Button>
        </div>
        <div
          v-if="position"
          class="__item"
        >
          <div class="__header">
            Position
          </div>
          <Button :type="ButtonType.SECONDARY">
            {{ position }}.
          </Button>
        </div>
        <div
          v-if="driverId || position"
          class="__item"
        >
          <div class="__header">
            Actions
          </div>
          <Button
            :type="ButtonType.DANGER"
            @click="clearFilter()"
          >
            <div class="fa fa-ban" /><span>Clear filter</span>
          </Button>
        </div>
      </div>
      <div class="__trackCarMatrix">
        <div
          v-for="(row, indexRow) in trackCarBoardData"
          :key="`row${indexRow}`"
          class="__row"
        >
          <Carousel
            :items-to-show="1"
          >
            <Slide
              v-for="(column, indexCol) in row"
              :key="`column-${indexRow}${indexCol}`"
              class="__item"
            >
              <h3>
                {{ getTrack(column[0]) }} - {{ getCar(column[0]) }}
              </h3>
              <table
                class="__trackCarBoard"
              >
                <tr class="__header">
                  <th>Rank</th>
                  <th>Driver</th>
                  <th>Laptime</th>
                  <th class="__losing_lg">
                    Losing
                  </th>
                  <th colspan="2">
                    Car
                  </th>
                  <th>Settings</th>
                </tr>
                <tr v-show="!trackCarBoardData.length">
                  <td
                    colspan="7"
                    class="__loading"
                  >
                    <PulseLoader
                      color="#188cff"
                      size="15px"
                    />
                  </td>
                </tr>
                <tr
                  v-for="(time, indexTime) in column"
                  :key="`item-${indexRow}${indexCol}${indexTime}`"
                  :title="getRowTitleText(time)"
                >
                  <td class="__id">
                    {{ indexTime + 1 }}
                  </td>
                  <td class="__driver">
                    <span>{{ getDriver(time) }}</span>
                  </td>
                  <td class="__laptime">
                    <div>{{ time.laptime }}</div>
                    <div
                      v-if="indexTime > 0"
                      class="__losing __losing_sm"
                    >
                      {{ time.losing }}
                    </div>
                  </td>
                  <td class="__losing __losing_lg">
                    <span v-if="indexTime > 0">{{ time.losing }}</span>
                  </td>
                  <td class="__car">
                    {{ getCar(time) }}
                  </td>
                  <td class="__carImage">
                    <img
                      :src="getCarImage(time)"
                      :alt="getCar(time)"
                    >
                  </td>
                  <td class="__settings">
                    <div
                      :class="transmissionClass(time.transmission)"
                    >
                      <div class="__textContainer">
                        <div :class="`fa fa-${transmissionIcon(time.transmission)}`" />
                        <span>{{ time.transmission }}</span>
                      </div>
                    </div>
                    <div
                      :class="weatherClass(time.weather)"
                    >
                      <div class="__textContainer">
                        <div :class="`fa fa-${weatherIcon(time.weather)}`" />
                        <span>{{ time.weather }}</span>
                      </div>
                    </div>
                    <div
                      :class="brakingLineClass(time.brakingLine)"
                    >
                      <div class="__textContainer">
                        <div :class="`fa fa-${time.brakingLine === BrakingLine.ON ? 'check-circle' : 'times-circle'}`" />
                        <span>{{ time.brakingLine }}</span>
                      </div>
                    </div>
                    <div
                      :class="controlsClass(time.controls)"
                    >
                      <div class="__textContainer">
                        <div :class="`fa fa-${time.controls}`" />
                        <span>{{ time.controls }}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </Slide>
            <template #addons="{ slidesCount }">
              <Navigation v-if="slidesCount > 1" />
              <Pagination v-if="slidesCount > 1" />
            </template>
          </Carousel>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import tableMixin from '@/mixins/tableMixin'
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import WeatherType from '@/constants/WeatherType'
import Distinct from '@/constants/Distinct'
import Rank from '@/constants/Rank'

export default {
  name: 'Statistics',
  components: {
    Carousel,
    Slide,
    Pagination,
    Navigation
  },
  mixins: [tableMixin],
  data () {
    return {
      refreshing: false,
      totalRaces: [],
      medals: [],
      trackCarBoardData: []
    }
  },
  computed: {
    ...mapState(['cars', 'drivers', 'tracks']),
    ...mapState('statistics', ['distinct', 'driverId', 'position'])
  },
  mounted () {
    this.refresh()
  },
  methods: {
    ...mapMutations('statistics', { sf: 'setFilter', cf: 'clearFilter' }),
    ...mapActions(['getTracksTimes', 'getTimesForDriver', 'getTimes']),
    async refresh () {
      if (this.refreshing) return
      this.refreshing = true
      this.totalRaces = []
      this.medals = []
      this.trackCarBoardData = []

      const laptimes = await this.getTimes({ queryLimit: 0 })

      this.drivers.forEach(async x => {
        this.totalRaces.push({ driver: x.name, races: laptimes.filter(y => y.driverId === x.uid).length })
        this.totalRaces.sort((a, b) => (b.races - a.races))
      })

      this.tracks.forEach(x => {
        x.variants.forEach(v => {
          const row = []
          const trackAndVariant = laptimes.filter(y => x.uid === y.trackId && v === y.trackVariant)
          if (!trackAndVariant.length) return
          this.cars.forEach(y => {
            let trackAndVariantAndCar = trackAndVariant.filter(z => z.carId === y.uid)
            if (!trackAndVariantAndCar.length) return
            trackAndVariantAndCar = trackAndVariantAndCar.map(z => ({ ...z, losing: this.$ltb.getLaptimeDiff(trackAndVariantAndCar[0].laptime, z.laptime) }))
            // filtering out duplicates if distinct is set to true
            if (this.distinct === Distinct.YES) trackAndVariantAndCar = this.handleDistinct(trackAndVariantAndCar)

            this.handleMedals(trackAndVariantAndCar)
            // only push laptime board when it matches the filter
            if (this.handlePositionFilter(trackAndVariantAndCar)) row.push(trackAndVariantAndCar)
          })
          // if any laptime board remain in this row after filtering, add it
          if (row.length > 0) this.trackCarBoardData.push(row)
        })
      })

      this.medals.sort((a, b) => this.calculatePoints(b) - this.calculatePoints(a))
      this.refreshing = false
    },
    setFilter (filter) {
      this.cf()
      this.sf(filter)
      this.refresh()
    },
    clearFilter () {
      this.cf()
      this.refresh()
    },
    handlePositionFilter (laptimes) {
      if (!this.driverId || !this.position || this.distinct !== Distinct.YES) return true
      // if enough times AND driver is at the wanted position
      return laptimes.length >= this.position && laptimes[this.position - 1].driverId === this.driverId
    },
    handleDistinct (laptimes) {
      const drivers = []
      return laptimes.filter(x => {
        if (drivers.includes(x.driverId)) {
          return false
        }
        drivers.push(x.driverId)
        return true
      })
    },
    handleMedals (laptimes) {
      this.addMedal(laptimes.filter(x => x.weather === WeatherType.SUN))
      this.addMedal(laptimes.filter(x => x.weather === WeatherType.RAIN))
      this.addMedal(laptimes.filter(x => x.weather === WeatherType.SNOW))
    },
    addMedal (laptimes) {
      // filter duplicate drivers
      Array.from(new Set(laptimes.map(x => x.driverId)))
        .forEach((x, index) => {
          if (index > 3) return
          let driver = this.medals.find(y => y.driverId === x)
          if (!driver) {
            driver = { driverId: x, first: 0, second: 0, third: 0 }
            this.medals.push(driver)
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
    getRank (driverId, position) {
      const MIN_RACES_FOR_RANK = 10

      const driver = this.getDriverById(driverId)
      if (!driver) return Rank.UNRANKED
      // if (driver.name === 'mazel') return Rank.GLOBAL
      // if (driver.name === 'jara') return Rank.SILVER1

      const driverTotalRaces = this.totalRaces.find(x => x.driver === driver.name)
      if (!driverTotalRaces) return Rank.UNRANKED
      if (driverTotalRaces.races < MIN_RACES_FOR_RANK) return Rank.UNRANKED

      const driverMedals = this.medals.find(x => x.driverId === driver.uid)

      // get max points currently
      const maxBonus = this.calculateBonus(this.medals[0], this.totalRaces[0].races)
      const maxPoints = driverTotalRaces.races / this.calculatePoints(this.medals[0]) * 10 + maxBonus

      const bonus = this.calculateBonus(driverMedals, driverTotalRaces.races)
      const points = driverTotalRaces.races / this.calculatePoints(driverMedals) * 10 + bonus

      const weightedPoints = this.mapValueInRange(points, 0, maxPoints, 0, 1)

      if (this.isInRange(weightedPoints, 0.91, 1)) return Rank.GLOBAL
      if (this.isInRange(weightedPoints, 0.51, 0.90)) return Rank.SUPREME
      if (this.isInRange(weightedPoints, 0.31, 0.50)) return Rank.LEM
      if (this.isInRange(weightedPoints, 0.20, 0.30)) return Rank.EAGLE
      if (this.isInRange(weightedPoints, 0.10, 0.19)) return Rank.SHERIF
      if (this.isInRange(weightedPoints, 0.08, 0.09)) return Rank.DOUBLE_AK
      if (this.isInRange(weightedPoints, 0.061, 0.07)) return Rank.AK1
      if (this.isInRange(weightedPoints, 0.059, 0.060)) return Rank.AK
      if (this.isInRange(weightedPoints, 0.057, 0.058)) return Rank.GOLD4
      if (this.isInRange(weightedPoints, 0.055, 0.056)) return Rank.GOLD3
      if (this.isInRange(weightedPoints, 0.051, 0.054)) return Rank.GOLD2
      if (this.isInRange(weightedPoints, 0.046, 0.050)) return Rank.GOLD1
      if (this.isInRange(weightedPoints, 0.041, 0.045)) return Rank.SILVER_ELITE_MASTER
      if (this.isInRange(weightedPoints, 0.036, 0.040)) return Rank.SILVER_ELITE
      if (this.isInRange(weightedPoints, 0.031, 0.035)) return Rank.SILVER4
      if (this.isInRange(weightedPoints, 0.023, 0.030)) return Rank.SILVER3
      if (this.isInRange(weightedPoints, 0.011, 0.022)) return Rank.SILVER2
      if (this.isInRange(weightedPoints, 0.000, 0.010)) return Rank.SILVER1
      return Rank.EXPIRED
    },
    calculateBonus ({ first, second, third }, totalRaces) {
      let bonus = 0

      for (let i = 0; i < 1000; i = i + 10) {
        if (((first / totalRaces) * 100) > i) bonus += i
        if (((second / totalRaces) * 100) > i) bonus += i
        if (((third / totalRaces) * 100) > i) bonus += i
        if (totalRaces > i) bonus += i
      }

      return bonus
    },
    calculatePoints (medals) {
      const firstPlacePoints = 3
      const secondPlacePoints = 2
      const thirdPlacePoints = 1
      return medals.first * firstPlacePoints + medals.second * secondPlacePoints + medals.third * thirdPlacePoints
    }
  }
}
</script>

<style scoped>
@import '../assets/css/table.css';
@import '../assets/css/carousel.css';

.__statistics {
  padding: 1rem;
  padding-bottom: 6rem;
}

.__controls{
  text-align: center;
}

.__generalStatisticsSection {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.__generalStatisticsSection .__item {
  padding: 1rem;
  text-align: center;
}

.__filter {
  position: fixed;
  bottom: 0;
  width: 100vw;
  margin-left: -1rem;
  z-index: 999;
  border-top: 0.1rem solid var(--border-light1);
  background-color: var(--bg-dark3);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.__filter .__item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  text-align: center;
}

.__filter .__header {
  margin-bottom: 0.3rem;
}

.__first:hover > span, .__second:hover > span, .__third:hover > span {
  cursor: pointer;
  color: var(--hover);
}

.__totalRacesTable, .__medalsTable {
  text-align: center;
  margin-bottom: 2rem;
}

.__totalRacesTable td{
  height: 2.47rem;
}

.__medalsTable .__rank {
  padding: 0;
  padding-right: 0.5rem;
}

.__medalsTable .__rank img{
  width: 5rem;
  margin-top: 0.2rem;
  border-radius: 0.3rem;
  box-shadow: 0.2rem 0.2rem 0.3rem 0.2rem #333333;
}

.__trackCarMatrix {
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.__trackCarMatrix .__item {
  padding-left: 10vw;
  padding-right: 10vw;
  padding-top: 2rem;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.__carImage > img{
  width: 8rem;
}

.__textContainer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.__center {
  text-align: center;
}

.__controls .fa {
  margin-right: 0.3rem;
}

@media only screen and (max-width: 1024px) {
  .__textContainer {
    justify-content: center;
  }

  .__filter :deep button {
    font-size: 0.5rem !important;
  }

  .__generalStatisticsSection {
    flex-direction: column;
    align-items: center;
  }

  .__filter :deep label {
    font-size: 0.5rem !important;
  }

  .__totalRacesTable, .__medalsTable {
    font-size: 1rem !important;
  }

  .__generalStatisticsSection .__item {
    width: 80%;
  }
}

@media only screen and (max-width: 700px) {
  .__trackCarMatrix .__item {
      padding: 0 0 1rem 0;
  }

  .__generalStatisticsSection .__item {
    width: 100%;
  }

  .__totalRacesTable, .__medalsTable {
    font-size: 0.8rem !important;
  }

  .__carImage > img{
    width: 4rem;
  }
}
</style>
