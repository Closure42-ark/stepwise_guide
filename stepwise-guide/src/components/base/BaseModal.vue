<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useSlots, watch } from 'vue'

type ModalSize = 'sm' | 'md' | 'lg' | 'full'
type ModalPlacement = 'center' | 'bottom'

interface Props {
  modelValue?: boolean
  visible?: boolean
  title?: string
  size?: ModalSize
  placement?: ModalPlacement
  closeOnOverlay?: boolean
  closeOnEsc?: boolean
  showClose?: boolean
  lockScroll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  visible: undefined,
  title: '',
  size: 'md',
  placement: 'center',
  closeOnOverlay: true,
  closeOnEsc: true,
  showClose: true,
  lockScroll: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:visible': [value: boolean]
  close: []
  opened: []
}>()

const slots = useSlots()
const modalRef = ref<HTMLElement | null>(null)
const titleId = `base-modal-title-${Math.random().toString(36).slice(2, 9)}`
const isControlledByModelValue = computed(() => props.modelValue !== undefined)
const isOpen = computed(() => isControlledByModelValue.value ? props.modelValue : props.visible)
const hasHeader = computed(() => Boolean(props.title) || Boolean(slots.header) || props.showClose)
let previousActiveElement: Element | null = null
let previousBodyOverflow = ''

function setOpen(value: boolean) {
  emit('update:modelValue', value)
  emit('update:visible', value)
}

function close() {
  setOpen(false)
  emit('close')
}

function handleOverlayClick() {
  if (props.closeOnOverlay) {
    close()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!isOpen.value) return

  if (event.key === 'Escape' && props.closeOnEsc) {
    event.preventDefault()
    close()
    return
  }

  if (event.key !== 'Tab' || !modalRef.value) return

  const focusableElements = modalRef.value.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )

  if (!focusableElements.length) {
    event.preventDefault()
    modalRef.value.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

function lockBodyScroll() {
  if (!props.lockScroll) return
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlockBodyScroll() {
  if (!props.lockScroll) return
  document.body.style.overflow = previousBodyOverflow
}

watch(isOpen, async (open) => {
  if (open) {
    previousActiveElement = document.activeElement
    lockBodyScroll()
    document.addEventListener('keydown', handleKeydown)
    await nextTick()
    modalRef.value?.focus()
    emit('opened')
  } else {
    unlockBodyScroll()
    document.removeEventListener('keydown', handleKeydown)

    if (previousActiveElement instanceof HTMLElement) {
      previousActiveElement.focus()
    }
  }
}, { immediate: true })

onBeforeUnmount(() => {
  unlockBodyScroll()
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="isOpen"
        class="base-modal__overlay"
        aria-hidden="true"
        @click="handleOverlayClick"
      ></div>
    </Transition>

    <Transition name="modal">
      <div
        v-if="isOpen"
        class="base-modal__container"
        :class="`base-modal__container--${placement}`"
        @click.self="handleOverlayClick"
      >
        <section
          ref="modalRef"
          class="base-modal__content"
          :class="[`base-modal__content--${size}`, `base-modal__content--${placement}`]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="hasHeader && title ? titleId : undefined"
          tabindex="-1"
        >
          <header v-if="hasHeader" class="base-modal__header">
            <slot name="header">
              <h3 v-if="title" :id="titleId" class="base-modal__title">{{ title }}</h3>
            </slot>
            <button
              v-if="showClose"
              class="base-modal__close"
              type="button"
              aria-label="Close modal"
              @click="close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </header>

          <div class="base-modal__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="base-modal__footer">
            <slot name="footer" />
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.base-modal__overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 52, 54, 0.4);
  z-index: 200;
}

.base-modal__container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  z-index: 210;
}

.base-modal__container--bottom {
  align-items: flex-end;
  padding: 0;
}

.base-modal__content {
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  outline: none;
}

.base-modal__content--sm {
  max-width: 420px;
}

.base-modal__content--md {
  max-width: 560px;
}

.base-modal__content--lg {
  max-width: var(--content-max-width);
}

.base-modal__content--full {
  max-width: min(var(--content-max-width), calc(100vw - var(--space-12)));
  min-height: min(720px, calc(100vh - var(--space-12)));
}

.base-modal__content--bottom {
  max-width: var(--content-max-width);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.base-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-surface);
  z-index: 1;
}

.base-modal__title {
  margin: 0;
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.base-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  margin-left: var(--space-4);
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.base-modal__close:hover {
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.base-modal__body {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
}

.base-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
}

@media (max-width: 640px) {
  .base-modal__container {
    align-items: flex-end;
    padding: 0;
  }

  .base-modal__content,
  .base-modal__content--full {
    max-width: 100%;
    max-height: 90vh;
    min-height: auto;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }

  .base-modal__header,
  .base-modal__body,
  .base-modal__footer {
    padding-left: var(--space-5);
    padding-right: var(--space-5);
  }
}
</style>
