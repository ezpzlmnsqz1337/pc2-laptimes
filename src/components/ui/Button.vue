<template>
  <button
    :class="btnClass()"
    :title="title"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { ButtonType } from '@/constants/ButtonType'
import { Vue, prop } from 'vue-class-component'

class ButtonProps {
  type = prop<ButtonType>({ default: ButtonType.DEFAULT })
  title = prop<string>({ default: '' })
  block = prop<boolean>({ default: false })
  disabled = prop<boolean>({ default: false })
}

class Button extends Vue.with(ButtonProps) {
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
export default Button
</script>

<style lang="scss" scoped>
button {
  font-family: 'Open Sans', Helvetica, Arial, sans-serif;
  --btn-text-dark: var(--text-dark1);
  --btn-text-light: var(--text-light1);
  --btn-default: var(--bg-light1);
  --btn-default-hover: var(--btn-default-hover-bg);
  --btn-primary: var(--dark-blue1);
  --btn-primary-hover: var(--btn-primary-hover-bg);
  --btn-secondary: var(--btn-secondary-bg);
  --btn-secondary-hover: var(--btn-secondary-hover-bg);
  --btn-success: var(--btn-success-bg);
  --btn-success-hover: var(--btn-success-hover-bg);
  --btn-danger: var(--btn-danger-bg);
  --btn-danger-hover: var(--btn-danger-hover-bg);
  --btn-warning: var(--btn-warning-bg);
  --btn-warning-hover: var(--btn-warning-hover-bg);
  --btn-disabled: var(--btn-disabled-bg);
  --btn-disabled-text: var(--btn-disabled-text-color);
}

button {
  border: none;
  background-color: var(--btn-default);
  color: var(--btn-text-dark);
  transition: background-color 0.1s;
  margin: var(--space-2xs);
  padding: var(--space-2xl) var(--space-5xl);

  &:deep(.fa) {
    margin-right: var(--space-lg);
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
