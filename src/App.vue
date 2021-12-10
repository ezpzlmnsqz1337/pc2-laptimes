<template>
  <Modal
    v-if="showModal"
    @close="showModal = false"
  >
    <template #header>
      Add driver
    </template>
    <template #body>
      <input
        v-model="newDriverName"
        type="text"
      >
      <div>
        <Button
          :type="ButtonType.PRIMARY"
          @click="addNewDriver({name: newDriverName})"
        >
          Add
        </Button>
        <Button :type="ButtonType.DANGER">
          Cancel
        </Button>
      </div>
    </template>
  </Modal>

  <div class="__wrapper">
    <div class="__timeWrapper">
      <div class="__inputRow">
        <!-- object value -->
        <v-select
          v-model="car"
          placeholder="Select car"
          :options="cars"
          :reduce="car => car.uid"
          label="name"
        />
      </div>
      <div class="__inputRow">
        <v-select
          v-model="track"
          placeholder="Select track"
          :options="tracks"
          :reduce="track => track.uid"
          label="track"
          @change="trackVariant=null"
        />
      </div>
      <div
        v-if="track"
        class="__inputRow"
      >
        <v-select
          v-model="trackVariant"
          placeholder="Select track variant"
          :options="getTrackVariants(track)"
        />
      </div>
      <div
        class="__inputRow"
      >
        <v-select
          v-model="driver"
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
          v-model="lapTime"
          type="text"
          class="__lapTime"
          :class="{__error: lapTimeError}"
          placeholder="0:00.000"
          @input="validateLapTimeFormat()"
        >
      </div>
      <div class="__inputRow">
        <Button
          :type="ButtonType.PRIMARY"
          block
          class="__submit"
          :disabled="!valid"
          @click="addLapTime({car, track, trackVariant, time})"
        >
          Submit
        </Button>
      </div>
    </div>
  </div>
</template>

<script>
import { unsubscribeAll } from '@/vuex-firestore-binding'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'App',
  data () {
    return {
      car: null,
      track: null,
      trackVariant: null,
      driver: null,
      lapTime: '',
      lapTimeError: false,
      newDriverName: '',
      showModal: false
    }
  },
  computed: {
    ...mapState(['cars', 'tracks', 'drivers', 'times']),
    ...mapGetters(['getTrackVariants']),
    valid () {
      return this.car && this.track && this.trackVariant && this.driver && this.lapTime && !this.lapTimeError
    }
  },
  mounted () {
    this.bindDb()
  },
  unmounted () {
    unsubscribeAll()
  },
  methods: {
    ...mapActions(['bindDb', 'addNewDriver']),
    validateLapTimeFormat () {
      this.lapTimeError = this.lapTime.match(/\d{1,2}:\d\d\.\d{3}/) === null
    }
  }
}
</script>

<style>
:root {
  --hover: #2970b6;
  --active: #205b95;
  --text-light1: #ffffff;
  --text-light2: gray;
  --text-dark1: #242424;
  --bg-dark1: #8b8b8b;
  --bg-dark2: #5d5d5d;
  --bg-dark3: #424242;
  --bg-dark4: #3a3a3a;
  --bg-dark5: #242424;
  --bg-light1: #ffffff;
  --bg-light2: #a0a0a0;
  --bg-light3: #707070;
  --border-light1: #ffffff;
  --border-dark1: #424242;
  --anchor: #2183df;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-light1);
  font-size: 12px;
  margin-top: 0;
}

input[type=text], input[type=password], input[type=email]{
  padding: 0.5rem;
  border-radius: 0.3rem;
  border: 0.1rem solid black;
}

select{
  padding: 0.5rem;
  border-radius: 0.3rem;
}

a {
  color: var(--anchor);
}

/* custom scrollbar overrides */
.ps .ps__rail-x:hover, .ps .ps__rail-y:hover, .ps .ps__rail-x:focus, .ps .ps__rail-y:focus, .ps .ps__rail-x.ps--clicking, .ps .ps__rail-y.ps--clicking {
  background-color: transparent !important;
}

.ps__rail-y:hover > .ps__thumb-y, .ps__rail-y:focus > .ps__thumb-y, .ps__rail-y.ps--clicking .ps__thumb-y {
  width: 7px !important;
}

.__wrapper {
  background-color: var(--bg-dark3);
  min-height: 100vh;
}

.__timeWrapper {
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

.v-select > div {
  background-color: var(--bg-light1);
  border-radius: 0.3rem;
  padding: 0.5rem;
  border: 0.1rem solid black;
}

.__lapTime {
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
</style>
