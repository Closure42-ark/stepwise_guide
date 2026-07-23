<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <label class="base-checkbox" @click="emit('update:modelValue', !modelValue)">
    <span class="base-checkbox__box" :class="{ 'base-checkbox__box--checked': modelValue }">
      <svg v-if="modelValue" class="base-checkbox__check" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <span v-if="label" class="base-checkbox__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.base-checkbox {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.base-checkbox__box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 1.5px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.base-checkbox__box--checked {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.base-checkbox__check {
  width: 12px;
  height: 12px;
  color: #fff;
  animation: checkPop 0.2s ease-out;
}

@keyframes checkPop {
  0% { transform: scale(0); }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.base-checkbox__label {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
}
</style>
