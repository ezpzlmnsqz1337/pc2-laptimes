<template>
  <div>
    <div
      v-for="d in getDriversData()"
      :key="d.uid"
    >
      {{ d.name }}
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Statistics',
  computed: {
    ...mapState(['drivers', 'tracks'])
  },
  methods: {
    ...mapActions(['getTracksTimes']),
    async getDriversData () {
      const drivers = this.drivers
      const trackTimes = await this.getTracksTimes({ tracks: this.tracks })

      Object.keys(trackTimes).forEach(x => {
        // x is track uid
        trackTimes[x].forEach(y => {
          // y is track time
          console.log(drivers)
        })
      })
    }
  }
}
</script>

<style scoped>
</style>
