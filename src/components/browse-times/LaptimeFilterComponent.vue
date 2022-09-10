<template>
  <div
    class="__filter"
  >
    <div
      v-show="showFilter"
      class="__filterWrapper"
    >
      <div class="__hideFilter">
        <Button
          :type="ButtonType.DANGER"
          @click="$emit('filter:close')"
        >
          <div
            class="fa fa-window-close"
          /><span>Close</span>
        </Button>
      </div>
      <h2>Filter times</h2>
      <div class="__inputRow">
        <!-- object value -->
        <v-select
          :model-value="filter.carId"
          placeholder="Select car"
          :options="cars"
          :reduce="car => car.uid"
          label="name"
          :class="{__activeFilter: filter.carId}"
          @update:model-value="setFilter({carId: $event})"
        />
      </div>
      <div class="__inputRow">
        <v-select
          :model-value="filter.trackId"
          placeholder="Select track"
          :options="tracks"
          :reduce="track => track.uid"
          label="track"
          :class="{__activeFilter: filter.trackId}"
          @update:model-value="setFilter({trackId: $event, trackVariant: null})"
        />
      </div>
      <div
        v-if="filter.trackId"
        class="__inputRow"
      >
        <v-select
          :model-value="filter.trackVariant"
          placeholder="Select track variant"
          :options="getTrackVariants(filter.trackId)"
          :class="{__activeFilter: filter.trackVariant}"
          @update:model-value="setFilter({trackVariant: $event})"
        />
      </div>
      <div
        class="__inputRow"
      >
        <v-select
          :model-value="filter.driverId"
          placeholder="Select driver"
          :options="drivers"
          :reduce="driver => driver.uid"
          label="name"
          :class="{__activeFilter: filter.driverId}"
          @update:model-value="setFilter({driverId: $event})"
        />
      </div>
      <div class="__header">
        Transmission
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="transmission"
          :values="Object.values(TransmissionType)"
          :value="filter.transmission"
          @changed="setFilter({transmission: $event})"
        />
      </div>

      <div class="__header">
        Weather
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="weather"
          :values="Object.values(WeatherType)"
          :value="filter.weather"
          @changed="setFilter({weather: $event})"
        />
      </div>

      <div class="__header">
        Braking line
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="brakingLine"
          :values="Object.values(BrakingLine)"
          :value="filter.brakingLine"
          @changed="setFilter({brakingLine: $event})"
        />
      </div>

      <div class="__header">
        Controls
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="controls"
          :values="Object.values(ControlType)"
          :value="filter.controls"
          @changed="setFilter({controls: $event})"
        />
      </div>

      <div class="__header">
        Start type
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="startType"
          :values="Object.values(StartType)"
          :value="filter.startType"
          @changed="setFilter({startType: $event})"
        />
      </div>

      <div class="__header">
        Game
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="distinct"
          :values="Object.values(Game)"
          :value="filter.game"
          @changed="setFilter({game: $event})"
        />
      </div>

      <div class="__header">
        Distinct
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="distinct"
          :values="Object.values(Distinct)"
          :value="filter.distinct"
          @changed="setFilter({distinct: $event})"
        />
      </div>

      <div class="__header">
        Date
      </div>
      <div class="__inputRow __noColumn">
        <div>
          <DatePicker
            class="__datepicker"
            input-format="dd.MM.yyyy"
            :disabled-dates="{predicate: disabledDates}"
            :model-value="filter.date"
            @update:model-value="setFilter({date: $event})"
          />
        </div>

        <Button
          :type="ButtonType.DANGER"
          :disabled="filter.date === null"
          @click="setFilter({date: null})"
        >
          <div
            class="fa fa-ban"
            style="margin-right: 0"
          />
        </Button>
      </div>

      <Button
        :type="ButtonType.SECONDARY"
        @click="setRandomFilter()"
      >
        <div class="fa fa-random" /><span>Random</span>
      </Button>
      <Button
        :type="ButtonType.DANGER"
        :disabled="!isFilterSet()"
        @click="clearFilter()"
      >
        <div class="fa fa-ban" /><span>Clear filter</span>
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import { BrakingLine } from '@/constants/BrakingLine'
import { ControlType } from '@/constants/ControlType'
import { Distinct } from '@/constants/Distinct'
import { Game } from '@/constants/Game'
import { StartType } from '@/constants/StartType'
import { TransmissionType } from '@/constants/TransmissionType'
import { WeatherType } from '@/constants/WeatherType'
import { LaptimeFilter } from '@/store/dataStore'
import { Options, prop, Vue } from 'vue-class-component'

