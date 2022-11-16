<template>
  <Modal @close="$emit('close')">
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
          @click="$emit('close')"
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
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

@Options({
  emits: ['close']
})
export default class NewDriverModal extends Vue {
  newDriverName = ''

  addDriver () {
    this.$dataStore.addDriver(this.newDriverName)
    this.newDriverName = ''
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
