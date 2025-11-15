<template>
  <div
    class="__browseTimes"
    @keypress="onKeyPressEvent($event)"
  >
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
      <h2>Laptime board</h2>
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

@Options({
  components: {
    LaptimeFilterComponent,
    LaptimeTable,
    TableControls
  }
})
class BrowseTimes extends Vue {
  showFilter = true

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
    setTimeout(() => this.handleUrl(), 500)
  }

  onKeyPressEvent (e: KeyboardEvent) {
    if (this.activeScreen !== ScreenType.BROWSE_TIMES) return
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
  padding: 1rem;
}

.__browseTimes {
  padding: 3rem 1rem 1rem;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
}

@media only screen and (max-width: 1024px) {
  .__browseTimes {
    flex-direction: column;
  }

  .__laptimeTable {
    padding: 0;
  }
}

@media only screen and (max-width: 700px) {
  .__browseTimes {
    padding: 1rem;
  }
}
</style>
