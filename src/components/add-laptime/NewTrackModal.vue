<template>
  <Modal @close="$emit('close')">
    <template #header>
      <h3>Add Track</h3>
    </template>
    <template #body>
      <input
        v-model="newTrackName"
        class="__modalInput"
        placeholder="Enter track name"
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
          @click="addTrack()"
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
class NewTrackModal extends Vue {
  newTrackName = ''

  addTrack () {
    this.$dataStore.addTrack(this.newTrackName)
    this.newTrackName = ''
    this.$emit('close')
  }
}
export default NewTrackModal
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
