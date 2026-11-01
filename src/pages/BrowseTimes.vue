<template>
  <div class="__browseTimes">
    <LaptimeFilterComponent
      ref="filterRef"
      :show-filter="showFilter"
      @filter:changed="onFilterChanged($event)"
      @filter:close="toggleFilter()"
    />
    <div class="__laptimeTable">
      <TableControls
        :show-filter="showFilter"
        @filter:toggle="toggleFilter()"
        @share:click="share()"
      />
      <div class="__tableHeading">
        <h2>Laptime board</h2>
        <span class="__count">{{ times.length }} recorded laps</span>
      </div>
      <LaptimeTable
        ref="tableRef"
        :last-added-laptime="lastAddedLaptime"
      />
    </div>
  </div>
</template>

<script lang="ts">
import LaptimeFilterComponent from '@/components/browse-times/LaptimeFilterComponent.vue'
import LaptimeTable from '@/components/laptime-table/LaptimeTable.vue'
import TableControls from '@/components/laptime-table/TableControls.vue'
import { ScreenType } from '@/constants/ScreenType'
import eb from '@/eventBus'
import { LaptimeFilter } from '@/store/dataStore'
import { Options, Vue } from 'vue-class-component'

const URL_FILTER_POLL_INTERVAL_MS = 500
const URL_FILTER_POLL_MAX_TRIES = 20

@Options({
  components: {
    LaptimeFilterComponent,
    LaptimeTable,
    TableControls
  }
})
class BrowseTimes extends Vue {
  showFilter = true

  private urlFilterPollTimer: number | null = null

  $refs!: {
    tableRef: InstanceType<typeof LaptimeTable>,
    filterRef: InstanceType<typeof LaptimeFilterComponent>
  }

  get times () {
    return this.$dataStore.times
  }

  get activeScreen () {
    return this.$dataStore.activeScreen
  }

  get firstLaptime () {
    return this.times[0].laptime
  }

  get lastAddedLaptime () {
    return this.$dataStore.lastAddedLaptime
  }

  created () {
    eb.on('filter:clear', () => this.$refs.filterRef.clearFilter())
    eb.on('filter:set', (filter: LaptimeFilter) => this.$refs.filterRef.setFilter(filter))

    window.addEventListener('keypress', e => this.onKeyPressEvent(e))
  }

  mounted () {
    if (screen.availWidth <= 700) {
      this.toggleFilter()
    }
    this.$refs.tableRef.filterRef = this.$refs.filterRef
    this.$refs.tableRef.loading = true
    this.pollFilterData()
  }

  beforeUnmount () {
    this.stopUrlFilterPoll()
  }

  pollFilterData () {
    let tries = 0
    this.urlFilterPollTimer = window.setInterval(() => {
      tries++
      if (this.queryParams.has('filter') || this.times.length) {
        this.stopUrlFilterPoll()
        this.handleUrl()
      } else if (tries >= URL_FILTER_POLL_MAX_TRIES) {
        this.stopUrlFilterPoll()
        this.$refs.tableRef.loadData()
      }
    }, URL_FILTER_POLL_INTERVAL_MS)
  }

  stopUrlFilterPoll () {
    if (this.urlFilterPollTimer === null) return
    window.clearInterval(this.urlFilterPollTimer)
    this.urlFilterPollTimer = null
  }

  onKeyPressEvent (e: KeyboardEvent) {
    if (this.activeScreen !== ScreenType.BROWSE_TIMES) return
    if (e.target instanceof HTMLElement && e.target.closest('input, select, textarea, [contenteditable="true"]')) return
    if (e.key === 'f') {
      this.toggleFilter()
    } else if (e.key === 'c') {
      this.$refs.filterRef.clearFilter()
    }
  }

  onFilterChanged (filter: LaptimeFilter) {
    this.$refs.tableRef.loadData(filter)
  }

  share () {
    const url = `${window.location.origin}/?page=laptime_board`
    const filter = this.$refs.filterRef.filter
    const encoded = JSON.stringify(filter)

    navigator.clipboard.writeText(`${url}&filter=` + encoded)
    this.$toast.success('Link copied to clipboard.')
  }

  handleUrl () {
    if (this.queryParams.has('filter')) {
      const filter = JSON.parse(this.queryParams.get('filter')!)
      this.$refs.tableRef.addFilter(filter)
      return
    }
    this.$refs.filterRef.setRandomFilter()
  }

  toggleFilter () {
    this.showFilter = !this.showFilter
  }
}

export default BrowseTimes
</script>

<style lang="scss" scoped>
.__laptimeTable {
  width: 100%;
  padding: var(--space-8xl);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow-x: auto;

  h2 {
    margin: 0;
  }
}

.__tableHeading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-8xl);
  flex-wrap: wrap;
  margin: var(--space-10xl) 0 var(--space-8xl);
  text-align: left;
}

.__count {
  color: var(--muted);
  font-size: var(--font-size-compact);
  font-variant-numeric: tabular-nums;
}

.__browseTimes {
  padding: var(--space-11xl) var(--space-8xl) var(--space-8xl);
  margin: 0 auto;
  text-align: left;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: flex-start;
  gap: var(--space-10xl);
}

@media only screen and (max-width: 1024px) {
  .__browseTimes {
    flex-direction: column;
    gap: var(--space-8xl);
  }

  .__laptimeTable {
    padding: var(--space-5xl);
  }
}

@media only screen and (max-width: 700px) {
  .__browseTimes {
    padding: var(--space-8xl) var(--space-5xl);
  }
}
</style>
