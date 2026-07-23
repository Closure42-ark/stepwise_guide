<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function toggle() {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <label class="base-toggle">
    <span v-if="label" class="base-toggle__label">{{ label }}</span>
    <button
      class="base-toggle__track"
      :class="{ 'base-toggle__track--on': props.modelValue }"
      @click="toggle"
    >
      <span class="base-toggle__thumb" :class="{ 'base-toggle__thumb--on': props.modelValue }"></span>
    </button>
  </label>
</template>

<style scoped>
.base-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
}

.base-toggle__label {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
}

.base-toggle__track {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  border: none;
  cursor: pointer;
  transition: background var(--transition-normal);
  flex-shrink: 0;
}

.base-toggle__track--on {
  background: var(--color-primary);
}

.base-toggle__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-surface);
  transition: transform var(--transition-normal);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.base-toggle__thumb--on {
  transform: translateX(20px);
}
</style>
