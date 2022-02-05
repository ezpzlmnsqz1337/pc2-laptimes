<template>
  <div class="__statistics">
    <div class="__totalRacesSection">
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

    <h2>Track-car times</h2>
    <div class="__trackCarMatrix">
      <div
        v-for="(row, indexRow) in trackCarBoardData"
        :key="`row${indexRow}`"
        class="__row"
      >
        <div class="__arrow __right">
          &gt;
        </div>
        <div class="__arrow __left">
          &lt;
        </div>
        <div
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
              <th>Car</th>
              <th>Track</th>
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
                {{ getDriver(time) }}
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
              <td class="__track">
                <div>{{ getTrackName(time) }}</div>
                <div>{{ time.trackVariant }}</div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import tableMixin from '@/mixins/tableMixin'

export default {
  name: 'Statistics',
  mixins: [tableMixin],
  data () {
    return {
      totalRaces: [],
      trackCarBoardData: []
    }
  },
  computed: {
    ...mapState(['cars', 'drivers', 'tracks'])
  },
  mounted () {
    setTimeout(async () => {
      this.drivers.forEach(async x => {
        const times = await this.getTimesForDriver({ driverId: x.uid })
        this.totalRaces.push({ driver: x.name, races: times.length })
        this.totalRaces.sort((a, b) => (b.races - a.races))
      })

      const laptimes = await this.getTimes({ queryLimit: 0 })

      this.tracks.forEach(x => {
        x.variants.forEach(v => {
          const row = []
          const trackAndVariant = laptimes.filter(y => x.uid === y.trackId && v === y.trackVariant)
          if (!trackAndVariant.length) return
          this.cars.forEach(y => {
            let trackAndVariantAndCar = trackAndVariant.filter(z => z.carId === y.uid)
            if (!trackAndVariantAndCar.length) return
            trackAndVariantAndCar = trackAndVariantAndCar.map(z => ({ ...z, losing: this.$ltb.getLaptimeDiff(trackAndVariantAndCar[0].laptime, z.laptime) }))
            row.push(trackAndVariantAndCar)
          })
          this.trackCarBoardData.push(row)
        })
      })
    }, 2000)
    this.$forceUpdate()
  },
  methods: {
    ...mapActions(['getTracksTimes', 'getTimesForDriver', 'getTimes'])
  }
}
</script>

<style scoped>
@import '../assets/css/table.css';

.__statistics {
  padding: 1rem;
}

.__totalRacesTable {
  width: 20vw;
  text-align: center;
}

.__trackCarMatrix {
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.__trackCarMatrix .__row {
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
}

.__trackCarMatrix .__item {
  min-width: calc(100vw - 4rem);
  padding-left: 10vw;
  padding-right: 10vw;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.__trackCarBoard {

}

.__textContainer {
  display: flex;
  justify-content: space-around;
}

.__row {
  position: relative;
}

.__arrow {
  position: absolute;
  background-color: #24242428;
  height: 100%;
  width: 4rem;
  top: 0;
  font-size: 2rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.__arrow:hover {
  cursor: pointer;
  background-color: #95959581;
}
.__arrow.__left {
  left: 0;
}

.__arrow.__right {
  left: calc(100vw - 7rem);
}

</style>
