<template>
  <div class="__laptimes">
    <LaptimeFilterComponent
      ref="filter"
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
      <LaptimeTable ref="table" />
    </div>
  </div>
</template>

<script lang="ts">
import LaptimeFilterComponent from '@/components/browse-times/LaptimeFilterComponent.vue'
import LaptimeTable from '@/components/laptime-table/LaptimeTable.vue'
import { LaptimeFilter } from '@/store/dataStore'
import { Options, Vue } from 'vue-class-component'
import TableControls from '@/components/laptime-table/TableControls.vue'

@Options({
  components: {
    LaptimeFilterComponent,
    LaptimeTable,
    TableControls
  }
})
export default class BrowseTimes extends Vue {
  showFilter = true

  $refs!: {
    table: LaptimeTable,
    filter: LaptimeFilterComponent
  }

  get times () {
    return this.$dataStore.times
  }

  get firstLaptime () {
    return this.times[0].laptime
  }

  mounted () {
    if (screen.availWidth >= 700) {
      this.toggleFilter()
    }
    this.$refs.table.filterRef = this.$refs.filter
    setTimeout(() => this.handleUrl(), 500)
  }

  onFilterChanged (filter: LaptimeFilter) {
    this.$refs.table.loadData(filter)
  }

  async share () {
    const url = `${window.location.origin}/?page=laptime_board`
    const filter = this.$refs.filter.filter
    const encoded = JSON.stringify(filter)

    navigator.clipboard.writeText(`${url}&filter=` + encoded)
    this.$toast.success('Link copied to clipboard.')
  }

  handleUrl () {
    if (this.queryParams.has('filter')) {
      const filter = JSON.parse(this.queryParams.get('filter')!)
      this.$refs.table.addFilter(filter)
      return
    }
    this.$refs.filter.setRandomFilter()
  }

  toggleFilter () {
    this.showFilter = !this.showFilter
  }
}
</script>

<style lang="scss" scoped>
.__laptimeTable {
  width: 100%;
  padding: 1rem;
  border-radius: 0.3rem;
}

@media only screen and (max-width: 1024px) {
  .__laptimeTable {
    padding: 0;
  }
}
</style>
