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
  />
</template>

<script>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { mapActions, mapGetters, mapState } from 'vuex'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'BarChart',
  components: { Bar },
  props: {
    chartId: {
      type: String,
      default: 'bar-chart'
    },
    datasetIdKey: {
      type: String,
      default: 'label'
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 400
    },
    cssClasses: {
      default: '',
      type: String
    },
    styles: {
      type: Object,
      default: () => {}
    },
    plugins: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      chartData: {
        labels: [],
        datasets: []
      },
      chartOptions: {
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
            stacked: true
          },
          y: {
            stacked: true,
            ticks: {
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
      },
      chartColors: ['#8928c9', '#d9ad96', '#a7fa55', '#2388eb', '#d67840', '#7cf7ca', '#1d6ebe',
        '#e32d34', '#7027b0', '#000000', '#57aee6', '#ffffff', '#e0ad92']
    }
  },
  computed: {
    ...mapGetters(['getDriverById']),
    ...mapState(['drivers'])
  },
  mounted () {
    this.getData()
  },
  methods: {
    ...mapActions(['getTimes']),
    countNumberOfRaces (laptimes) {
      const result = {}
      laptimes.forEach(x => {
        const driverName = this.getDriverById(x.driverId).name
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
    },
    generateChartData (noOfRaces) {
      Object.keys(noOfRaces).forEach(date => {
        this.chartData.labels.push(date)
        // total races
        // const tr = this.getDataSetByLabel('Total')
        // tr.data.push(result[date].totalRaces)
        // tr.stack = 'total'

        // every driver
        this.drivers.forEach(({ name }) => {
          const ds = this.getDataSetByLabel(name)
          ds.data.push(noOfRaces[date].drivers[name] || 0)
          ds.stack = 'drivers'
        })
      })

      this.chartData.datasets.forEach((x, index) => {
        x.backgroundColor = this.chartColors[index]
      })
    },
    async getData () {
      // clear chart data
      this.chartData.labels.splice(0)
      this.chartData.datasets.splice(0)

      const laptimes = (await this.getTimes({ queryLimit: 0 })).sort((a, b) => b.date - a.date)
      const noOfRaces = this.countNumberOfRaces(laptimes)

      this.generateChartData(noOfRaces)
    },
    getDataSetByLabel (label) {
      let ds = this.chartData.datasets.find(x => x.label === label)
      if (!ds) {
        ds = { label, data: [] }
        this.chartData.datasets.push(ds)
      }
      return ds
    }
  }
}
</script>
