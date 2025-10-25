<template>
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
    <InputRow>
      <SelectInput
        :model-value="filter.carId"
        placeholder="Select car"
        :options="cars"
        :reduce="(car: typeof Car) => car.uid"
        label="name"
        @update:model-value="setFilter({carId: $event})"
      />
    </InputRow>
    <InputRow>
      <SelectInput
        :model-value="filter.trackId"
        placeholder="Select track"
        :options="tracks"
        :reduce="(track: typeof Track) => track.uid"
        label="track"
        @update:model-value="setFilter({trackId: $event, trackVariant: null})"
      />
    </InputRow>
    <InputRow
      v-if="filter.trackId && getTrackVariants(filter.trackId).length > 0"
    >
      <SelectInput
        :model-value="filter.trackVariant"
        placeholder="Select track variant"
        :reduce="(o: string) => o"
        :options="getTrackVariants(filter.trackId)"
        :class="{__activeFilter: filter.trackVariant}"
        @update:model-value="setFilter({trackVariant: $event})"
      />
    </InputRow>
    <InputRow>
      <SelectInput
        :model-value="filter.driverId"
        placeholder="Select driver"
        :options="drivers"
        :reduce="(driver: typeof Driver) => driver.uid"
        label="name"
        :class="{__activeFilter: filter.driverId}"
        @update:model-value="setFilter({driverId: $event})"
      />
    </InputRow>

    <InputRow
      heading="Date"
      :border-bottom="true"
    >
      <div class="__datePickerInput">
        <DatePicker
          class="__datepicker"
          input-format="dd.MM.yyyy"
          :disabled-dates="{predicate: disabledDates}"
          :model-value="filter.date"
          @update:model-value="setFilter({date: $event})"
        />
      </div>

      <div
        class="__datePickerClearBtn"
      >
        <Button
          :type="
            ButtonType.DANGER"
          :disabled="filter.date === null"
          @click="setFilter({date: null})"
        >
          <div
            class="fa fa-ban"
            style="margin-right: 0"
          />
        </Button>
      </div>
    </InputRow>

    <Button
      :type="ButtonType.SECONDARY"
      @click="showMoreFilters = !showMoreFilters"
    >
      <div
        :class="`fa fa-chevron-${showMoreFilters ? 'up' : 'down'}`"
      />More filters
    </Button>
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

    <div class="__distinctFilter">
      <InputRow
        key="distinct"
        heading="Distinct"
        :border-bottom="showMoreFilters"
      >
        <RadioButtons
          name="distinct"
          :values="Object.values(Distinct)"
          :value="filter['distinct' as keyof LaptimeFilter]"
          @changed="setFilter({distinct: $event})"
        />
      </InputRow>
    </div>

    <div
      class="__moreFilters"
      :class="{__hidden: !showMoreFilters}"
    >
      <InputRow
        v-for="b in buttons"
        :key="b.name"
        :heading="b.heading"
        :border-bottom="true"
      >
        <RadioButtons
          :name="b.name"
          :values="b.values"
          :value="filter[b.name as keyof LaptimeFilter]"
          @changed="setFilter({[b.name]: $event})"
        />
      </InputRow>
    </div>
  </div>
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import InputRow from '@/components/add-laptime/InputRow.vue'
import SelectInput from '@/components/ui/SelectInput.vue'
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

interface LaptimeFilterButtons {
  heading: string
  name: string
  values: any[]
}

class LaptimeFilterComponentProps {
  showFilter = prop<boolean>({ default: true })
}

@Options({
  components: {
    InputRow,
    SelectInput
  },
  emits: ['filter:changed', 'filter:close']
})
class LaptimeFilterComponent extends Vue.with(LaptimeFilterComponentProps) {
  randomizing = false
  buttons!: LaptimeFilterButtons[]
  showMoreFilters = false

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

  created () {
    this.buttons = [
      {
        heading: 'Transmission',
        name: 'transmission',
        values: Object.values(TransmissionType)
      },
      {
        heading: 'Weather',
        name: 'weather',
        values: Object.values(WeatherType)
      },
      {
        heading: 'Braking line',
        name: 'brakingLine',
        values: Object.values(BrakingLine)
      },
      {
        heading: 'Controls',
        name: 'controls',
        values: Object.values(ControlType)
      },
      {
        heading: 'Start type',
        name: 'startType',
        values: Object.values(StartType)
      },
      {
        heading: 'Game',
        name: 'game',
        values: Object.values(Game)
      }
    ]
  }

  getTrackVariants (trackId: string) {
    return this.$dataStore.getTrackVariants(trackId) ?? []
  }

  isFilterSet () {
    // 1 is Distinct filter which is always set
    return Object.values(this.filter).filter(x => Boolean(x)).length > 1
  }

  setRandomFilter () {
    if (!this.allTimes.length) return
    if (this.randomizing) return
    this.randomizing = true
    // select random laptime
    const index = Math.floor(Math.random() * this.allTimes.length)

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

export default LaptimeFilterComponent
</script>

<style lang="scss" scoped>
.__filterWrapper {
  padding: 1rem;

  .__hideFilter {
    position: relative;
    left: 0;
    top: 0;
    height: 0;
    text-align: left;
  }

  .__moreFilters,
  .__distinctFilter {
    margin-top: 0.7rem;

    &.__hidden {
      visibility: hidden;
    }
  }

  .__datePickerInput {
    width: 100%;
  }

  .__datePickerClearBtn {
    :deep(button) {
      padding: 0.75rem 0.9rem;
    }
  }

  :deep(.__heading) {
    font-size: 0.7rem;
    font-weight: normal;
  }

  :deep(.__datepicker) {
    text-align: center;
    font-size: 1rem;
    display: block;
    width: 100%;
    border: 1px solid white;
  }

  :deep(.v3dp__popout){
    --elem-disabled-color: var(--text-disabled);
    color: var(--text-light);
    font-size: 1rem;
    bottom: 1rem;
  }

  :deep(.__input) {
    justify-content: center;
    align-items: center;
  }

  :deep(.__inputRow) {
    margin-bottom: 0.7rem;
  }
}

@media only screen and (max-width: 1600px) {
  .__filterWrapper {
    .__datePickerClearBtn {
      :deep(button) {
        padding: 0.5rem 0.9rem;
      }
    }
  }
}

@media only screen and (max-width: 700px) {
  .__filterWrapper {
    padding: 0;
    width: 100%;
    margin-bottom: 1rem;

    .__hideFilter button {
      font-size: 0.6rem;
    }
  }
}
</style>
