<template>
  <table>
    <tr class="__row __header">
      <th v-if="displayColumn('rank')">
        Rank
      </th>
      <th v-if="displayColumn('driver')">
        Driver
      </th>
      <th v-if="displayColumn('laptime')">
        Laptime
      </th>
      <th
        v-if="displayColumn('laptime')"
        class="__losing_lg"
      >
        Losing
      </th>
      <th v-if="displayColumn('car')">
        Car
      </th>
      <th v-if="displayColumn('track')">
        Track
      </th>
      <th v-if="displayColumn('settings')">
        Settings
      </th>
    </tr>

    <tr v-show="!times.length">
      <td
        colspan="999"
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
      :class="getRowClass(time)"
      :title="getRowTitleText(time)"
      @click="handleRowClick(time)"
    >
      <td
        v-if="displayColumn('rank')"
        class="__id"
      >
        {{ index + 1 }}.
      </td>

      <td
        v-if="displayColumn('driver')"
        class="__driver"
      >
        <DriverComponent
          :time="time"
          :editable="true"
          @click="addFilter($event)"
          @value:update="updateLaptime($event, time)"
        />
      </td>

      <td
        v-if="displayColumn('laptime')"
        class="__laptime"
      >
        <LaptimeComponent
          :show-diff="index > 0"
          :first-place="times[0]"
          :time="time"
        />
      </td>

      <td
        v-if="displayColumn('car')"
        class="__car"
      >
        <CarComponent
          :time="time"
          :editable="true"
          @click="addFilter($event)"
          @value:update="updateLaptime($event, time)"
        />
      </td>

      <td
        v-if="displayColumn('track')"
        class="__track"
      >
        <TrackComponent
          :time="time"
          :editable="true"
          @click="addFilter($event)"
          @value:update="updateLaptime($event, time)"
        />
      </td>

      <td
        v-if="displayColumn('settings')"
        class="__settings"
      >
        <RaceSettings
          :editable="true"
          :time="time"
          @click="addFilter($event)"
          @value:update="updateLaptime($event, time)"
        />
      </td>
    </tr>
  </table>
</template>

<script lang="ts">
import RaceSettings from '@/components/laptime-table/race-settings/RaceSettings.vue'
import TrackComponent from '@/components/laptime-table/track/TrackComponent.vue'
import CarComponent from '@/components/laptime-table/car/CarComponent.vue'
import DriverComponent from '@/components/laptime-table/driver/DriverComponent.vue'
import LaptimeComponent from '@/components/laptime-table/laptime/LaptimeComponent.vue'
import { Laptime } from '@/builders/LaptimeBuilder'
import { Options, prop, Vue } from 'vue-class-component'
import { LaptimeFilter } from '@/store/dataStore'
import LaptimeFilterComponent from '../browse-times/LaptimeFilterComponent.vue'
import _debounce from 'debounce'

export type LaptimeTableColumn = 'rank' | 'driver' | 'laptime' | 'car' | 'track' | 'settings'

export class LaptimeTableProps {
  lastAddedLaptime = prop<Laptime>({ default: null })
  displayColumns = prop<LaptimeTableColumn[]>({ default: ['rank', 'driver', 'laptime', 'car', 'track', 'settings'] })
}

@Options({
  components: {
    RaceSettings,
    CarComponent,
    TrackComponent,
    DriverComponent,
    LaptimeComponent
  }
})
export default class LaptimeTable extends Vue.with(LaptimeTableProps) {
  loading = true
  times: Laptime[] = []
  filter!: LaptimeFilterComponent
  debouncedLoadData = _debounce(this._loadData, 300, true)

  getRowClass (laptime: Laptime) {
    return { __lastAddedLaptime: this.lastAddedLaptime && this.lastAddedLaptime.uid === laptime.uid, __hasNotes: laptime.notes }
  }

  getRowTitleText (laptime: Laptime) {
    const date = new Date(laptime.date).toLocaleString()
    let result = `Date: ${date}`
    if (laptime.notes) result += `\nNotes: ${laptime.notes}`
    return result
  }

  handleRowClick (laptime: Laptime) {
    this.$toast.info(laptime.notes || 'No comment')
  }

  displayColumn (column: LaptimeTableColumn) {
    return this.displayColumns.includes(column)
  }

  addFilter (filter: { type: string, value: string }) {
    const laptimeFilter = { [filter.type]: filter.value } as LaptimeFilter
    if (this.filter) {
      this.filter.setFilter(laptimeFilter)
    } else {
      this.loadData(laptimeFilter)
    }
  }

  loadData (filter: LaptimeFilter) {
    console.log('L: ', this.times.length)
    this.times = this.debouncedLoadData(filter)
  }

  private _loadData (filter: LaptimeFilter) {
    console.table(filter)
    return this.$dataStore.getTimes(filter)
  }

  updateLaptime (e: any, time: Laptime) {
    this.$dataStore.updateLaptime({ uid: time.uid, [e.type]: e.value })
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/css/table.css';
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
