<template>
  <div class="__wrapper">
    <div class="__menu">
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.ADD_LAPTIME}"
        @click="showScreen({screen: ScreenType.ADD_LAPTIME})"
      >
        Add laptime
      </Button>
      <Button
        :type="ButtonType.SECONDARY"
        :class="{__selected: activeScreen === ScreenType.LAPTIME_BOARD}"
        @click="showScreen({screen: ScreenType.LAPTIME_BOARD})"
      >
        Laptime board
      </Button>
    </div>
    <div v-show="activeScreen === ScreenType.ADD_LAPTIME">
      <AddLaptime />
    </div>
    <LaptimeBoard v-show="activeScreen === ScreenType.LAPTIME_BOARD" />
  </div>
</template>

<script>
import { unsubscribeAll } from '@/vuex-firestore-binding'
import AddLaptime from '@/components/AddLaptime'
import LaptimeBoard from '@/components/LaptimeBoard'
import { mapActions, mapMutations, mapState } from 'vuex'

export default {
  name: 'App',
  components: {
    AddLaptime,
    LaptimeBoard
  },
  computed: {
    ...mapState(['activeScreen'])
  },
  mounted () {
    this.bindDb()
  },
  unmounted () {
    unsubscribeAll()
  },
  methods: {
    ...mapActions(['bindDb']),
    ...mapMutations(['showScreen'])
  }
}
</script>

<style>
:root {
  --hover: #188cff;
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

input[type=text], input[type=password], input[type=email], input[type=number]{
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

.__menu {
  padding-top: 1rem;
  text-align: center;
}

.__menu .__selected {
  background-color: #242424 !important;
}
</style>
