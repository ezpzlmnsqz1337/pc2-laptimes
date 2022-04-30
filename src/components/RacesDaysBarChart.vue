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
              tickWidth: 30
            }
          }
        }
      }
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
    async getData () {
      // clear chart data
      this.chartData.labels.splice(0)
      this.chartData.datasets.splice(0)

      const result = {}

      const laptimes = (await this.getTimes({ queryLimit: 0 })).sort((a, b) => b.date - a.date)
      laptimes.forEach(x => {
        const driverName = this.getDriverById(x.driverId).name
        console.log(driverName)
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

      Object.keys(result).forEach(date => {
        this.chartData.labels.push(date)
        // total races
        // const tr = this.getDataSetByLabel('Total')
        // tr.data.push(result[date].totalRaces)
        // tr.stack = 'total'

        // every driver
        this.drivers.forEach(({ name }) => {
          const ds = this.getDataSetByLabel(name)
          ds.data.push(result[date].drivers[name] || 0)
          ds.stack = 'drivers'
        })
      })

      const colors = [
        '#123456',
        '#423165',
        '#654321',
        '#436521',
        '#346381',
        '#432615',
        '#346251',
        '#432165',
        '#491012',
        '#000000',
        '#ffffff',
        '#524138'
      ]

      this.chartData.datasets.forEach((x, index) => {
        x.backgroundColor = colors[index]
      })
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
