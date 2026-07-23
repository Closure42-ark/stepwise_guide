<script setup lang="ts">
interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  unit?: string
  error?: string
  type?: 'text' | 'number'
}

withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: '',
  unit: '',
  error: '',
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="base-input" :class="{ 'base-input--error': error }">
    <label v-if="label" class="base-input__label">{{ label }}</label>
    <div class="base-input__wrapper">
      <input
        :type="type"
        class="base-input__field"
        :value="modelValue"
        :placeholder="placeholder"
        @input="onInput"
      />
      <span v-if="unit" class="base-input__unit">{{ unit }}</span>
    </div>
    <span v-if="error" class="base-input__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.base-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.base-input__label {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.base-input__wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.base-input__wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(74, 158, 111, 0.1);
}

.base-input--error .base-input__wrapper {
  border-color: var(--color-warning);
}

.base-input__field {
  flex: 1;
  min-width: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-body);
  line-height: var(--line-height-normal);
}

.base-input__field::placeholder {
  color: var(--color-text-tertiary);
}

.base-input__unit {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.base-input__error {
  font-size: var(--font-size-caption);
  color: var(--color-warning);
}
</style>
