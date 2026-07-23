<script setup lang="ts">
import BaseProgress from '@/components/base/BaseProgress.vue'
import { useI18n } from '@/composables/useI18n'

interface Props {
  label: string
  value: number | string
  target: string
  progress: number
  icon: string
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div class="data-card">
    <span class="data-card__icon">{{ icon }}</span>
    <span class="data-card__label">{{ label }}</span>
    <span class="data-card__value">{{ typeof value === 'number' ? value.toLocaleString() : value }}</span>
    <span class="data-card__target">{{ t('record.target') }} {{ target }}</span>
    <BaseProgress :value="progress" :max="100" size="sm" />
  </div>
</template>

<style scoped>
.data-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

.data-card__icon {
  font-size: 20px;
}

.data-card__label {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}

.data-card__value {
  font-family: 'DM Sans', sans-serif;
  font-size: var(--font-size-data-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
}

.data-card__target {
  font-size: var(--font-size-caption);
  color: var(--color-text-tertiary);
}
</style>
