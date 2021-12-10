<template>
  <button
    :class="btnClass()"
    :title="title"
    :disabled="disabled"
    @click.stop="$emit('click')"
  >
    <slot />
  </button>
</template>

<script>
import ButtonType from '@/constants/ButtonType'

export default {
  name: 'Button',
  props: {
    type: {
      type: String,
      default: ButtonType.DEFAULT
    },
    title: {
      type: String,
      default: ''
    },
    block: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  methods: {
    btnClass: function () {
      return {
        __primary: this.type === ButtonType.PRIMARY,
        __secondary: this.type === ButtonType.SECONDARY,
        __success: this.type === ButtonType.SUCCESS,
        __danger: this.type === ButtonType.DANGER,
        __block: this.block
      }
    }
  }
}
</script>

<style scoped>
button {
  --btn-text-dark: var(--text-dark1);
  --btn-text-light: var(--text-light1);
  --btn-default: #ffffff;
  --btn-default-hover: #e7e7e7;
  --btn-primary: #195fbb;
  --btn-primary-hover: #004890;
  --btn-secondary: #787879;
  --btn-secondary-hover: #5f5f5f;
  --btn-success: #2ab135;
  --btn-success-hover: #0e8b19;
  --btn-danger: #e02c2c;
  --btn-danger-hover: #c71818;
  --btn-disabled: #a0a0a0;
  --btn-disabled-text: #cacaca;
}

button {
  border: none;
  background-color: var(--btn-default);
  color: var(--btn-text-dark);
  transition: background-color 0.1s;
  margin: 0.1rem;
  padding: 0.5rem 0.8rem;
  border-radius: 0.3rem;
}

button:disabled, button:disabled:hover {
  cursor: not-allowed;
  background-color: var(--btn-disabled) !important;
  color: var(--btn-disabled-text) !important;
}

button:hover {
  background-color: var(--btn-default-hover);
  color: var(--btn-text-dark);
  cursor: pointer;
}

button.__primary {
  background-color: var(--btn-primary);
  color: var(--btn-text-light);
}

button.__primary:hover {
  background-color: var(--btn-primary-hover);
  color: var(--btn-text-light);
}

button.__secondary {
  background-color: var(--btn-secondary);
  color: var(--btn-text-light);
}

button.__secondary:hover {
  background-color: var(--btn-secondary-hover);
  color: var(--btn-text-light);
}

button.__success {
  background-color: var(--btn-success);
  color: var(--btn-text-light);
}

button.__success:hover{
  background-color: var(--btn-success-hover);
  color: var(--btn-text-light);
}

button.__danger {
  background-color: var(--btn-danger);
  color: var(--btn-text-light);
}

button.__danger:hover {
  background-color: var(--btn-danger-hover);
  color: var(--btn-text-light);
}

button.__block {
  display: block;
}
</style>
