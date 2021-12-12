<template>
  <Modal
    v-if="showModal"
    @close="showModal = false"
  >
    <template #header>
      <h3>Add driver</h3>
    </template>
    <template #body>
      <input
        v-model="newDriverName"
        class="__modalInput"
        placeholder="Enter driver name"
        type="text"
      >
      <div class="__modalButtons">
        <Button
          :type="ButtonType.DANGER"
          @click="showModal = false"
        >
          Cancel
        </Button>
        <Button
          :type="ButtonType.PRIMARY"
          @click="addDriver()"
        >
          Add
        </Button>
      </div>
    </template>
  </Modal>

  <div class="__timeWrapper">
    <h1>Add Laptime</h1>
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
      <Button
        :type="ButtonType.SUCCESS"
        @click="showModal = true"
      >
        Add
      </Button>
    </div>
    <div class="__inputRow">
      <input
        v-model="laptime"
        type="text"
        class="__laptime"
        :class="{__error: laptimeError}"
        placeholder="0:00.000"
        @input="validateLaptimeFormat()"
      >
    </div>
    <div class="__inputRow">
      <v-select
        v-model="transmission"
        :options="Object.values(TransmissionType)"
        placeholder="Select transmission"
      >
        <template #header>
          <div class="__selectLabel">
            Transmission
          </div>
        </template>
      </v-select>

      <v-select
        v-model="weather"
        :options="Object.values(WeatherType)"
        placeholder="Select weather"
      >
        <template #header>
          <div class="__selectLabel">
            Weather
          </div>
        </template>
      </v-select>

      <v-select
        v-model="brakingLine"
        :options="Object.values(BrakingLine)"
        placeholder="Select braking line"
      >
        <template #header>
          <div class="__selectLabel">
            Breaking line
          </div>
        </template>
      </v-select>
    </div>
    <div class="__inputRow">
      <Button
        :type="ButtonType.PRIMARY"
        block
        class="__submit"
        :disabled="!valid"
        @click="addLaptime({carId, trackId, trackVariant, driverId, laptime, transmission, weather, brakingLine, date: new Date().getTime()})"
      >
        Submit
      </Button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import TransmissionType from '@/constants/TransmissionType'
import WeatherType from '@/constants/WeatherType'
import BrakingLine from '@/constants/BrakingLine'

export default {
  name: 'AddLaptime',
  data () {
    return {
      carId: null,
      trackId: null,
      trackVariant: null,
      driverId: null,
      laptime: '',
      laptimeError: false,
      transmission: TransmissionType.SEQUENTIAL,
      weather: WeatherType.SUN,
      brakingLine: BrakingLine.ON,
      newDriverName: '',
      showModal: false
    }
  },
  computed: {
    ...mapState(['cars', 'tracks', 'drivers', 'times']),
    ...mapGetters(['getTrackVariants']),
    valid () {
      return this.carId && this.trackId && this.trackVariant && this.driverId && this.laptime && !this.laptimeError && this.transmission && this.weather && this.brakingLine
    }
  },
  methods: {
    ...mapActions(['addNewDriver', 'addLaptime']),
    validateLaptimeFormat () {
      this.laptimeError = this.laptime.match(/^\d{1,2}:\d\d\.\d{3}$/) === null
    },
    addDriver () {
      this.addNewDriver({ name: this.newDriverName })
      this.newDriverName = ''
    }
  }
}
</script>

<style>
.__timeWrapper {
  width: 80vw;
  padding: 2rem;
  margin: 0 auto;
  text-align: center;
}

.__inputRow {
  display: flex;
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
}

.__inputRow > input, .__inputRow > .v-select {
  width: 100%;
}

.v-select > .vs__dropdown-toggle {
  background-color: var(--bg-light1);
  border-radius: 0.3rem;
  padding: 0.5rem;
  border: 0.1rem solid black;
}

.__timeWrapper .__laptime {
  text-align: center;
  font-size: 2rem;
}

.__error {
  border: 0.15rem solid !important;
  color: red !important;
  border-color: red !important;
}

.__submit {
  width: 100%;
  font-size: 2rem;
  margin: 0 auto !important;
}

.__selectLabel {
  text-align: left;
}

.__modalButtons {
  display: flex;
  justify-content: flex-end;
}

.__modalInput {
  margin-bottom: 1rem;
  width: 100%;
}

.__brakingLine {
  width: 5rem;
}
</style>
