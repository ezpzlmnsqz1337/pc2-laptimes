<template>
  <Modal @close="$emit('close')">
    <template #header>
      <h3>Add Track variant</h3>
    </template>
    <template #body>
      <input
        v-model="newTrackVariantName"
        class="__modalInput"
        placeholder="Enter track variant name"
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
          @click="addTrackVariant()"
        >
          Add
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component'

class NewTrakcVariantModalProps {
  trackId = prop<string>({ required: true })
}

@Options({
  emits: ['close']
})
class NewTrakcVariantModal extends Vue.with(NewTrakcVariantModalProps) {
  newTrackVariantName = ''

  addTrackVariant () {
    this.$dataStore.addTrackVariant(this.trackId, this.newTrackVariantName)
    this.newTrackVariantName = ''
    this.$emit('close')
  }
}
export default NewTrakcVariantModal
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
