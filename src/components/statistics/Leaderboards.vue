<template>
  <div class="__leaderboards">
    <div class="__trackCarMatrix">
      <div
        v-for="(track, trackId) of leaderboardsData"
        :key="trackId"
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
            @changed="(e: Distinct) => setFilter({distinct: e})"
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
import LaptimeTable from '@/components/laptime-table/LaptimeTable.vue'
import { Distinct } from '@/constants/Distinct'
import { StatisticsFilter } from '@/store/statisticsStore'
import { Options, prop, Vue } from 'vue-class-component'
import { Carousel, Navigation, Pagination, Slide } from 'vue3-carousel'
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
class Leaderboards extends Vue.with(LeaderboardsProps) {
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

export default Leaderboards
</script>

<style lang="scss" scoped>
@import '../../assets/css/carousel.css';

.__filter {
  position: fixed;
  bottom: 0;
  width: 100vw;
  margin-left: var(--space-neg-8xl);
  z-index: 999;
  background-color: var(--surface-overlay-strong);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  .__item {
    display: flex;
    flex-direction: column;
    padding: var(--space-8xl);
    text-align: center;
  }

  .__header {
    margin-bottom: var(--space-lg);
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
    padding-top: var(--space-10xl);
    padding-bottom: var(--space-10xl);
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
  .__filter :deep(button) {
    font-size: var(--font-size-2xs) !important;
  }

  .__filter :deep(label) {
    font-size: var(--font-size-2xs) !important;
  }
}

@media only screen and (max-width: 700px) {
  .__textContainer {
    justify-content: center;
  }

  .__trackCarMatrix .__item {
      padding-bottom: var(--space-8xl);
  }

  .__carImage > img{
    width: 4rem;
  }
}
</style>
