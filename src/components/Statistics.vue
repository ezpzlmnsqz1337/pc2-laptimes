<template>
  <div class="__statistics">
    <div class="__menu">
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === StatisticsScreenType.MEDALS}"
        @click="showScreen({screen: StatisticsScreenType.MEDALS})"
      >
        Medals
      </Button>
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === StatisticsScreenType.CHARTS}"
        @click="showScreen({screen: StatisticsScreenType.CHARTS})"
      >
        Charts
      </Button>
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === StatisticsScreenType.LEADERBOARDS}"
        @click="showScreen({screen: StatisticsScreenType.LEADERBOARDS})"
      >
        Leaderboards
      </Button>
    </div>

    <div
      v-if="!refreshing"
      class="__controls"
    >
      <Button
        :type="ButtonType.SECONDARY"
        @click="refresh()"
      >
        <div
          class="fa fa-redo"
        /><span>Refresh</span>
      </Button>
      <Button
        :type="ButtonType.SECONDARY"
        @click="share()"
      >
        <div
          class="fa fa-share"
        /><span>Share</span>
      </Button>
    </div>

    <div
      v-if="refreshing"
      class="__loading __center"
    >
      <PulseLoader
        color="#188cff"
        size="15px"
      />
    </div>

    <keep-alive>
      <StatisticsSection
        v-if="!refreshing && activeScreen === StatisticsScreenType.MEDALS"
        class="__generalStatisticsSection"
      >
        <Medals :refresh="refresh" />
      </StatisticsSection>
    </keep-alive>

    <keep-alive>
      <StatisticsSection
        v-if="!refreshing && activeScreen === StatisticsScreenType.CHARTS"
        class="__racesPerDaySection"
      >
        <h2 class="__center">
          Races per day
        </h2>
        <div class="__chart">
          <RacesDaysBarChart :height="1400" />
        </div>
      </StatisticsSection>
    </keep-alive>

    <keep-alive>
      <StatisticsSection
        v-if="!refreshing && activeScreen === StatisticsScreenType.LEADERBOARDS"
        class="__trackCarMatrixSection"
      >
        <h2
          v-if="trackCarBoardData.length"
          class="__center"
        >
          Track times
        </h2>
        <div class="__trackTimes">
          <Leaderboards :refresh="refresh" />
        </div>
      </StatisticsSection>
    </keep-alive>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import StatisticsSection from '@/components/StatisticsSection'
import RacesDaysBarChart from '@/components/RacesDaysBarChart'
import Medals from '@/components/Medals'
import Leaderboards from '@/components/Leaderboards'
import StatisticsScreenType from '@/constants/StatisticsScreenType'

export default {
  name: 'Statistics',
  components: {
    StatisticsSection,
    Medals,
    RacesDaysBarChart,
    Leaderboards
  },
  data () {
    return {
      refreshing: false
    }
  },
  computed: {
    ...mapState(['cars', 'drivers', 'tracks']),
    ...mapState('statistics', ['activeScreen', 'trackCarBoardData']),
    ...mapGetters('statistics', ['getFilter']),
    ...mapGetters(['getDriverById'])
  },
  mounted () {
    this.handleUrl()
    this.refresh()
  },
  methods: {
    ...mapActions(['getTimes']),
    ...mapMutations('statistics', ['showScreen']),
    ...mapActions('statistics', ['refreshData']),
    handleUrl () {
      if (this.queryParams.has('section')) {
        const section = this.queryParams.get('section')
        switch (section) {
          case StatisticsScreenType.MEDALS:
            this.showScreen({ screen: StatisticsScreenType.MEDALS })
            break
          case StatisticsScreenType.CHARTS:
            this.showScreen({ screen: StatisticsScreenType.CHARTS })
            break
          case StatisticsScreenType.LEADERBOARDS:
            this.showScreen({ screen: StatisticsScreenType.LEADERBOARDS })
            break
          default:
            console.error('Unkonwn section: ', section)
        }
      }
    },
    async share () {
      let url = `${window.location.origin}/?page=statistics`
      url += `&section=${this.activeScreen}`

      const { driverId, position, distinct } = this.getFilter()
      if (driverId && position && distinct) {
        const name = this.getDriverById(driverId).name
        url += `&driver=${name}&position=${position}&distinct=${distinct}`
      }

      navigator.clipboard.writeText(url)
      this.$toast.success('Link copied to clipboard.')
    },
    async refresh () {
      if (this.refreshing) return
      this.refreshing = true
      const laptimes = await this.getTimes({ queryLimit: 0 })
      await this.refreshData({ laptimes, tracks: this.tracks, cars: this.cars, drivers: this.drivers })

      this.refreshing = false
    }
  }
}
</script>

<style scoped>
.__statistics {
  padding: 1rem;
  padding-bottom: 6rem;
}

.__menu {
  text-align: center;
}

.__menu .__selected {
  background-color: #242424 !important;
}

.__controls {
  margin-top: 2rem;
  text-align: center;
}

.__controls .fa {
  margin-right: 0.3rem;
}

.__racesPerDaySection {
  padding: 1rem;
}

.__racesPerDaySection > .__chart {
  background-color: rgba(72, 72, 72, 0.7);
  border-radius: 0.3rem;
}

.__center {
  text-align: center;
}

.__loading {
  background-color: transparent !important;
  margin-top: 5rem;
}

.__trackCarMatrixSection {
  padding-top: 1rem;
}

@media only screen and (max-width: 700px) {
.__controls {
    margin-top: 1rem;
  }

  .__controls > button {
    font-size: 0.6rem;
  }
}
</style>
