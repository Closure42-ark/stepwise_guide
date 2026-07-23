<script setup lang="ts">
interface Props {
  padding?: 'sm' | 'md' | 'lg'
  shadow?: boolean
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: 'md',
  shadow: true,
  hoverable: false,
})
</script>

<template>
  <div
    class="base-card"
    :class="[`base-card--${padding}`, { 'base-card--shadow': shadow, 'base-card--hoverable': hoverable }]"
  >
    <slot />
  </div>
</template>

<style scoped>
.base-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.base-card--sm {
  padding: var(--space-3);
}

.base-card--md {
  padding: var(--space-5);
}

.base-card--lg {
  padding: var(--space-6);
}

.base-card--shadow {
  box-shadow: var(--shadow-card);
}

.base-card--hoverable {
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  cursor: pointer;
}

.base-card--hoverable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}
</style>
