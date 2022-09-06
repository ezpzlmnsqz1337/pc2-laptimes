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

<script lang="ts">
import { ButtonType } from '@/constants/ButtonType'
import { Options, Vue, prop } from 'vue-class-component'

class ButtonProps {
  type = prop<ButtonType>({ default: ButtonType.DEFAULT })
  title = prop<string>({ default: '' })
  block = prop<boolean>({ default: false })
  disabled = prop<boolean>({ default: false })
}

Options({
  emits: ['click']
})
export default class Button extends Vue.with(ButtonProps) {
  btnClass () {
    return {
      __primary: this.type === ButtonType.PRIMARY,
      __secondary: this.type === ButtonType.SECONDARY,
      __success: this.type === ButtonType.SUCCESS,
      __danger: this.type === ButtonType.DANGER,
      __warning: this.type === ButtonType.WARNING,
      __block: this.block
    }
  }
}
</script>

<style lang="scss" scoped>
button {
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
  --btn-text-dark: var(--text-dark1);
  --btn-text-light: var(--text-light1);
  --btn-default: #ffffff;
  --btn-default-hover: #e7e7e7;
  --btn-primary: #4081c2;
  --btn-primary-hover: #3f71a3;
  --btn-secondary: #787879;
  --btn-secondary-hover: #5f5f5f;
  --btn-success: #2ab135;
  --btn-success-hover: #0e8b19;
  --btn-danger: #e02c2c;
  --btn-danger-hover: #c71818;
  --btn-warning: #fffb26;
  --btn-warning-hover: #94881a;
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

  &:deep(.fa) {
    margin-right: 0.3rem;
  }

  &:disabled, &:disabled:hover {
    cursor: not-allowed;
    background-color: var(--btn-disabled) !important;
    color: var(--btn-disabled-text) !important;
  }

  &:hover {
    background-color: var(--btn-default-hover);
    color: var(--btn-text-dark);
    cursor: pointer;
  }

  &.__primary {
    background-color: var(--btn-primary);
    color: var(--btn-text-light);
  }

  &.__primary:hover {
    background-color: var(--btn-primary-hover);
    color: var(--btn-text-light);
  }

  &.__secondary {
    background-color: var(--btn-secondary);
    color: var(--btn-text-light);
  }

  &.__secondary:hover {
    background-color: var(--btn-secondary-hover);
    color: var(--btn-text-light);
  }

  &.__success {
    background-color: var(--btn-success);
    color: var(--btn-text-light);
  }

  &.__success:hover{
    background-color: var(--btn-success-hover);
    color: var(--btn-text-light);
  }

  &.__danger {
    background-color: var(--btn-danger);
    color: var(--btn-text-light);
  }

  &.__danger:hover {
    background-color: var(--btn-danger-hover);
    color: var(--btn-text-light);
  }

  &.__warning {
    background-color: var(--btn-warning);
    color: var(--btn-text-dark);
  }

  &.__warning:hover {
    background-color: var(--btn-warning-hover);
    color: var(--btn-text-light);
  }

  &.__block {
    display: block;
  }
}
</style>
