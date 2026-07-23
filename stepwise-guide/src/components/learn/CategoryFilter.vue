<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

interface Props {
  categories: string[]
  modelValue: string
}

defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="category-filter">
    <button
      class="category-filter__btn"
      :class="{ 'category-filter__btn--active': modelValue === t('learn.all') }"
      @click="emit('update:modelValue', t('learn.all'))"
    >
      {{ t('learn.all') }}
    </button>
    <button
      v-for="cat in categories"
      :key="cat"
      class="category-filter__btn"
      :class="{ 'category-filter__btn--active': modelValue === cat }"
      @click="emit('update:modelValue', cat)"
    >
      {{ cat }}
    </button>
  </div>
</template>

<style scoped>
.category-filter {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}

.category-filter__btn {
  padding: var(--space-2) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: var(--color-surface);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.category-filter__btn:hover {
  border-color: var(--color-primary-lighter);
}

.category-filter__btn--active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
