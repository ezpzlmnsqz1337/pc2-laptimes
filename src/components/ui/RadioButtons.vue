<template>
  <div
    v-for="v in getValues"
    :key="v"
  >
    <div>
      <input
        :id="`${v}${name}Radio`"
        v-model="selected"
        :name="`${name}Radio`"
        :value="v"
        type="radio"
        @change="$emit('changed', selected)"
      >
    </div>
    <div><label :for="`${v}${name}Radio`">{{ v ? v : 'any' }}</label></div>
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
  }
}
</script>

<style>
.__modalMask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.__modalWrapper {
  display: table-cell;
  vertical-align: middle;
}

.__modalContainer {
  width: 22rem;
  margin: 0px auto;
  padding: 1.5rem 2rem;
  background-color: var(--bg-dark4);
  border-radius: 0.7rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.__modalHeader h3 {
  margin-top: 0;
  color: var(--text-light1);
}

.__modalBody {
  margin: 0;
}

.modalDefaultButton {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .__modalContainer,
.modal-leave-active .__modalContainer {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
