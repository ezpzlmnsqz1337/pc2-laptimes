<template>
  <Modal @close="$emit('close')">
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
          @click="$emit('close')"
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
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({
  emits: ['close']
})
export default class NewCarModal extends Vue {
  newCarName = ''

  addCar () {
    this.$dataStore.addCar(this.newCarName)
    this.newCarName = ''
    this.$emit('close')
  }
}
</script>

<style scoped lang="scss">
.__modalButtons {
  display: flex;
  justify-content: flex-end;
}

.__modalInput {
  margin-bottom: 1rem;
  width: 100%;
}
</style>
