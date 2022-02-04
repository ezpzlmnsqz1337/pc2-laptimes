<template>
  <div class="__statistics">
    <div class="__totalRacesSection">
      <h2>Total races</h2>
      <table class="__totalRacesTable">
        <tr
          v-for="tr in totalRaces"
          :key="tr.driver"
          class="__driver"
        >
          <td class="__name">
            {{ tr.driver }}
          </td><td class="__totalRaces">
            {{ tr.races }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Statistics',
  data () {
    return {
      totalRaces: []
    }
  },
  computed: {
    ...mapState(['drivers', 'tracks'])
  },
  mounted () {
    setTimeout(() => {
      this.drivers.forEach(async x => {
        const times = await this.getTimesForDriver({ driverId: x.uid })
        this.totalRaces.push({ driver: x.name, races: times.length })
      })
    }, 2000)
  },
  methods: {
    ...mapActions(['getTracksTimes', 'getTimesForDriver']),
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
.__statistics {
  padding: 1rem;
}

.__totalRacesTable {
  border: 0.1rem solid white;
}

</style>
