<template>
  <div class="__statistics">
    <div class="__generalStatisticsSection">
      <div class="__item">
        <h2>Total races</h2>
        <table class="__totalRacesTable">
          <tr><th>Driver</th><th>No. of races</th></tr>
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
      <div class="__item">
        <h2>Medals</h2>
        <table class="__totalRacesTable">
          <tr><th>Driver</th><th>1st</th><th>2nd</th><th>3rd</th></tr>
          <tr
            v-for="m in medals"
            :key="m.driverId"
            class="__driver"
          >
            <td class="__name">
              {{ getDriver({driverId: m.driverId}) }}
            </td>
            <td class="__first">
              {{ m.first }}
            </td>
            <td class="__second">
              {{ m.second }}
            </td>
            <td class="__third">
              {{ m.third }}
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div class="__trackCarMatrixSection">
      <h2 class="__center">
        Track times
      </h2>
      <div class="__trackCarMatrix">
        <div
          v-for="(row, indexRow) in trackCarBoardData"
          :key="`row${indexRow}`"
          class="__row"
        >
          <Carousel :items-to-show="1">
            <Slide
              v-for="(column, indexCol) in row"
              :key="`column-${indexRow}${indexCol}`"
              class="__item"
            >
              <h3>{{ getTrack(column[0]) }} - {{ getCar(column[0]) }}</h3>
              <table class="__trackCarBoard">
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
                        <div :class="`fa fa-${time.transmission}`" />
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
                        <div :class="`fa fa-${BrakingLine.ON ? 'check-circle' : 'times-circle'}`" />
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
import { mapActions, mapState } from 'vuex'
import tableMixin from '@/mixins/tableMixin'
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'

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
      totalRaces: [],
      medals: [],
      trackCarBoardData: []
    }
  },
  computed: {
    ...mapState(['cars', 'drivers', 'tracks'])
  },
  mounted () {
    setTimeout(() => this.refresh(), 500)
  },
  methods: {
    ...mapActions(['getTracksTimes', 'getTimesForDriver', 'getTimes']),
    async refresh () {
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
          this.cars.forEach((y, index) => {
            let trackAndVariantAndCar = trackAndVariant.filter(z => z.carId === y.uid)
            if (!trackAndVariantAndCar.length) return
            trackAndVariantAndCar = trackAndVariantAndCar.map(z => ({ ...z, losing: this.$ltb.getLaptimeDiff(trackAndVariantAndCar[0].laptime, z.laptime) }))
            this.addMedal(trackAndVariantAndCar)
            row.push(trackAndVariantAndCar)
          })
          this.trackCarBoardData.push(row)
        })
      })

      this.medals.sort((a, b) => b.first - a.first)
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
    }
  }
}
</script>

<style scoped>
@import '../assets/css/table.css';
@import '../assets/css/carousel.css';

.__statistics {
  padding: 1rem;
}

.__generalStatisticsSection {
  display: flex;
  justify-content: center;
}

.__generalStatisticsSection .__item {
  padding: 1rem;
  width: 20vw;
}

.__totalRacesTable {
  text-align: center;
  margin-bottom: 2rem;
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
  justify-content: space-around;
}

.__center {
  text-align: center;
}

@media only screen and (max-width: 700px) {
  .__trackCarMatrix .__item {
      padding: 0 0 1rem 0;
  }

  .__generalStatisticsSection .__item {
    width: 100%;
    text-align: center;
  }

  .__carImage > img{
    width: 4rem;
  }
}
</style>
