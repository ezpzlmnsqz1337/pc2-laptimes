<template>
  <div class="__laptimeBoard">
    <h2>Laptime board</h2>
    <table>
      <tr class="__row __header">
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
        v-for="(time, index) in times"
        :key="index"
        class="__row"
        :title="getRowTitleText(time)"
      >
        <td class="__id">
          {{ index+1 }}.
        </td>
        <td class="__driver">
          <div @click="setFilter({driverId: time.driverId})">
            <EditableSelect
              label="name"
              :text="getDriver(time)"
              :options="drivers"
              @value:update="updateLaptime({uid: time.uid, driverId: $event.uid})"
            />
          </div>
        </td>
        <td class="__laptime">
          <div>{{ time.laptime }}</div>
          <div
            v-if="index > 0"
            class="__losing __losing_sm"
          >
            {{ $ltb.getLaptimeDiff(firstLaptime, time.laptime) }}
          </div>
        </td>
        <td class="__losing __losing_lg">
          <span v-if="index > 0">{{ $ltb.getLaptimeDiff(firstLaptime, time.laptime) }}</span>
        </td>
        <td class="__car">
          <div @click="setFilter({carId: time.carId})">
            <EditableSelect
              :text="getCarById(time.carId).name"
              :options="cars"
              @value:update="updateLaptime({uid: time.uid, carId: $event.uid})"
            />
          </div>
        </td>
        <td class="__track">
          <div @click="setFilter({trackId: time.trackId})">
            <EditableSelect
              label="track"
              :text="getTrackById(time.trackId).track"
              :options="tracks"
              @value:update="updateLaptime({uid: time.uid, trackId: $event.uid})"
            />
          </div>
          <div @click="setFilter({trackId: time.trackId, trackVariant: time.trackVariant})">
            <EditableSelect
              :text="time.trackVariant"
              :options="getTrackVariants(trackId)"
              @value:update="updateLaptime({uid: time.uid, trackVariant: $event})"
            />
          </div>
        </td>
        <td class="__settings">
          <div
            :class="transmissionClass(time.transmission)"
            @click="setFilter({transmission: time.transmission})"
          >
            <EditableSelect
              :text="time.transmission"
              :icon="time.transmission"
              :options="Object.values(TransmissionType).map(x => ({name: x}))"
              @value:update="updateLaptime({uid: time.uid, transmission: $event.name})"
            />
          </div>
          <div
            :class="weatherClass(time.weather)"
            @click="setFilter({weather: time.weather})"
          >
            <EditableSelect
              :text="time.weather"
              :icon="weatherIcon(time.weather)"
              :options="Object.values(WeatherType).map(x => ({name: x}))"
              @value:update="updateLaptime({uid: time.uid, weather: $event.name})"
            />
          </div>
          <div
            :class="brakingLineClass(time.brakingLine)"
            @click="setFilter({brakingLine: time.brakingLine})"
          >
            <EditableSelect
              :text="time.brakingLine"
              :icon="time.brakingLine === BrakingLine.ON ? 'check-circle' : 'times-circle'"
              :options="Object.values(BrakingLine).map(x => ({name: x}))"
              @value:update="updateLaptime({uid: time.uid, brakingLine: $event.name})"
            />
          </div>
          <div
            :class="controlsClass(time.controls)"
            @click="setFilter({controls: time.controls})"
          >
            <EditableSelect
              :text="time.controls"
              :icon="time.controls"
              :options="Object.values(ControlType).map(x => ({name: x}))"
              @value:update="updateLaptime({uid: time.uid, controls: $event.name})"
            />
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import tableMixin from '@/mixins/tableMixin'

export default {
  name: 'LaptimeBoard',
  mixins: [tableMixin],
  computed: {
    ...mapState(['cars', 'tracks', 'drivers', 'times']),
    ...mapGetters(['getCarById', 'getTrackById', 'getTrackVariants']),
    ...mapState('laptimeFilter', ['carId', 'trackId', 'trackVariant', 'driverId', 'transmission', 'weather', 'brakingLine', 'controls', 'startType', 'distinct']),
    firstLaptime () {
      return this.times[0].laptime
    }
  },
  methods: {
    ...mapMutations(['setTimes']),
    ...mapMutations('laptimeFilter', { sf: 'setFilter', cf: 'clearFilter' }),
    ...mapActions(['refreshTimes', 'getTimes']),
    ...mapActions({ ul: 'updateLaptime' }),
    async updateLaptime (laptime) {
      if (!laptime) return
      await this.ul(laptime)
      this.refreshTimes()
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
@import '../assets/css/table.css';

.__laptimeBoard {
  padding: 1rem;
  border-radius: 0.3rem;
}

@media only screen and (max-width: 1024px) {
  .__laptimeBoard {
    padding: 0;
  }
}
</style>
