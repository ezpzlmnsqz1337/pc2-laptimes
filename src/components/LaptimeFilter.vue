<template>
  <div class="__filter">
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

    <Button
      :type="ButtonType.DANGER"
      :disabled="!isFilterSet()"
      @click="clearFilter()"
    >
      <div class="fa fa-ban" /><span class="__clearFilterBtnText">Clear filter</span>
    </Button>
  </div>
</template>

<script>
import Distinct from '@/constants/Distinct'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'LaptimeFilter',
  computed: {
    ...mapState(['cars', 'tracks', 'drivers', 'times']),
    ...mapGetters(['getCarById', 'getTrackById', 'getDriverById', 'getTrackVariants']),
    ...mapState('laptimeFilter', ['carId', 'trackId', 'trackVariant', 'driverId', 'transmission', 'weather', 'brakingLine', 'controls', 'startType', 'distinct']),
    firstLaptime () {
      return this.times[0].laptime
    }
  },
  methods: {
    ...mapMutations('laptimeFilter', { sf: 'setFilter', cf: 'clearFilter' }),
    ...mapActions(['refreshTimes']),
    isFilterSet () {
      return this.carId || this.trackId || this.trackVariant || this.transmission ||
              this.weather || this.brakingLine || this.controls || this.startType || this.distinct === Distinct.NO
    },
    async setFilter (filter) {
      this.sf(filter)
      this.refreshTimes()
    },
    async clearFilter () {
      this.cf()
      this.refreshTimes()
    }
  }
}
</script>

<style scoped>
.__laptimeBoard {
  padding: 1rem;
  border-radius: 0.3rem;
}

.__filter {
  padding: 1rem;
}

.__activeFilter :deep(.vs__dropdown-toggle) {
  border: 0.1rem solid #4081C2;
  box-shadow: 0px 0px 5px 2px #4081C2;
}

.__activeFilter :deep(span.vs__selected) {
  color: #4081C2;
  font-weight: bold;
}

.__clearFilterBtnText {
  padding-left: 0.4rem;
}

@media only screen and (max-width: 700px) {
  .__filter {
    padding: 0;
    width: 100%;
  }
}
</style>
