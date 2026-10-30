<template>
  <Bar
    ref="myChart"
    :chart-options="chartOptions"
    :chart-data="chartData"
    :chart-id="chartId"
    :dataset-id-key="datasetIdKey"
    :plugins="plugins"
    :css-classes="cssClasses"
    :styles="styles"
    :width="width"
    :height="computedHeight"
    @click="handleClick($event)"
  />
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import { cssVariable } from '@/utils/cssVariable'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { Bar } from 'vue-chartjs'
import { Options, Vue, prop } from 'vue-class-component'

const CHART_LAYOUT_PADDING = 50
const CHART_TICK_WIDTH = 30
const CHART_FONT_SIZE = 18

const CHART_COLOR_TOKENS = [
  '--chart-color-1',
  '--chart-color-2',
  '--chart-color-3',
  '--chart-color-4',
  '--chart-color-5',
  '--chart-color-6',
  '--chart-color-7',
  '--chart-color-8',
  '--chart-color-9',
  '--chart-color-10',
  '--chart-color-11',
  '--chart-color-12',
  '--chart-color-13'
]

interface Drivers {
  [name: string]: number
}

interface RacesAndDrivers {
  totalRaces: number
  drivers: Drivers
}

interface RacesByDate {
  [date: string]: RacesAndDrivers
}

export interface ChartClickEvent {
  label: string
  dataset: any
}

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

class RacesDaysBarChartProps {
  chartId = prop<string>({ default: 'bar-chart' })
  datasetIdKey = prop<string>({ default: 'label' })
  width = prop<number>({ default: 400 })
  height = prop<number>({ default: 400 })
  cssClasses = prop<string>({ default: '' })
  styles = prop<object>({ default: () => {} })
  plugins = prop<object>({ default: () => {} })
  filterYear = prop<string | null>({ default: null })
}

@Options({
  components: { Bar },
  emits: ['click'],
  watch: {
    filterYear () {
      this.getData()
    }
  }
})
class RacesDaysBarChart extends Vue.with(RacesDaysBarChartProps) {
  chartData = {
    labels: [] as string[],
    datasets: [] as any[]
  }

  get computedHeight () {
    const barHeight = 30
    return Math.max(400, this.chartData.labels.length * barHeight)
  }

  $refs!: {
    myChart: InstanceType<typeof Bar>,
  }

  chartOptions = {
    responsive: true,
    indexAxis: 'y',
    font: {
      family: "'Open Sans', Helvetica, Arial, sans-serif"
    },
    layout: {
      color: cssVariable('--text-dark1'),
      padding: CHART_LAYOUT_PADDING
    },
    scales: {
      x: {
        grid: { display: false },
        stacked: true,
        ticks: {
          color: cssVariable('--text-light1'),
          tickWidth: CHART_TICK_WIDTH,
          font: {
            size: CHART_FONT_SIZE
          }
        }
      },
      y: {
        stacked: true,
        grid: { display: false },
        ticks: {
          color: cssVariable('--text-light1'),
          tickWidth: CHART_TICK_WIDTH,
          font: {
            size: CHART_FONT_SIZE
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: cssVariable('--text-light1'),
          font: {
            size: CHART_FONT_SIZE
          },
          padding: 10
        }
      },
      tooltip: {
        position: 'average',
        titleSpacing: 0,
        titleMarginBottom: 0,
        titleFont: {
          size: 0
        },
        displayColors: false,
        bodyFont: {
          size: CHART_FONT_SIZE
        },
        padding: 10,
        yAlign: 'bottom'
      }
    }
  }

  get chartColors (): string[] {
    return CHART_COLOR_TOKENS.map(token => cssVariable(token))
  }

  mounted () {
    this.getData()
  }

  countNumberOfRaces (laptimes: Laptime[]): RacesByDate {
    const result = {} as RacesByDate
    laptimes.forEach(x => {
      const driverName = this.$dataStore.getDriverById(x.driverId)!.name
      const date = new Date(x.date).toLocaleDateString()
      if (!result[date]) {
        result[date] = { totalRaces: 0, drivers: {} }
      }
      result[date].totalRaces += 1
      if (!result[date].drivers[driverName]) {
        result[date].drivers[driverName] = 0
      }
      result[date].drivers[driverName] += 1
    })
    return result
  }

  generateChartData (noOfRaces: RacesByDate, activeDrivers: string[]) {
    Object.keys(noOfRaces).forEach(date => {
      this.chartData.labels.push(date)

      activeDrivers.forEach(name => {
        const ds = this.getDatasetByLabel(name)
        ds.data.push(noOfRaces[date].drivers[name] || 0)
        ds.stack = 'drivers'
      })
    })

    this.chartData.datasets.forEach((x, index) => {
      x.backgroundColor = this.chartColors[index % this.chartColors.length]
    })
  }

  async getData () {
    this.chartData.labels.splice(0)
    this.chartData.datasets.splice(0)

    const all = this.$dataStore.getTimes().sort((a, b) => b.date - a.date)
    const laptimes = this.filterYear
      ? all.filter(t => new Date(t.date).getFullYear()
        .toString() === this.filterYear)
      : all
    const noOfRaces = this.countNumberOfRaces(laptimes)

    const activeDrivers = new Set<string>()
    Object.values(noOfRaces).forEach(d => Object.keys(d.drivers).forEach(n => activeDrivers.add(n)))

    this.generateChartData(noOfRaces, Array.from(activeDrivers).sort())
  }

  getDatasetByLabel (label: string) {
    let ds = this.chartData.datasets.find(x => x.label === label)
    if (!ds) {
      ds = { label, data: [] }
      this.chartData.datasets.push(ds)
    }
    return ds
  }

  handleClick (event: PointerEvent) {
    const chart = this.$refs.myChart.chart as ChartJS
    const activePoints = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true)
    if (activePoints.length > 0) {
      const { index, datasetIndex } = activePoints[0]
      const dataset = chart.data.datasets![datasetIndex]
      const label = chart.data.labels![index]
      this.$emit('click', { label, dataset } as ChartClickEvent)
    }
  }
}

export default RacesDaysBarChart
</script>
