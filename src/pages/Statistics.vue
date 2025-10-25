<template>
  <div class="__statistics">
    <div class="__menu">
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === StatisticsScreenType.MEDALS}"
        @click="showScreen(StatisticsScreenType.MEDALS)"
      >
        Medals
      </Button>
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === StatisticsScreenType.CHARTS}"
        @click="showScreen(StatisticsScreenType.CHARTS)"
      >
        Charts
      </Button>
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === StatisticsScreenType.LEADERBOARDS}"
        @click="showScreen(StatisticsScreenType.LEADERBOARDS)"
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
          <RacesDaysBarChart
            :height="1400"
            @click="onChartClick($event)"
          />
        </div>
      </StatisticsSection>
    </keep-alive>

    <keep-alive>
      <StatisticsSection
        v-if="!refreshing && activeScreen === StatisticsScreenType.LEADERBOARDS"
        class="__trackCarMatrixSection"
      >
        <h2
          v-if="Object.keys(leaderboardsData).length"
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

<script lang="ts">
import Leaderboards from '@/components/statistics/Leaderboards.vue'
import Medals from '@/components/statistics/MedalsComponent.vue'
import RacesDaysBarChart, { ChartClickEvent } from '@/components/statistics/RacesDaysBarChart.vue'
import StatisticsSection from '@/components/statistics/StatisticsSection.vue'
import { ScreenType } from '@/constants/ScreenType'
import { StatisticsScreenType } from '@/constants/StatisticsScreenType'
import eb from '@/eventBus'
import { LaptimeFilter } from '@/store/dataStore'
import { Options, Vue } from 'vue-class-component'

@Options({
  components: {
    StatisticsSection,
    Medals,
    RacesDaysBarChart,
    Leaderboards
  }
})
class Statistics extends Vue {
  refreshing = false

  get activeScreen () {
    return this.$statisticsStore.activeScreen
  }

  get leaderboardsData () {
    return this.$statisticsStore.leaderboardsData
  }

  showScreen (screen: StatisticsScreenType) {
    this.$statisticsStore.showScreen(screen)
  }

  mounted () {
    this.handleUrl()
    this.refresh(1000)
  }

  handleUrl () {
    if (this.queryParams.has('section')) {
      const section = this.queryParams.get('section')
      switch (section) {
        case StatisticsScreenType.MEDALS:
          this.showScreen(StatisticsScreenType.MEDALS)
          break
        case StatisticsScreenType.CHARTS:
          this.showScreen(StatisticsScreenType.CHARTS)
          break
        case StatisticsScreenType.LEADERBOARDS:
          this.showScreen(StatisticsScreenType.LEADERBOARDS)
          break
        default:
          console.error('Unknown section: ', section)
      }
    }
  }

  share () {
    if (!navigator || !navigator.clipboard) return
    let url = `${window.location.origin}/?page=statistics`
    url += `&section=${this.$statisticsStore.activeScreen}`

    const { driverId, position, distinct } = this.$statisticsStore.filter
    if (driverId && position && distinct) {
      const name = this.$dataStore.getDriverById(driverId)?.name
      url += `&driver=${name}&position=${position}&distinct=${distinct}`
    }

    navigator.clipboard.writeText(url)
    this.$toast.success('Link copied to clipboard.')
  }

  refresh (delay: number = 0) {
    if (this.refreshing) return

    this.refreshing = true
    setTimeout(() => {
      const laptimes = this.$dataStore.getTimes()
      this.$statisticsStore.refreshData(laptimes)

      this.refreshing = false
    }, delay)
  }

  onChartClick (event: ChartClickEvent) {
    const { label, dataset } = event
    const driver = this.$dataStore.getDriverByName(dataset.label)
    if (!driver) return
    const dateRegex = /(\d+)\. (\d+)\. (\d+)/g
    const matches = label.match(dateRegex)
    if (!matches) return
    const [day, month, year] = matches[0].split('.').map(Number)
    this.$dataStore.showScreen(ScreenType.BROWSE_TIMES)
    eb.emit('filter:clear')
    setTimeout(() => {
      eb.emit('filter:set', { driverId: driver.uid, date: new Date(year, month - 1, day) } as LaptimeFilter)
    }, 500)
  }
}
export default Statistics
</script>

<style scoped lang="scss">
.__statistics {
  padding: 3rem 1rem 1rem;
  padding-bottom: 6rem;
}

.__menu {
  text-align: center;
  .__selected {
    background-color: #242424 !important;
  }
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

  > .__chart {
    background-color: rgba(72, 72, 72, 0.7);
  }
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
  .__statistics {
    padding: 1rem;
  }

  .__controls {
    margin-top: 1rem;

      > button {
      font-size: 0.6rem;
    }
  }
}
</style>
