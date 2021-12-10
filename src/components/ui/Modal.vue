<template>
  <transition name="modal">
    <div
      class="__modalMask"
      @click="$emit('close')"
    >
      <div class="__modalWrapper">
        <div
          class="__modalContainer"
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

<script>

export default {
  name: 'Modal',
  emits: ['close']
}
</script>

<style>
.__modalMask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.__modalWrapper {
  display: table-cell;
  vertical-align: middle;
}

.__modalContainer {
  width: 22rem;
  margin: 0px auto;
  padding: 1.5rem 2rem;
  background-color: var(--bg-dark4);
  border-radius: 0.7rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.__modalHeader h3 {
  margin-top: 0;
  color: var(--text-light1);
}

.__modalBody {
  margin: 0;
}

.modalDefaultButton {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .__modalContainer,
.modal-leave-active .__modalContainer {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
