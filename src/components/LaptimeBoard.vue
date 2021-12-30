<template>
  <div class="__laptimeBoardWrapper">
    <div class="__filter">
      <h1>Filter times</h1>
      <div class="__inputRow">
        <!-- object value -->
        <v-select
          :model-value="carId"
          placeholder="Select car"
          :options="cars"
          :reduce="car => car.uid"
          label="name"
          @update:model-value="setFilter({carId: $event})"
        />
      </div>
      <div class="__inputRow">
        <v-select
          :model-value="trackId"
          placeholder="Select track"
          :options="tracks"
          :reduce="track => track.uid"
          label="track"
          @update:model-value="setFilter({trackId: $event})"
        />
      </div>
      <div
        v-if="trackId"
        class="__inputRow"
      >
        <v-select
          :model-value="trackVariant"
          placeholder="Select track variant"
          :options="getTrackVariants(trackId)"
          @update:model-value="setFilter({trackVariant: $event})"
        />
      </div>
      <div
        class="__inputRow"
      >
        <v-select
          :model-value="driverId"
          placeholder="Select driver"
          :options="drivers"
          :reduce="driver => driver.uid"
          label="name"
          @update:model-value="setFilter({driverId: $event})"
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
          @changed="e => setFilter({transmission: e})"
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
          @changed="e => setFilter({weather: e})"
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
          @changed="e => setFilter({brakingLine: e})"
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
          @changed="e => setFilter({controls: e})"
        />
      </div>
      <Button
        :type="ButtonType.SECONDARY"
        @click="clearFilter()"
      >
        Clear filter
      </Button>
    </div>
    <div class="__laptimeBoard">
      <h2>Laptime board</h2>
      <table>
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
            <div @click="setFilter({driverId: time.driverId})">
              <EditableSelect
                label="name"
                :text="getDriver(time)"
                :options="drivers"
                @value:update="updateLaptime({uid: time.uid, driverId: $event.uid})"
              />
            </div>
          </td>
          <td class="__laptime">
            {{ time.laptime }}
          </td>
          <td class="__car">
            <div @click="setFilter({carId: time.carId})">
              <EditableSelect
                :text="getCarById(time.carId).name"
                :options="cars"
                @value:update="updateLaptime({uid: time.uid, carId: $event.uid})"
              />
            </div>
          </td>
          <td class="__track">
            <div @click="setFilter({trackId: time.trackId})">
              <EditableSelect
                label="track"
                :text="getTrackById(time.trackId).track"
                :options="tracks"
                @value:update="updateLaptime({uid: time.uid, trackId: $event.uid})"
              />
            </div>
            <div @click="setFilter({trackId: time.trackId, trackVariant: time.trackVariant})">
              <EditableSelect
                :text="time.trackVariant"
                :options="getTrackVariants(trackId)"
                @value:update="updateLaptime({uid: time.uid, trackVariant: $event})"
              />
            </div>
          </td>
          <td class="__settings">
            <div @click="setFilter({transmission: time.transmission})">
              <EditableSelect
                :text="time.transmission"
                :options="Object.values(TransmissionType).map(x => ({name: x}))"
                @value:update="updateLaptime({uid: time.uid, transmission: $event.name})"
              />
            </div>
            <div @click="setFilter({weather: time.weather})">
              <EditableSelect
                :text="time.weather"
                :options="Object.values(WeatherType).map(x => ({name: x}))"
                @value:update="updateLaptime({uid: time.uid, weather: $event.name})"
              />
            </div>
            <div @click="setFilter({brakingLine: time.brakingLine})">
              <EditableSelect
                :text="time.brakingLine"
                :options="Object.values(BrakingLine).map(x => ({name: x}))"
                @value:update="updateLaptime({uid: time.uid, brakingLine: $event.name})"
              />
            </div>
            <div @click="setFilter({controls: time.controls})">
              <EditableSelect
                :text="time.controls"
                :options="Object.values(ControlType).map(x => ({name: x}))"
                @value:update="updateLaptime({uid: time.uid, controls: $event.name})"
              />
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'LaptimeBoard',
  computed: {
    ...mapState(['cars', 'tracks', 'drivers']),
    ...mapGetters(['getTimes', 'getCarById', 'getTrackById', 'getDriverById', 'getTrackVariants']),
    ...mapState('laptimeFilter', ['carId', 'trackId', 'trackVariant', 'driverId', 'transmission', 'weather', 'brakingLine', 'controls']),
    ...mapGetters('laptimeFilter', ['getFilter'])
  },
  methods: {
    ...mapMutations('laptimeFilter', ['setFilter', 'clearFilter']),
    ...mapActions(['updateLaptime']),
    getDriver (time) {
      const driver = this.getDriverById(time.driverId)
      return driver ? driver.name : 'Loading'
    }
  }
}
</script>

<style scoped>
.__laptimeBoardWrapper {
  padding: 2rem;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.__laptimeBoard {
  padding: 1rem;
  border-radius: 0.3rem;
}

.__filter {
  padding: 1rem;
}

.__laptimeBoard table {
  min-width: 55vw;
  overflow: hidden;
  border-spacing:0;
  border-radius: 0.3rem;
  font-size: 1rem;
}

th {
  border-bottom: 1px solid var(--border-dark1);
  background-color: #4081c2;
  color: var(--text-light1);
  padding: 1rem 0.5rem;
}

tr:nth-child(even) {
  background-color: #888888;
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

::v-deep tr:nth-child(2) .__driver span {
  color: gold;
  background-color: var(--bg-dark3);
  padding: 0.2rem;
}

::v-deep tr:nth-child(3) .__driver span {
  color: silver;
  background-color: var(--bg-dark3);
  padding: 0.2rem;
}

::v-deep tr:nth-child(4) .__driver span {
  color: #cd7f32;
  background-color: var(--bg-dark3);
  padding: 0.2rem;
}

.__settings:hover {
  cursor: pointer;
}

@media only screen and (max-width: 1024px) {
  .__laptimeBoardWrapper {
    flex-direction: column;
    align-items: center;
  }

  .__laptimeBoard table {
    width: 90vw;
  }

  .__filter {
    width: 50%;
  }
}

@media only screen and (max-width: 700px) {
  .__laptimeBoardWrapper {
    padding: 1rem;
  }

  .__laptimeBoard table {
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

  .__filter {
    padding: 0;
    width: 100%;
  }

  .__laptimeBoard {
    padding: 0;
  }
}
</style>
