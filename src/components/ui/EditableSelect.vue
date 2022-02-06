<template>
  <div>
    <div
      v-if="!edit"
      class="__textContainer"
      @click="startEditing($event)"
    >
      <div
        v-if="icon"
        :class="`fa fa-${icon}`"
      /><span>{{ text }}</span>
    </div>
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
    icon: {
      type: String,
      default: ''
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
      if (!this.isAdmin() || !e.ctrlKey) return
      this.edit = true
      this.$nextTick(() => this.$refs.select.$el.focus())
    },
    update (e) {
      if (e) this.$emit('value:update', e)
      this.edit = false
    }
  }
}
</script>

<style scoped>
.__textContainer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media only screen and (max-width: 1024px) {
  .__textContainer {
    justify-content: center;
  }
}

:deep(.vs__dropdown-toggle) {
  min-width: 10rem;
}

:deep(.vs__dropdown-menu) {
  width: auto;
  overflow-x: hidden;
}
</style>
