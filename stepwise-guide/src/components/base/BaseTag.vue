<script setup lang="ts">
interface Props {
  label: string
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
})
</script>

<template>
  <span class="base-tag" :class="{ 'base-tag--active': active }">
    {{ label }}
  </span>
</template>

<style scoped>
.base-tag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.base-tag:hover {
  border-color: var(--color-primary-lighter);
}

.base-tag--active {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}
</style>
