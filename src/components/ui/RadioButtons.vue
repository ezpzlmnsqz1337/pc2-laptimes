<template>
  <div
    class="__radioWrapper"
  >
    <div
      v-for="v in getValues"
      :key="v"
    >
      <Button
        :type="ButtonType.PRIMARY"
        block
        :class="selectedClass(v)"
        @click="selected = v;$emit('changed', selected)"
      >
        <input
          :id="`${v}${name}Radio`"
          v-model="selected"
          :name="`${name}Radio`"
          :value="v"
          type="radio"
          @change="$emit('changed', selected)"
        >
        <div><label :for="`${v}${name}Radio`">{{ v ? v : 'any' }}</label></div>
      </Button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'RadioButtons',
  props: {
    noAny: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: 'name'
    },
    value: {
      type: String,
      default: ''
    },
    values: {
      type: Array,
      default: () => []
    }
  },
  emits: ['changed'],
  data () {
    return {
      selected: null
    }
  },
  computed: {
    getValues () {
      return this.values.filter(x => this.noAny ? x : true)
    }
  },
  methods: {
    selectedClass (value) {
      return {
        __selected: this.value === value
      }
    }
  }
}
</script>

<style scoped>
.__radioWrapper{
  display: flex;
  width: 100%;
  justify-content: center;
}

input[type=radio] {
  display: none;
}

label {
  cursor: pointer;
}

button.__selected {
  background-color: #00366b;
  color: var(--text-light1);
}
</style>
