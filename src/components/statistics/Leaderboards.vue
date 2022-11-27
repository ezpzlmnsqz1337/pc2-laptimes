<template>
  <div class="__leaderboards">
    <div class="__trackCarMatrix">
      <div
        v-for="track in leaderboardsData"
        :key="track"
        class="__row"
      >
        <template
          v-for="variant in track"
          :key="variant"
        >
          <Carousel
            :items-to-show="1"
          >
            <Slide
              v-for="laptimes in variant"
              :key="laptimes"
              class="__item"
            >
              <h3>
                {{ getTrackName(laptimes[0]) }} - {{ getTrackVariantName(laptimes[0]) }} - {{ getCar(laptimes[0]) }}
              </h3>
              <LaptimeTable
                :rows="laptimes"
                :display-columns="displayColumns"
              />
            </Slide>
            <template #addons="{ slidesCount }">
              <Navigation v-if="slidesCount > 1" />
              <Pagination v-if="slidesCount > 1" />
            </template>
          </Carousel>
        </template>
      </div>
    </div>

    <div class="__filter">
      <div class="__item">
        <div class="__header">
          Distinct
        </div>
        <div>
          <RadioButtons
            name="distinct"
            :values="Object.values(Distinct)"
            :value="filter.distinct"
            @changed="e => setFilter({distinct: e})"
          />
        </div>
      </div>
      <div
        v-if="filter.driverId"
        class="__item"
      >
        <div class="__header">
          Driver
        </div>
        <Button :type="ButtonType.SECONDARY">
          {{ getDriverName(filter.driverId) }}
        </Button>
      </div>
      <div
        v-if="filter.position"
        class="__item"
      >
        <div class="__header">
          Position
        </div>
        <Button :type="ButtonType.SECONDARY">
          {{ filter.position }}.
        </Button>
      </div>
      <div
        v-if="filter.driverId || filter.position"
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
  </div>
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import { Distinct } from '@/constants/Distinct'
import { StatisticsFilter } from '@/store/statisticsStore'
import { Options, prop, Vue } from 'vue-class-component'
import { Carousel, Navigation, Pagination, Slide } from 'vue3-carousel'
import LaptimeTable from '@/components/laptime-table/LaptimeTable.vue'
import 'vue3-carousel/dist/carousel.css'

class LeaderboardsProps {
  refresh = prop<Function>({ default: () => {} })
}

@Options({
  components: {
    Carousel,
    Slide,
    Pagination,
    Navigation,
    LaptimeTable
  }
})
export default class Leaderboards extends Vue.with(LeaderboardsProps) {
  displayColumns = ['rank', 'driver', 'laptime', 'car', 'settings']
  showItems = 5

  get leaderboardsData () {
    return this.$statisticsStore.leaderboardsData
  }

  get filter () {
    return this.$statisticsStore.filter
  }

  mounted () {
    this.handleUrl()
  }

  getCar (laptime: Laptime) {
    return this.$dataStore.getCarById(laptime.carId)?.name
  }

  getTrackName (laptime: Laptime) {
    return this.$dataStore.getTrackById(laptime.trackId)?.track
  }

  getTrackVariantName (laptime: Laptime) {
    return laptime.trackVariant
  }

  getDriverName (driverId: string) {
    return this.$dataStore.getDriverById(driverId)?.name
  }

  handleUrl () {
    const filter = {} as StatisticsFilter
    if (this.queryParams.has('driver')) {
      const driver = this.$dataStore.getDriverByName(this.queryParams.get('driver')!)
      if (driver) filter.driverId = driver.uid
    }
    if (this.queryParams.has('position')) {
      filter.position = parseInt(this.queryParams.get('position')!)
    }
    if (this.queryParams.has('distinct')) {
      filter.distinct = this.queryParams.get('distinct') === Distinct.YES ? Distinct.YES : Distinct.NO
    }
    if (filter.driverId && filter.position && filter.distinct) {
      this.setFilter(filter)
    }
  }

  setFilter (filter: StatisticsFilter) {
    this.$statisticsStore.clearFilter()
    this.$statisticsStore.setFilter(filter)
    this.refresh()
  }

  clearFilter () {
    this.$statisticsStore.clearFilter()
    this.refresh()
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/carousel.css';

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

  .__item {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    text-align: center;
  }

  .__header {
    margin-bottom: 0.3rem;
  }
}

.__trackCarMatrix {
  max-width: 100vw;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;

  .__item {
    padding-left: 10vw;
    padding-right: 10vw;
    padding-top: 2rem;
    padding-bottom: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
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
