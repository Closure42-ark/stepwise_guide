<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  unit?: string
  label?: string
  valueFormatter?: (value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  unit: '',
  label: '',
  valueFormatter: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', Number(target.value))
}

const percentage = computed(() => ((props.modelValue - props.min) / (props.max - props.min)) * 100)
const displayValue = computed(() => {
  if (props.valueFormatter) {
    return props.valueFormatter(props.modelValue)
  }

  return `${props.modelValue}${props.unit}`
})
</script>

<template>
  <div class="base-slider">
    <label v-if="label" class="base-slider__label">{{ label }}</label>
    <div class="base-slider__row">
      <input
        type="range"
        class="base-slider__track"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        :style="{ '--progress': `${percentage}%` }"
        @input="onInput"
      />
      <span class="base-slider__value">{{ displayValue }}</span>
    </div>
  </div>
</template>

<style scoped>
.base-slider {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.base-slider__label {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.base-slider__row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.base-slider__track {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: var(--radius-full);
  background: linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) var(--progress), var(--color-border) var(--progress), var(--color-border) 100%);
  outline: none;
  cursor: pointer;
}

.base-slider__track::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-surface);
  border: 3px solid var(--color-primary);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.base-slider__track::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}

.base-slider__value {
  font-family: 'DM Sans', sans-serif;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  min-width: 60px;
  text-align: right;
}
</style>
