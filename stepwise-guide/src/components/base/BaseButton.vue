<script setup lang="ts">
interface Props {
  type?: 'primary' | 'secondary' | 'text'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})
</script>

<template>
  <button
    class="base-button"
    :class="[`base-button--${type}`, `base-button--${size}`, { 'base-button--disabled': disabled || loading }]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="base-button__loader"></span>
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  cursor: pointer;
  white-space: nowrap;
}

.base-button:active:not(.base-button--disabled) {
  transform: scale(0.97);
}

.base-button--sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-caption);
}

.base-button--md {
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-body);
}

.base-button--lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--font-size-h3);
}

.base-button--primary {
  background: var(--color-primary);
  color: #fff;
}

.base-button--primary:hover:not(.base-button--disabled) {
  background: var(--color-primary-dark);
}

.base-button--secondary {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.base-button--secondary:hover:not(.base-button--disabled) {
  background: var(--color-primary-lighter);
}

.base-button--text {
  background: transparent;
  color: var(--color-primary);
}

.base-button--text:hover:not(.base-button--disabled) {
  background: var(--color-primary-light);
}

.base-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button__loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
