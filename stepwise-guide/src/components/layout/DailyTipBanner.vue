<script setup lang="ts">
interface Props {
  message: string
  icon?: string
}

withDefaults(defineProps<Props>(), {
  icon: '🌿',
})
</script>

<template>
  <div class="daily-tip">
    <span class="daily-tip__icon">{{ icon }}</span>
    <p class="daily-tip__message">{{ message }}</p>
  </div>
</template>

<style scoped>
.daily-tip {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: linear-gradient(135deg, var(--color-primary-light) 0%, #F0F9F4 100%);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-6);
}

.daily-tip__icon {
  font-size: 24px;
  flex-shrink: 0;
}

.daily-tip__message {
  font-size: var(--font-size-body);
  color: var(--color-primary-dark);
  line-height: var(--line-height-relaxed);
}
</style>
