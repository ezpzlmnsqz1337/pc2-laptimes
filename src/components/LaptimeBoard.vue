<template>
  <div class="__laptimeBoard">
    <div class="__tableControls">
      <Button
        v-if="!showFilter"
        class="__showFilter"
        :type="ButtonType.SECONDARY"
        @click="toggleFilter()"
      >
        <div
          class="fa fa-filter"
        /><span>Filter</span>
      </Button>
      <Button
        class="__share"
        :type="ButtonType.SECONDARY"
        @click="share()"
      >
        <div
          class="fa fa-share"
        /><span>Share</span>
      </Button>
    </div>
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
        v-show="!times.length"
      >
        <td
          colspan="7"
          class="__loading"
        >
          <PulseLoader
            v-if="loading"
            color="#188cff"
            size="15px"
          />
          <span
            v-if="!loading"
            class="__noLaptimesFound"
          >No laptimes found matching your filter.</span>
        </td>
      </tr>
      <tr
        v-for="(time, index) in times"
        :key="index"
        class="__row"
        :class="{ __lastAddedLaptime: lastAddedLaptime && lastAddedLaptime.uid === time.uid, __hasNotes: time.notes}"
        :title="getRowTitleText(time)"
        @click="$toast.info(time.notes || 'No comment')"
      >
        <td class="__id">
          {{ index+1 }}.
        </td>
        <td class="__driver">
          <div @click="doAction(setFilter, {driverId: time.driverId})">
            <EditableSelect
              label="name"
              :text="getDriver(time)"
              :options="drivers"
              @value:update="doAction(updateLaptime, {uid: time.uid, driverId: $event.uid})"
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
          <img
            v-if="getCarImage(time)"
            :src="getCarImage(time)"
            :alt="getCar(time)"
          >
          <div @click="doAction(setFilter, {carId: time.carId})">
            <EditableSelect
              :text="getCarById(time.carId).name"
              :options="cars"
              @value:update="doAction(updateLaptime, {uid: time.uid, carId: $event.uid})"
            />
          </div>
        </td>
        <td class="__track">
          <div @click="doAction(setFilter, {trackId: time.trackId})">
            <EditableSelect
              label="track"
              :text="getTrackById(time.trackId).track"
              :options="tracks"
              @value:update="doAction(updateLaptime, {uid: time.uid, trackId: $event.uid})"
            />
          </div>
          <div @click="doAction(setFilter, {trackId: time.trackId, trackVariant: time.trackVariant})">
            <EditableSelect
              :text="time.trackVariant"
              :options="getTrackVariants(trackId)"
              @value:update="doAction(updateLaptime, {uid: time.uid, trackVariant: $event})"
            />
          </div>
        </td>
        <td class="__settings">
          <div
            :class="transmissionClass(time.transmission)"
            @click="doAction(setFilter, {transmission: time.transmission})"
          >
            <EditableSelect
              :text="time.transmission"
              :icon="transmissionIcon(time.transmission)"
              :options="Object.values(TransmissionType).map(x => ({name: x}))"
              @value:update="doAction(updateLaptime, {uid: time.uid, transmission: $event.name})"
            />
          </div>
          <div
            :class="weatherClass(time.weather)"
            @click="doAction(setFilter, {weather: time.weather})"
          >
            <EditableSelect
              :text="time.weather"
              :icon="weatherIcon(time.weather)"
              :options="Object.values(WeatherType).map(x => ({name: x}))"
              @value:update="doAction(updateLaptime, {uid: time.uid, weather: $event.name})"
            />
          </div>
          <div
            :class="brakingLineClass(time.brakingLine)"
            @click="doAction(setFilter, {brakingLine: time.brakingLine})"
          >
            <EditableSelect
              :text="time.brakingLine"
              :icon="time.brakingLine === BrakingLine.ON ? 'check-circle' : 'times-circle'"
              :options="Object.values(BrakingLine).map(x => ({name: x}))"
              @value:update="doAction(updateLaptime, {uid: time.uid, brakingLine: $event.name})"
            />
          </div>
          <div
            :class="controlsClass(time.controls)"
            @click="doAction(setFilter, {controls: time.controls})"
          >
            <EditableSelect
              :text="time.controls"
              :icon="time.controls"
              :options="Object.values(ControlType).map(x => ({name: x}))"
              @value:update="doAction(updateLaptime, {uid: time.uid, controls: $event.name})"
            />
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import TableMixin from '@/mixins/tableMixin'
import { db } from '@/firebase'
import { collection, onSnapshot, query } from '@firebase/firestore'
import { mixins } from 'vue-class-component'

export default class LaptimeBoard extends mixins(TableMixin) {
  loading = true

  get times () {
    return this.$dataStore.times
  }

  get firstLaptime () {
    return this.times[0].laptime
  }

  mounted () {
    setTimeout(() => this.handleUrl(), 500)
    this.watchForChanges()
  }

  watchForChanges () {
    const q = query(collection(db, 'times'))
    onSnapshot(q, () => this.refreshTimes())
  }

  async setRandomFilter () {
    this.loading = true
    const times = await this.getTimes(0)
    // select random laptime
    const index = Math.round(Math.random() * times.length)
    const { trackId, trackVariant, carId, weather, game } = times[index]
    this.doAction(this.setFilter, { trackId, trackVariant, carId, weather, game })
    this.loading = false
  }

  async doAction (action: Function, params: any) {
    this.loading = true
    await action(params)
    await this.refreshTimes()
    this.loading = true
  }

  async share () {
    const url = `${window.location.origin}/?page=laptime_board`
    const filter: any = {}
    if (this.carId) filter.carId = this.carId
    if (this.trackId) filter.trackId = this.trackId
    if (this.trackVariant) filter.trackVariant = this.trackVariant
    if (this.driverId) filter.driverId = this.driverId
    if (this.transmission) filter.transmission = this.transmission
    if (this.weather) filter.weather = this.weather
    if (this.brakingLine) filter.brakingLine = this.brakingLine
    if (this.controls) filter.controls = this.controls
    if (this.startType) filter.startType = this.startType
    if (this.game) filter.game = this.game
    if (this.distinct) filter.distinct = this.distinct
    const encoded = JSON.stringify(filter)

    navigator.clipboard.writeText(`${url}&filter=` + encoded)
    this.$toast.success('Link copied to clipboard.')
  }

  handleUrl () {
    if (this.queryParams.has('filter')) {
      const filter = JSON.parse(this.queryParams.get('filter'))
      this.doAction(this.setFilter, filter)
      return
    }
    this.setRandomFilter()
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/css/table.css';

.__laptimeBoard {
  width: 100%;
  padding: 1rem;
  border-radius: 0.3rem;
}

@media only screen and (max-width: 1024px) {
  .__laptimeBoard {
    padding: 0;
  }
}

.__lastAddedLaptime {
  --blink-color: #3a9ee0;
  animation: blink 1s 10;
}

@keyframes blink {
  0% { box-shadow: inset 0 0 1.5rem 0.8rem var(--blink-color); }
  50% { box-shadow: inset 0 0 0 0 var(--blink-color); }
  100% { box-shadow: inset 0 0 1.5rem 0.8rem var(--blink-color); }
}

.__tableControls {
  position: relative;

  .__share {
    position: absolute;
    right: 0;
    top: 0;
  }
  .__showFilter {
    position: absolute;
    left: 0;
    top: 0;
  }
}

@media only screen and (max-width: 700px) {
  .__tableControls button {
    font-size: 0.6rem;
  }
}
</style>
