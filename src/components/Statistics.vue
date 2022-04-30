<template>
  <div class="__statistics">
    <div class="__menu">
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.MEDALS}"
        @click="showScreen({screen: ScreenType.MEDALS})"
      >
        Medals
      </Button>
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.CHARTS}"
        @click="showScreen({screen: ScreenType.CHARTS})"
      >
        Charts
      </Button>
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.LEADERBOARDS}"
        @click="showScreen({screen: ScreenType.LEADERBOARDS})"
      >
        Leaderboards
      </Button>
    </div>

    <div class="__controls">
      <Button
        :type="ButtonType.SECONDARY"
        @click="refresh()"
      >
        <div
          class="fa fa-redo"
        /><span>Refresh</span>
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
        v-if="!refreshing && activeScreen === ScreenType.MEDALS"
        class="__generalStatisticsSection"
      >
        <Medals :refresh="refresh" />
      </StatisticsSection>
    </keep-alive>

    <keep-alive>
      <StatisticsSection
        v-if="!refreshing && activeScreen === ScreenType.CHARTS"
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
        v-if="!refreshing && activeScreen === ScreenType.LEADERBOARDS"
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
import { mapActions, mapMutations, mapState } from 'vuex'
import StatisticsSection from '@/components/StatisticsSection'
import RacesDaysBarChart from '@/components/RacesDaysBarChart'
import Medals from '@/components/Medals'
import Leaderboards from '@/components/Leaderboards'

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
    ...mapState('statistics', ['activeScreen', 'trackCarBoardData'])
  },
  mounted () {
    this.refresh()
  },
  methods: {
    ...mapActions(['getTimes']),
    ...mapMutations('statistics', ['showScreen']),
    ...mapActions('statistics', ['refreshData']),
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

.__controls{
  margin-top: 1rem;
  text-align: center;
}

.__controls .fa {
  margin-right: 0.3rem;
}

.__racesPerDaySection {
  padding: 1rem;
}

.__racesPerDaySection > .__chart {
  background-color: var(--bg-light1);
  border-radius: 0.3rem;
}

.__center {
  text-align: center;
}

.__loading {
  background-color: transparent !important;
  margin-top: 5rem;
}
</style>
