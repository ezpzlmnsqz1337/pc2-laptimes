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
    :height="height"
    @click="handleClick($event)"
  />
</template>

<script lang="ts">
import { Laptime } from '@/builders/LaptimeBuilder'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'
import { Bar } from 'vue-chartjs'
import { Options, Vue, prop } from 'vue-class-component'

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
}

@Options({
  components: { Bar },
  emits: ['click']
})
export default class RacesDaysBarChart extends Vue.with(RacesDaysBarChartProps) {
  chartData = {
    labels: [] as string[],
    datasets: [] as any[]
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
      color: 'black',
      padding: 50
    },
    scales: {
      x: {
        grid: { display: false },
        stacked: true,
        ticks: {
          color: '#ffffff',
          tickWidth: 30,
          font: {
            size: 18
          }
        }
      },
      y: {
        stacked: true,
        ticks: {
          color: '#ffffff',
          tickWidth: 30,
          font: {
            size: 18
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
          font: {
            size: 18
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
          size: 18
        },
        padding: 10,
        yAlign: 'bottom'
      }
    }
  }

  chartColors = ['#d9ad96', '#8928c9', '#a7fa55', '#d67840', '#2388eb', '#274db4', '#7cf7ca', '#7027b0',
    '#e32d34', '#000000', '#57aee6', '#ffffff', '#e0ad92']

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

  generateChartData (noOfRaces: RacesByDate) {
    Object.keys(noOfRaces).forEach(date => {
      this.chartData.labels.push(date)
      // total races
      // const tr = this.getDatasetByLabel('Total')
      // tr.data.push(result[date].totalRaces)
      // tr.stack = 'total'

      // every driver
      this.$dataStore.drivers.forEach(({ name }) => {
        const ds = this.getDatasetByLabel(name)
        ds.data.push(noOfRaces[date].drivers[name] || 0)
        ds.stack = 'drivers'
      })
    })

    this.chartData.datasets.forEach((x, index) => {
      x.backgroundColor = this.chartColors[index]
    })
  }

  async getData () {
    // clear chart data
    this.chartData.labels.splice(0)
    this.chartData.datasets.splice(0)

    const laptimes = this.$dataStore.getTimes().sort((a, b) => b.date - a.date)
    const noOfRaces = this.countNumberOfRaces(laptimes)

    this.generateChartData(noOfRaces)
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
</script>
