<template>
  <Modal
    v-if="showNewDriverModal"
    @close="showNewDriverModal = false"
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
          @click="showNewDriverModal = false"
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

  <Modal
    v-if="showNewCarModal"
    @close="showNewCarModal = false"
  >
    <template #header>
      <h3>Add Car</h3>
    </template>
    <template #body>
      <input
        v-model="newCarName"
        class="__modalInput"
        placeholder="Enter car name"
        type="text"
      >
      <div class="__modalButtons">
        <Button
          :type="ButtonType.DANGER"
          @click="showNewCarModal = false"
        >
          Cancel
        </Button>
        <Button
          :type="ButtonType.PRIMARY"
          @click="addCar()"
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
      <Button
        :type="ButtonType.SUCCESS"
        @click="showNewCarModal = true"
      >
        Add
      </Button>
    </div>
    <div class="__inputRow">
      <v-select
        v-model="trackId"
        placeholder="Select track"
        :options="tracks"
        :reduce="track => track.uid"
        label="track"
        @option:selected="trackVariant=getTrackVariants($event.uid)[0]"
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
        @click="showNewDriverModal = true"
      >
        Add
      </Button>
    </div>
    <div class="__inputRow">
      <div
        class="__lapTimeInputs"
        :class="{__error: laptimeError}"
      >
        <input
          v-model="minutes"
          type="text"
          class="__minutes"
          placeholder="0"
          @input="validateLaptimeFormat()"
        >
        <div class="__colon">
          :
        </div>
        <input
          v-model="seconds"
          type="text"
          class="__seconds"
          placeholder="00"
          @input="validateLaptimeFormat()"
        >
        <div class="__dot">
          .
        </div>
        <input
          v-model="milliseconds"
          type="text"
          class="__milliseconds"
          placeholder="000"
          @input="validateLaptimeFormat()"
        >
      </div>
    </div>
    <div class="__radioHeader">
      Transmission
    </div>
    <div class="__inputRow __noColumn">
      <RadioButtons
        no-any
        name="ALtransmission"
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
        no-any
        name="ALweather"
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
        no-any
        name="ALbrakingLine"
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
        no-any
        name="ALcontrols"
        :values="Object.values(ControlType)"
        :value="controls"
        @changed="e => controls = e"
      />
    </div>

    <div class="__inputRow">
      <Button
        :type="ButtonType.PRIMARY"
        block
        class="__submit"
        :disabled="!valid"
        @click="submit({carId, trackId, trackVariant, driverId, laptime, transmission, weather, brakingLine, controls, date: new Date().getTime()})"
      >
        Submit
      </Button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import TransmissionType from '@/constants/TransmissionType'
import WeatherType from '@/constants/WeatherType'
import BrakingLine from '@/constants/BrakingLine'
import ControlType from '@/constants/ControlType'
import ScreenType from '@/constants/ScreenType'

