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
        @changed="e => controls = e"
      />
    </div>
    <br>
    <h2>Laptime board</h2>
    <table class="__laptimeBoard">
      <tr class="__row __header">
        <th>Rank</th>
        <th>Driver</th>
        <th>Laptime</th>
        <th>Car</th>
        <th>Track</th>
        <th>Track variant</th>
        <th>Transmission</th>
        <th>Weather</th>
        <th>Braking line</th>
        <th>Controls</th>
        <th>Actions</th>
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
          {{ getDriver(time) }}
        </td>
        <td class="__laptime">
          {{ time.laptime }}
        </td>
        <td class="__car">
          {{ getCarById(time.carId).name }}
        </td>
        <td class="__track">
          {{ getTrackById(time.trackId).track }}
        </td>
        <td class="__trackVariant">
          {{ time.trackVariant }}
        </td>
        <td class="__transmission">
          {{ time.transmission }}
        </td>
        <td class="__weather">
          {{ time.weather }}
        </td>
        <td class="__brakingLine">
          {{ time.brakingLine }}
        </td>
        <td class="__controls">
          {{ time.controls }}
        </td>
        <td class="__delete">
          <Button :type="ButtonType.DANGER">
            Delete
          </Button>
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
      const driver = this.getDriverById(time.driverId)
      return driver ? driver.name : 'Loading'
    }
  }
}
</script>

<style>
.__laptimeBoardWrapper {
  padding: 2rem;
  margin: 0 auto;
  text-align: center;
}

.__laptimeBoard {
  width: 100%;
  border: 1px solid white;
  border-radius: 0.3rem;
}

.__laptimeBoard th{
  border-bottom: 1px solid white;
  height: 1rem;
  height: 2rem;
}

.__laptimeBoard .__id, .__laptimeBoard .__driver  {
  font-weight: bold;
}

.__laptimeBoard > tr:nth-child(2) .__driver {
  color: gold;
}

.__laptimeBoard > tr:nth-child(3) .__driver {
  color: silver;
}

.__laptimeBoard > tr:nth-child(4) .__driver {
  color: #cd7f32;
}
</style>
