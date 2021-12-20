<template>
  <div class="__wrapper">
    <Button
      :type="ButtonType.SECONDARY"
      @click="showAddLapTime = !showAddLapTime"
    >
      Toggle
    </Button>
    <div v-show="showAddLapTime">
      <AddLaptime />
    </div>
    <LaptimeBoard v-show="!showAddLapTime" />
  </div>
</template>

<script>
import { unsubscribeAll } from '@/vuex-firestore-binding'
import AddLaptime from '@/components/AddLaptime'
import LaptimeBoard from '@/components/LaptimeBoard'
import { mapActions } from 'vuex'

export default {
  name: 'App',
  components: {
    AddLaptime,
    LaptimeBoard
  },
  data () {
    return {
      showAddLapTime: true
    }
  },
  mounted () {
    this.bindDb()
  },
  unmounted () {
    unsubscribeAll()
  },
  methods: {
    ...mapActions(['bindDb'])
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
  height: 100vh;
  overflow-y: scroll;
}
</style>
