<template>
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
  <LaptimeTable />
</template>

<script lang="ts">
import { db } from '@/firebase'
import TableMixin from '@/mixins/TableMixin.vue'
import { collection, onSnapshot, query } from '@firebase/firestore'

export default class LaptimeBoard extends TableMixin {
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
    onSnapshot(q, () => this.$dataStore.refreshTimes())
  }

  async setRandomFilter () {
    this.loading = true
    const times = await this.$dataStore.getTimes(0)
    // select random laptime
    const index = Math.round(Math.random() * times.length)
    const { trackId, trackVariant, carId, weather, game } = times[index]
    this.doAction(this.$laptimeFilterStore.setFilter, { trackId, trackVariant, carId, weather, game })
    this.loading = false
  }

  async doAction (action: Function, params: any) {
    this.loading = true
    await action(params)
    await this.$dataStore.refreshTimes()
    this.loading = true
  }

  async share () {
    const url = `${window.location.origin}/?page=laptime_board`
    const filter = this.$laptimeFilterStore.filter
    const encoded = JSON.stringify(filter)

    navigator.clipboard.writeText(`${url}&filter=` + encoded)
    this.$toast.success('Link copied to clipboard.')
  }

  handleUrl () {
    if (this.queryParams.has('filter')) {
      const filter = JSON.parse(this.queryParams.get('filter')!)
      this.doAction(this.$laptimeFilterStore.setFilter, filter)
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
