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
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2xl);
  min-height: var(--target-min);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background-color: var(--surface-raised);
  color: var(--fg);
  font-size: var(--font-size-compact);
  font-weight: 600;
  padding: var(--space-2xl) var(--space-5xl);
  cursor: pointer;
  transition: background-color var(--motion-fast) ease, border-color var(--motion-fast) ease;

  &:deep(.fa) {
    margin-right: var(--space-lg);
  }

  &:hover {
    background-color: var(--line-strong);
  }

  &.__primary {
    background-color: var(--accent);
    color: var(--canvas);
  }

  &.__primary:hover {
    background-color: var(--accent-strong);
    color: var(--canvas);
  }

  &.__secondary {
    background-color: transparent;
    border-color: var(--line-control);
    color: var(--fg);
  }

  &.__secondary:hover {
    background-color: var(--surface-raised);
    border-color: var(--accent);
  }

  &.__success {
    background-color: var(--success);
    color: var(--canvas);
  }

  &.__success:hover {
    background-color: var(--success-strong);
    color: var(--canvas);
  }

  &.__danger {
    background-color: var(--danger);
    color: var(--canvas);
  }

  &.__danger:hover {
    background-color: var(--danger-strong);
    color: var(--canvas);
  }

  &.__warning {
    background-color: var(--warning);
    color: var(--canvas);
  }

  &.__warning:hover {
    background-color: var(--warning-strong);
    color: var(--canvas);
  }

  &.__block {
    display: flex;
    width: 100%;
  }

  /* Disabled must win over every variant fill. */
  &:disabled,
  &:disabled:hover {
    cursor: not-allowed;
    background-color: var(--line);
    border-color: var(--line);
    color: var(--muted);
  }
}
</style>
