<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  message: string
  type?: 'success' | 'warning' | 'info'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 2500,
})

const visible = ref(true)

watch(() => props.message, () => {
  visible.value = true
  setTimeout(() => {
    visible.value = false
  }, props.duration)
})

setTimeout(() => {
  visible.value = false
}, props.duration)
</script>

<template>
  <Transition name="toast">
    <div v-if="visible" class="base-toast" :class="`base-toast--${type}`">
      <span class="base-toast__icon">
        {{ type === 'success' ? '✓' : type === 'warning' ? '!' : 'i' }}
      </span>
      <span class="base-toast__message">{{ message }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.base-toast {
  position: fixed;
  top: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-modal);
  z-index: 300;
  max-width: 400px;
}

.base-toast--success {
  border-left: 3px solid var(--color-success);
}

.base-toast--warning {
  border-left: 3px solid var(--color-warning);
}

.base-toast--info {
  border-left: 3px solid var(--color-info);
}

.base-toast__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.base-toast--success .base-toast__icon {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.base-toast--warning .base-toast__icon {
  background: #FFF8E1;
  color: var(--color-warning);
}

.base-toast--info .base-toast__icon {
  background: #EBF2FF;
  color: var(--color-info);
}

.base-toast__message {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
}

.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -12px);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}
</style>