export default {
  name: 'AddLaptime',
  data () {
    return {
      carId: null,
      trackId: null,
      trackVariant: null,
      driverId: null,
      minutes: '',
      seconds: '',
      milliseconds: '',
      laptimeError: false,
      transmission: TransmissionType.SEQUENTIAL,
      weather: WeatherType.SUN,
      brakingLine: BrakingLine.ON,
      controls: ControlType.STEERING_WHEEL,
      newDriverName: '',
      showNewDriverModal: false,
      newCarName: '',
      showNewCarModal: false
    }
  },
  computed: {
    ...mapState(['cars', 'tracks', 'drivers', 'times']),
    ...mapGetters(['getTrackVariants']),
    laptime () {
      const SECONDS_LENGTH = 2
      const MILLISECONDS_LENGTH = 3
      // check not set
      if ((!this.minutes.length > 0 || this.seconds.length !== SECONDS_LENGTH || this.milliseconds.length !== MILLISECONDS_LENGTH)) return
      const [minutes, seconds, milliseconds] = [parseInt(this.minutes), parseInt(this.seconds), parseInt(this.milliseconds)]
      // check greater than zero
      if ((minutes < 0 || seconds < 0 || milliseconds < 0)) return
      // check in range
      if (seconds >= 60 || milliseconds >= 1000) return
      // format string
      const [m, s, ms] = [this.minutes, this.seconds, this.milliseconds]
      return `${m}:${s.padStart(SECONDS_LENGTH, '0')}.${ms.padStart(MILLISECONDS_LENGTH, '0')}`
    },
    valid () {
      return this.carId && this.trackId && this.trackVariant && this.driverId && this.laptime && !this.laptimeError && this.transmission && this.weather && this.brakingLine
    }
  },
  methods: {
    ...mapActions(['addNewDriver', 'addLaptime', 'addNewCar']),
    ...mapMutations(['showScreen']),
    ...mapMutations('laptimeFilter', ['setFilter', 'clearFilter']),
    validateLaptimeFormat () {
      this.laptimeError = !this.laptime || this.laptime.match(/^\d{1,2}:\d\d\.\d{3}$/) === null
    },
    addCar () {
      this.addNewCar({ name: this.newCarName })
      this.newCarName = ''
      this.showNewCarModal = false
    },
    addDriver () {
      this.addNewDriver({ name: this.newDriverName })
      this.newDriverName = ''
      this.showNewDriverModal = false
    },
    submit (laptime) {
      this.addLaptime(laptime)
      this.driverId = null
      this.$toast.success('Laptime added! Click here to show laptime table.', {
        onClick: () => this.showTimeInTable(laptime)
      })
    },
    showTimeInTable ({ carId, trackId, trackVariant }) {
      this.clearFilter()
      this.setFilter({ carId, trackId, trackVariant })
      this.showScreen({ screen: ScreenType.LAPTIME_BOARD })
    }
  }
}
</script>

<style>
.__timeWrapper {
  width: 30%;
  padding: 2rem;
  margin: 0 auto;
  text-align: center;
}

.__inputRow {
  display: flex;
  margin: 0 auto;
  margin-bottom: 1rem;
  width: 100%;
  justify-content: center;
}

@media only screen and (max-width: 1280px) {
  .__timeWrapper {
    width: 50%;
  }
}

@media only screen and (max-width: 700px) {
  .__timeWrapper {
    width: 100%;
    padding: 1rem;
  }

  .__inputRow {
    flex-direction: column;
  }
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

.__lapTimeInputs {
  border-radius: 0.3rem;
  display: flex;
}

.__lapTimeInputs .__minutes {
  width: 100%;
  text-align: right;
  border-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  padding-right: 0.3rem;
}

.__lapTimeInputs .__seconds {
  width: 3.1rem;
  border-right: 0;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  text-align: center;
  padding-left: 0.3rem;
  padding-right: 0.3rem;
}

.__lapTimeInputs .__milliseconds {
  width: 100%;
  border-left: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  padding-left: 0.3rem;
}

.__lapTimeInputs .__colon, .__lapTimeInputs .__dot {
  background-color: white;
  color: var(--text-dark1);
  font-size: 2rem;
  padding-top: 0.45rem;
  border-top: 0.1rem solid black;
  border-bottom: 0.1rem solid black;
}

.__lapTimeInputs input {
  font-size: 2rem;
}

.__lapTimeInputs input:focus {
  outline: 0;
}

.__lapTimeInputs.__error .__minutes {
  border: 0.15rem solid red;
  color: red;
  border-right: none;
}

.__lapTimeInputs.__error .__seconds, .__lapTimeInputs.__error .__colon, .__lapTimeInputs.__error .__dot {
  border: 0.15rem solid red;
  color: red;
  border-right: none;
  border-left: none;
}

.__lapTimeInputs.__error .__milliseconds {
  border: 0.15rem solid red;
  color: red;
  border-left: none;
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

.__radioHeader {
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-size: 1.1rem;
}

.__noColumn {
  flex-direction: row !important;
  border-bottom: 0.1rem solid white;
}

.__noColumn > div {
  padding: 1rem;
}
</style>
