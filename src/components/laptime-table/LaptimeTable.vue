<template>
  <TransitionGroup
    name="list"
    tag="table"
  >
    <tr
      key="header"
      class="__row __header"
    >
      <th v-if="displayColumn('rank')">
        Rank
      </th>
      <th v-if="displayColumn('driver')">
        Driver
      </th>
      <th v-if="displayColumn('laptime')">
        Laptime
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
    <tr
      v-show="!times.length"
      key="loading-row"
    >
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
      :key="time.uid"
      class="__row"
      :class="getRowClass(time)"
      :title="getRowTitleText(time)"
      @click="handleRowClick($event, time)"
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
        />
      </td>
    </tr>
  </TransitionGroup>
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import CarComponent from '@/components/laptime-table/car/CarComponent.vue'
import DriverComponent from '@/components/laptime-table/driver/DriverComponent.vue'
import LaptimeComponent from '@/components/laptime-table/laptime/LaptimeComponent.vue'
import RaceSettings from '@/components/laptime-table/race-settings/RaceSettings.vue'
import TrackComponent from '@/components/laptime-table/track/TrackComponent.vue'
import eb from '@/eventBus'
import { LaptimeFilter } from '@/store/dataStore'
import { Options, prop, Vue } from 'vue-class-component'
import LaptimeFilterComponent from '../browse-times/LaptimeFilterComponent.vue'

export type LaptimeTableColumn = 'rank' | 'driver' | 'laptime' | 'car' | 'track' | 'settings'

export class LaptimeTableProps {
  lastAddedLaptime = prop<Laptime>({ default: null })
  displayColumns = prop<LaptimeTableColumn[]>({ default: ['rank', 'driver', 'laptime', 'car', 'track', 'settings'] })
  rows = prop<Laptime[]>({ default: [] })
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
class LaptimeTable extends Vue.with(LaptimeTableProps) {
  loading = false
  times: Laptime[] = []
  maxRows = 50

  filterRef!: InstanceType<typeof LaptimeFilterComponent>

  created () {
    if (this.rows.length) {
      this.times = this.rows
    }
    eb.on('laptimes:change', () => this.loadData())
  }

  unmounted (): void {
    eb.off('laptimes:change', () => this.loadData())
  }

  getRowClass (laptime: Laptime) {
    return { __lastAddedLaptime: this.lastAddedLaptime && this.lastAddedLaptime.uid === laptime.uid, __hasNotes: laptime.notes }
  }

  getRowTitleText (laptime: Laptime) {
    const date = new Date(laptime.date).toLocaleString()
    let result = `Date: ${date}`
    if (laptime.notes) result += `\nNotes: ${laptime.notes}`
    return result
  }

  handleRowClick (e: MouseEvent, laptime: Laptime) {
    this.$dataStore.setEditLaptime(laptime.uid)
  }

  displayColumn (column: LaptimeTableColumn) {
    return this.displayColumns.includes(column)
  }

  addFilter (filter: LaptimeFilter) {
    if (this.rows.length) return false
    if (this.filterRef) {
      this.filterRef.setFilter(filter)
    } else {
      this.loadData(filter)
    }
  }

  loadData (filter?: LaptimeFilter) {
    setTimeout(() => {
      if (this.rows.length > 0) return
      if (!filter && this.filterRef) filter = this.filterRef.filter
      this.loading = true
      this.$nextTick(() => {
        this.times = this.$dataStore.getTimes(filter).slice(0, this.maxRows)
        this.loading = false
      })
    })
  }
}
export default LaptimeTable
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

.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(100vw);
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}

</style>
