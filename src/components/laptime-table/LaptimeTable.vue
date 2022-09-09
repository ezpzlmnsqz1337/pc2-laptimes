<template>
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

    <tr v-show="!times.length">
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
      :class="getRowClass(time)"
      :title="getRowTitleText(time)"
      @click="handleRowClick(time)"
    >
      <td class="__id">
        {{ index + 1 }}.
      </td>

      <td class="__driver">
        <DriverComponent
          :time="time"
          :editable="true"
          @click="setFilter($event)"
          @value:update="updateLaptime($event, time)"
        />
      </td>

      <td class="__laptime">
        <LaptimeComponent
          :show-diff="index > 0"
          :first-place="times[0]"
          :time="time"
        />
      </td>

      <td class="__car">
        <CarComponent
          :time="time"
          :editable="true"
          @click="setFilter($event)"
          @value:update="updateLaptime($event, time)"
        />
      </td>

      <td class="__track">
        <TrackComponent
          :time="time"
          :editable="true"
          @click="setFilter($event)"
          @value:update="updateLaptime($event, time)"
        />
      </td>

      <td class="__settings">
        <RaceSetting
          :editable="true"
          :time="time"
        />
      </td>
    </tr>
  </table>
</template>

<script lang="ts">
import RaceSettings from '@/components/laptime-table/race-settings/RaceSettings.vue'
import TrackComponent from '@/components/laptime-table/TrackComponent.vue'
import CarComponent from '@/components/laptime-table/CarComponent.vue'
import DriverComponent from '@/components/laptime-table/DriverComponent.vue'
import LaptimeComponent from '@/components/laptime-table/LaptimeComponent.vue'
import { Laptime } from '@/builders/LaptimeBuilder'
import { Options, prop, Vue } from 'vue-class-component'

export type LaptimeTableColumn = 'rank' | 'driver' | 'laptime' | 'car' | 'track' | 'settings'

export class LaptimeTableProps {
  lastAddedLaptime = prop<Laptime>({ default: null })
  times = prop<Laptime[]>({ default: [] })
  displayColumns = prop<LaptimeTableColumn[]>({ required: true })
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

  setFilter (e: any) {
    this.$laptimeFilterStore.setFilter(e)
  }

  updateLaptime (e: any, time: Laptime) {
    this.$dataStore.updateLaptime({ uid: time.uid, [e.type]: e.value })
  }
}
</script>
