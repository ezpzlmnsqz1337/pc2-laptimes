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
          @click="toggleFilter()"
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
          :model-value="carId"
          placeholder="Select car"
          :options="cars"
          :reduce="car => car.uid"
          label="name"
          :class="{__activeFilter: carId}"
          @update:model-value="setFilter({carId: $event})"
        />
      </div>
      <div class="__inputRow">
        <v-select
          :model-value="trackId"
          placeholder="Select track"
          :options="tracks"
          :reduce="track => track.uid"
          label="track"
          :class="{__activeFilter: trackId}"
          @update:model-value="setFilter({trackId: $event, trackVariant: null})"
        />
      </div>
      <div
        v-if="trackId"
        class="__inputRow"
      >
        <v-select
          :model-value="trackVariant"
          placeholder="Select track variant"
          :options="getTrackVariants(trackId)"
          :class="{__activeFilter: trackVariant}"
          @update:model-value="setFilter({trackVariant: $event})"
        />
      </div>
      <div
        class="__inputRow"
      >
        <v-select
          :model-value="driverId"
          placeholder="Select driver"
          :options="drivers"
          :reduce="driver => driver.uid"
          label="name"
          :class="{__activeFilter: driverId}"
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
          :value="transmission"
          @changed="e => setFilter({transmission: e})"
        />
      </div>

      <div class="__header">
        Weather
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="weather"
          :values="Object.values(WeatherType)"
          :value="weather"
          @changed="e => setFilter({weather: e})"
        />
      </div>

      <div class="__header">
        Braking line
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="brakingLine"
          :values="Object.values(BrakingLine)"
          :value="brakingLine"
          @changed="e => setFilter({brakingLine: e})"
        />
      </div>

      <div class="__header">
        Controls
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="controls"
          :values="Object.values(ControlType)"
          :value="controls"
          @changed="e => setFilter({controls: e})"
        />
      </div>

      <div class="__header">
        Start type
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="startType"
          :values="Object.values(StartType)"
          :value="startType"
          @changed="e => setFilter({startType: e})"
        />
      </div>

      <div class="__header">
        Game
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="distinct"
          :values="Object.values(Game)"
          :value="game"
          @changed="e => setFilter({game: e})"
        />
      </div>

      <div class="__header">
        Distinct
      </div>
      <div class="__inputRow __noColumn">
        <RadioButtons
          name="distinct"
          :values="Object.values(Distinct)"
          :value="distinct"
          @changed="e => setFilter({distinct: e})"
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
            :model-value="date"
            @update:model-value="setFilter({date: $event})"
          />
        </div>

        <Button
          :type="ButtonType.DANGER"
          :disabled="date === null"
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
import { LaptimeFilter } from '@/store/laptimeFilterStore'
import { Vue } from 'vue-class-component'

interface LaptimeDb extends Laptime {
  dateString: string
}

export default class LaptimeFilterComponent extends Vue {
  randomizing = false
  allTimes: LaptimeDb[] = []

  get times () {
    return this.$dataStore.times
  }

  get raceDates () {
    return this.allTimes.map(x => x.dateString)
  }

  get firstLaptime () {
    return this.times[0].laptime
  }

  async mounted () {
    if (screen.availWidth >= 700) {
      this.$laptimeFilterStore.toggleFilter()
    }
    this.allTimes = (await this.$dataStore.getTimes(0)) as LaptimeDb[]
  }

  isFilterSet () {
    this.$laptimeFilterStore.isFilterSet()
  }

  async setRandomFilter () {
    if (this.randomizing) return
    this.randomizing = true
    this.$dataStore.setTimes([])
    // select random laptime
    const index = Math.round(Math.random() * this.allTimes.length)
    const { trackId, trackVariant, carId, weather } = this.allTimes[index]
    this.setFilter({ trackId, trackVariant, carId, weather })
    this.randomizing = false
  }

  disabledDates (date: Date) {
    return !this.raceDates.includes(date.toLocaleDateString('en-GB'))
  }

  async setFilter (filter: LaptimeFilter) {
    this.$laptimeFilterStore.setFilter(filter)
    this.$dataStore.refreshTimes()
  }

  async clearFilter () {
    this.$laptimeFilterStore.clearFilter()
    this.$dataStore.refreshTimes()
  }
}
</script>

<style lang="scss" scoped>
.__laptimeBoard {
  padding: 1rem;
  border-radius: 0.3rem;
}

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
  margin-bottom: 0.7rem;
  align-items: center;
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