interface LaptimeDb extends Laptime {
  dateString: string
}

class LaptimeFilterComponentProps {
  showFilter = prop<boolean>({ default: true })
}

@Options({
  emits: ['filter:changed', 'filter:close']
})
export default class LaptimeFilterComponent extends Vue.with(LaptimeFilterComponentProps) {
  randomizing = false

  filter: LaptimeFilter = {
    carId: null,
    trackId: null,
    trackVariant: null,
    driverId: null,
    transmission: TransmissionType.ANY,
    weather: WeatherType.ANY,
    brakingLine: BrakingLine.ANY,
    controls: ControlType.ANY,
    startType: StartType.ANY,
    game: Game.ANY,
    date: null,
    distinct: Distinct.YES
  }

  get cars () {
    return this.$dataStore.cars
  }

  get tracks () {
    return this.$dataStore.tracks
  }

  get drivers () {
    return this.$dataStore.drivers
  }

  get allTimes () {
    return this.$dataStore.times as LaptimeDb[]
  }

  get raceDates () {
    return this.allTimes.map(x => x.dateString)
  }

  getTrackVariants (trackId: string) {
    return this.$dataStore.getTrackVariants(trackId)
  }

  isFilterSet () {
    // 1 is Distinct filter which is always set
    return Object.values(this.filter).filter(x => Boolean(x)).length > 1
  }

  setRandomFilter () {
    if (this.randomizing) return
    this.randomizing = true
    // select random laptime
    const index = Math.round(Math.random() * this.allTimes.length)

    setTimeout(() => {
      const { trackId, trackVariant, carId, weather } = this.allTimes[index]
      this.setFilter({ trackId, trackVariant, carId, weather })
      this.randomizing = false
    }, 500)
  }

  disabledDates (date: Date) {
    return !this.raceDates.includes(date.toLocaleDateString('en-GB'))
  }

  setFilter (filter: LaptimeFilter) {
    this.filter = { ...this.filter, ...filter }
    this.$emit('filter:changed', this.filter)
  }

  clearFilter () {
    this.setFilter({
      carId: null,
      trackId: null,
      trackVariant: null,
      driverId: null,
      transmission: TransmissionType.ANY,
      weather: WeatherType.ANY,
      brakingLine: BrakingLine.ANY,
      controls: ControlType.ANY,
      startType: StartType.ANY,
      game: Game.ANY,
      date: null,
      distinct: Distinct.YES
    })
  }
}
</script>

<style lang="scss" scoped>
.__filterWrapper {
  padding: 1rem;
}

.__hideFilter {
  position: relative;
  left: 0;
  top: 0;
  height: 0;
  text-align: left;
}

.__inputRow {
  display: flex;
  margin: 0 auto;
  margin-bottom: 0.7rem;
  width: 100%;
  justify-content: center;
  align-items: center;
}

.__noColumn {
  flex-direction: row !important;
  border-bottom: 0.1rem solid white;
}

.__noColumn > div {
  padding: 0.5rem 1rem;
}

.__activeFilter {
  :deep(.vs__dropdown-toggle) {
    border: 0.1rem solid #4081C2;
    box-shadow: 0px 0px 5px 2px #4081C2;
  }

  :deep(span.vs__selected) {
    color: #4081C2;
    font-weight: bold;
  }
}

:deep(.__datepicker) {
  text-align: center;
  font-size: 1rem;
  padding: 0.3rem;
}

:deep(.v3dp__popout){
  font-size: 1rem;
  bottom: 1rem;
}

@media only screen and (max-width: 700px) {
  .__filterWrapper {
    padding: 0;
    width: 100%;
    margin-bottom: 1rem;
  }

  .__hideFilter button {
    font-size: 0.6rem;
  }
}
</style>
