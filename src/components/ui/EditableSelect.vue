<template>
  <div>
    <span
      v-if="!edit"
      @click="startEditing($event)"
    >{{ text }}</span>
    <v-select
      v-if="edit"
      ref="select"
      :model-value="text"
      :options="options"
      :label="label"
      @update:model-value="update($event)"
      @search:blur="edit = false"
    />
  </div>
</template>

<script>

export default {
  name: 'EditableSelect',
  props: {
    text: {
      type: String,
      default: 'Editable text'
    },
    options: {
      type: Array,
      default: () => []
    },
    label: {
      type: String,
      default: 'name'
    }
  },
  emits: ['value:update'],
  data () {
    return {
      edit: false
    }
  },
  methods: {
    startEditing (e) {
      if (!e.ctrlKey) return
      this.edit = true
      this.$nextTick(() => this.$refs.select.$el.focus())
    },
    update (e) {
      this.$emit('value:update', e)
      this.edit = false
    }
  }
}
</script>

<style scoped>
:deep(.vs__dropdown-toggle) {
  min-width: 10rem;
}

:deep(.vs__dropdown-menu) {
  width: auto;
  overflow-x: hidden;
}
</style>
