<template>
  <transition name="modal">
    <div
      class="__modalMask"
      @click="$emit('close')"
    >
      <div class="__modalWrapper">
        <div
          ref="dialog"
          class="__modalContainer"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          @click.stop
        >
          <div class="__modalHeader">
            <slot name="header" />
          </div>

          <div class="__modalBody">
            <slot name="body">
              default body
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

let modalCount = 0
const openModals: Vue[] = []

@Options({
  emits: ['close']
})
class Modal extends Vue {
  $refs!: { dialog: HTMLElement }
  private lastFocused: HTMLElement | null = null
  private titleId = `modal-title-${++modalCount}`

  mounted () {
    this.lastFocused = document.activeElement as HTMLElement
    openModals.push(this)
    window.addEventListener('keydown', this.onKeydown)
    this.labelDialog()
    this.focusFirst()
  }

  beforeUnmount () {
    window.removeEventListener('keydown', this.onKeydown)
    const index = openModals.indexOf(this)
    if (index !== -1) openModals.splice(index, 1)
    this.lastFocused?.focus?.()
  }

  labelDialog () {
    const root = this.$refs.dialog
    if (!root) return
    const heading = root.querySelector<HTMLElement>('h2, h3')
    if (!heading) return
    if (!heading.id) heading.id = this.titleId
    root.setAttribute('aria-labelledby', heading.id)
  }

  focusFirst () {
    const root = this.$refs.dialog
    if (!root) return
    const target = root.querySelector<HTMLElement>(FOCUSABLE)
    ;(target ?? root).focus()
  }

  onKeydown (e: KeyboardEvent) {
    if (e.key === 'Escape') {
      // Nested modals share the window target: only the topmost one reacts.
      if (openModals[openModals.length - 1] !== this) return
      e.stopPropagation()
      e.stopImmediatePropagation()
      this.$emit('close')
      return
    }
    if (e.key !== 'Tab') return
    const root = this.$refs.dialog
    if (!root) return
    const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
      .filter(el => el.offsetParent !== null)
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}
export default Modal
</script>

<style lang="scss">
.__modalMask {
  position: fixed;
  z-index: 9998;
  inset: 0;
  background-color: var(--overlay-backdrop);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8xl);
  transition: opacity var(--motion-base) ease;
}

.__modalWrapper {
  display: contents;
}

.__modalContainer {
  min-width: min(22rem, 100%);
  max-width: min(90vw, 60rem);
  max-height: 90vh;
  padding: var(--space-9xl);
  background-color: var(--surface);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-lg);
  box-shadow: 0 24px 64px var(--shadow-overlay);
  transition: transform var(--motion-base) ease, opacity var(--motion-base) ease;
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-y: auto;
  text-align: center;
  color: var(--fg);
}

.__modalHeader {
  text-align: center;

  h3 {
    margin-top: 0;
    color: var(--fg);
  }
}

.__modalBody {
  margin: 0;
}

.modalDefaultButton {
  float: right;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--motion-base) ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .__modalContainer,
.modal-leave-to .__modalContainer {
  transform: scale(.98);
}
</style>
