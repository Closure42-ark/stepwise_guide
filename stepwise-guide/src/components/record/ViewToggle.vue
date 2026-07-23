<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

interface Props {
  modelValue: 'week' | 'month'
}

defineProps<Props>()

const { t } = useI18n()

const emit = defineEmits<{
  'update:modelValue': [value: 'week' | 'month']
}>()
</script>

<template>
  <div class="view-toggle">
    <button
      class="view-toggle__btn"
      :class="{ 'view-toggle__btn--active': modelValue === 'week' }"
      @click="emit('update:modelValue', 'week')"
    >
      {{ t('record.viewWeek') }}
    </button>
    <button
      class="view-toggle__btn"
      :class="{ 'view-toggle__btn--active': modelValue === 'month' }"
      @click="emit('update:modelValue', 'month')"
    >
      {{ t('record.viewMonth') }}
    </button>
  </div>
</template>

<style scoped>
.view-toggle {
  display: inline-flex;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.view-toggle__btn {
  padding: var(--space-2) var(--space-5);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: var(--color-surface);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
}

.view-toggle__btn:first-child {
  border-right: 1px solid var(--color-border);
}

.view-toggle__btn--active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
</style>
