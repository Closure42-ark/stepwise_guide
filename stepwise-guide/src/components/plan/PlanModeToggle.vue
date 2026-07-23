<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

interface Props {
  modelValue: 'preset' | 'guided'
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: 'preset' | 'guided']
}>()
</script>

<template>
  <div class="plan-mode-toggle">
    <button
      class="plan-mode-toggle__btn"
      :class="{ 'plan-mode-toggle__btn--active': modelValue === 'preset' }"
      @click="emit('update:modelValue', 'preset')"
    >
      {{ t('plan.presetMode') }}
    </button>
    <button
      class="plan-mode-toggle__btn"
      :class="{ 'plan-mode-toggle__btn--active': modelValue === 'guided' }"
      @click="emit('update:modelValue', 'guided')"
    >
      {{ t('plan.guidedMode') }}
    </button>
  </div>
</template>

<style scoped>
.plan-mode-toggle {
  display: inline-flex;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--space-6);
}

.plan-mode-toggle__btn {
  padding: var(--space-2) var(--space-6);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: var(--color-surface);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
}

.plan-mode-toggle__btn:first-child {
  border-right: 1px solid var(--color-border);
}

.plan-mode-toggle__btn--active {
  background: var(--color-primary);
  color: #fff;
}
</style>
