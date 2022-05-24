<template>
  <div class="__leaderboards">
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
                :class="{__hasNotes: time.notes }"
                @click="$toast.info(time.notes || 'No comment')"
              >
                <td class="__id">
                  {{ indexTime + 1 }}.
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
                    v-if="getCarImage(time)"
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
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import tableMixin from '@/mixins/tableMixin'
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'

export default {
  name: 'Leaderboards',
  components: {
    Carousel,
    Slide,
    Pagination,
    Navigation
  },
  mixins: [tableMixin],
  props: {
    refresh: {
      type: Function,
      default: () => {}
    }
  },
  computed: {
    ...mapState('statistics', ['distinct', 'driverId', 'position', 'trackCarBoardData']),
    ...mapGetters(['getDriverById', 'getDriverByName'])
  },
  mounted () {
    this.handleUrl()
  },
  methods: {
    ...mapMutations('statistics', { sf: 'setFilter', cf: 'clearFilter' }),
    handleUrl () {
      const filter = {}
      if (this.queryParams.has('driver')) {
        const driver = this.getDriverByName(this.queryParams.get('driver'))
        if (driver) filter.driverId = driver.uid
      }
      if (this.queryParams.has('position')) {
        filter.position = parseInt(this.queryParams.get('position'))
      }
      if (this.queryParams.has('distinct')) {
        filter.distinct = this.queryParams.get('distinct')
      }
      if (filter.driverId && filter.position && filter.distinct) {
        this.setFilter(filter)
      }
    },
    setFilter (filter) {
      this.cf()
      this.sf(filter)
      this.refresh()
    },
    clearFilter () {
      this.cf()
      this.refresh()
    }
  }
}
</script>

<style scoped>
@import '../assets/css/table.css';
@import '../assets/css/carousel.css';

.__filter {
  position: fixed;
  bottom: 0;
  width: 100vw;
  margin-left: -1rem;
  z-index: 999;
  background-color: rgba(72, 72, 72, 0.7);
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

@media only screen and (max-width: 1024px) {
  .__filter :deep button {
    font-size: 0.5rem !important;
  }

  .__filter :deep label {
    font-size: 0.5rem !important;
  }
}

@media only screen and (max-width: 700px) {
  .__textContainer {
    justify-content: center;
  }

  .__trackCarMatrix .__item {
      padding: 0 0 1rem 0;
  }

  .__carImage > img{
    width: 4rem;
  }
}
</style>
