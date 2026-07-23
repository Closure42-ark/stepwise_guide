<script setup lang="ts">
interface Props {
  modelValue: string
  options: { label: string; value: string }[]
  direction?: 'row' | 'column'
}

withDefaults(defineProps<Props>(), {
  direction: 'column',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="base-radio-group" :class="`base-radio-group--${direction}`">
    <button
      v-for="opt in options"
      :key="opt.value"
      class="base-radio-group__item"
      :class="{ 'base-radio-group__item--active': modelValue === opt.value }"
      @click="emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.base-radio-group {
  display: flex;
  gap: var(--space-3);
}

.base-radio-group--row {
  flex-direction: row;
  flex-wrap: wrap;
}

.base-radio-group--column {
  flex-direction: column;
}

.base-radio-group__item {
  padding: var(--space-3) var(--space-5);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
  transition: all var(--transition-fast);
  cursor: pointer;
  text-align: left;
}

.base-radio-group__item:hover {
  border-color: var(--color-primary-lighter);
  background: var(--color-primary-light);
}

.base-radio-group__item--active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}
</style>
