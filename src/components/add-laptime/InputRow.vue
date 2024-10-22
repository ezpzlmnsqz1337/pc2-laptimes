<template>
  <div
    class="__inputRow"
    :class="{__borderBottom: borderBottom}"
  >
    <div
      v-if="heading"
      class="__heading"
    >
      {{ heading }}
    </div>
    <div
      v-if="label"
      class="__label"
    >
      <div>{{ label }}</div>
      <Button
        v-if="showSetButton"
        :type="ButtonType.SECONDARY"
        @click="$emit('set')"
      >
        Set
      </Button>
      <Button
        v-if="showLinkButton"
        :type="ButtonType.DANGER"
        @click="$emit('link')"
      >
        Link
      </Button>
    </div>
    <div class="__input">
      <slot />
      <Button
        v-if="showAddButton"
        :type="ButtonType.SUCCESS"
        @click="$emit('add')"
      >
        Add
      </Button>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, prop, Vue } from 'vue-class-component'

class InputRowProps {
  heading = prop<string>({ default: '' })
  label = prop<string>({ default: '' })
  showAddButton = prop<boolean>({ default: false })
  showLinkButton = prop<boolean>({ default: false })
  showSetButton = prop<boolean>({ default: false })
  borderBottom = prop<boolean>({ default: false })
}

@Options({
  emits: ['set', 'link', 'add']
})
export default class InputRow extends Vue.with(InputRowProps) {
}
</script>

<style scoped>
.__heading {
  margin-bottom: 0.5rem;
  font-weight: bold;
  font-size: 1.1rem;
}

.__label {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;

  button {
    margin: 0;
  }
}

.__input {
  display: flex;
  flex-direction: row;

  button {
    margin: 0;
  }
}

.__inputRow {
  margin-bottom: 1rem;
}

.__borderBottom {
  padding-bottom: 1rem;
  border-bottom: 0.1rem solid white;
}

@media only screen and (max-width: 700px) {
  .__selectInput {
    flex-direction: column;
  }
}
</style>
