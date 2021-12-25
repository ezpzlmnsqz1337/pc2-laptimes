<template>
  <div class="__laptimeBoardWrapper">
    <h1>Filter times</h1>
    <div class="__inputRow">
      <!-- object value -->
      <v-select
        v-model="carId"
        placeholder="Select car"
        :options="cars"
        :reduce="car => car.uid"
        label="name"
      />
    </div>
    <div class="__inputRow">
      <v-select
        v-model="trackId"
        placeholder="Select track"
        :options="tracks"
        :reduce="track => track.uid"
        label="track"
        @change="trackVariant=null"
      />
    </div>
    <div
      v-if="trackId"
      class="__inputRow"
    >
      <v-select
        v-model="trackVariant"
        placeholder="Select track variant"
        :options="getTrackVariants(trackId)"
      />
    </div>
    <div
      class="__inputRow"
    >
      <v-select
        v-model="driverId"
        placeholder="Select driver"
        :options="drivers"
        :reduce="driver => driver.uid"
        label="name"
      />
    </div>
    <div class="__radioHeader">
      Transmission
    </div>
    <div class="__inputRow __noColumn">
      <RadioButtons
        name="transmission"
        :values="Object.values(TransmissionType)"
        :value="transmission"
        @changed="e => transmission = e"
      />
    </div>

    <div class="__radioHeader">
      Weather
    </div>
    <div class="__inputRow __noColumn">
      <RadioButtons
        name="weather"
        :values="Object.values(WeatherType)"
        :value="weather"
        @changed="e => weather = e"
      />
    </div>

    <div class="__radioHeader">
      Braking line
    </div>
    <div class="__inputRow __noColumn">
      <RadioButtons
        name="brakingLine"
        :values="Object.values(BrakingLine)"
        :value="brakingLine"
        @changed="e => brakingLine = e"
      />
    </div>

    <div class="__radioHeader">
      Controls
    </div>
    <div class="__inputRow __noColumn">
      <RadioButtons
        name="controls"
        :values="Object.values(ControlType)"
        :value="controls"
        @changed="e => controls = e"
      />
    </div>
    <Button
      :type="ButtonType.SECONDARY"
      @click="clearFilter()"
    >
      Clear filter
    </Button>
    <br>
    <h2>Laptime board</h2>
    <table class="__laptimeBoard">
      <tr class="__row __header">
        <th>Rank</th>
        <th>Driver</th>
        <th>Laptime</th>
        <th>Car</th>
        <th>Track</th>
        <th>Settings</th>
      </tr>
      <tr
        v-for="(time, index) in getTimes({carId, trackId, trackVariant, driverId, transmission, weather, brakingLine, controls})"
        :key="index"
        class="__row"
      >
        <td class="__id">
          {{ index+1 }}.
        </td>
        <td class="__driver">
          <div @click="driverId = time.driverId">
            <span>{{ getDriver(time) }}</span>
          </div>
        </td>
        <td class="__laptime">
          {{ time.laptime }}
        </td>
        <td class="__car">
          <div @click="carId = time.carId">
            {{ getCarById(time.carId).name }}
          </div>
        </td>
        <td class="__track">
          <div @click="trackId = time.trackId">
            {{ getTrackById(time.trackId).track }}
          </div>
          <div @click="trackId = time.trackId;trackVariant = trackVariant">
            {{ time.trackVariant }}
          </div>
        </td>
        <td class="__settings">
          <div @click="transmission = time.transmission">
            {{ time.transmission }}
          </div>
          <div @click="weather = time.weather">
            {{ time.weather }}
          </div>
          <div @click="brakingLine = time.brakingLine">
            {{ time.brakingLine }}
          </div>
          <div @click="controls = time.controls">
            {{ time.controls }}
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'LaptimeBoard',
  data () {
    return {
      carId: null,
      trackId: null,
      trackVariant: null,
      driverId: null,
      transmission: null,
      weather: null,
      brakingLine: null,
      controls: null
    }
  },
  computed: {
    ...mapState(['cars', 'tracks', 'drivers']),
    ...mapGetters(['getTimes', 'getCarById', 'getTrackById', 'getDriverById', 'getTrackVariants'])
  },
  methods: {
    getDriver (time) {
      console.log('DI: ', time.driverId)
      const driver = this.getDriverById(time.driverId)
      return driver ? driver.name : 'Loading'
    },
    clearFilter () {
      this.carId = null
      this.trackId = null
      this.trackVariant = null
      this.driverId = null
      this.transmission = null
      this.weather = null
      this.brakingLine = null
      this.controls = null
    }
  }
}
</script>

<style scoped>
.__laptimeBoardWrapper {
  padding: 2rem;
  margin: 0 auto;
  text-align: center;
}

.__laptimeBoard {
  width: 100%;
  border-radius: 0.3rem;
  border-spacing:0;
  border-collapse: collapse;
  font-size: 1rem;
}

th {
  border-bottom: 1px solid var(--border-dark1);
  background-color: #4081c2;
  color: var(--text-light1);
  padding: 1rem 0.5rem;
}

tr:nth-child(even) {
  background-color: gray;
}

tr:nth-child(odd) {
  color: var(--text-dark1);
  background-color: white;
}

td {
  padding: 0.5rem;
}

td div:hover {
  cursor: pointer;
  color: var(--hover);
}

.__id, .__driver  {
  font-weight: bold;
}

tr:nth-child(2) .__driver > div > span {
  color: gold;
  background-color: var(--bg-dark3);
  padding: 0.2rem;
}

tr:nth-child(3) .__driver > div > span {
  color: silver;
  background-color: var(--bg-dark3);
  padding: 0.2rem;
}

tr:nth-child(4) .__driver > div > span {
  color: #cd7f32;
  background-color: var(--bg-dark3);
  padding: 0.2rem;
}

.__settings:hover {
  cursor: pointer;
}

@media only screen and (max-width: 700px) {
  .__laptimeBoard {
    font-size: 0.5rem;
  }

  th {
    border-bottom: 1px solid var(--border-dark1);
    background-color: #4081c2;
    color: var(--text-light1);
    padding: 1rem 0.2rem;
  }

  td {
    padding: 0.2rem;
  }
}
</style>
