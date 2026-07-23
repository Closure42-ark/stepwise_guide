<script setup lang="ts">
interface Props {
  level: string
  description: string
}

defineProps<Props>()
</script>

<template>
  <div class="activity-level-card">
    <div class="activity-level-card__icon">🏃</div>
    <div class="activity-level-card__content">
      <span class="activity-level-card__level">{{ level }}</span>
      <span class="activity-level-card__desc">{{ description }}</span>
    </div>
  </div>
</template>

<style scoped>
.activity-level-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-accent-light);
  border-radius: var(--radius-md);
  border: 1px solid rgba(232, 148, 90, 0.2);
}

.activity-level-card__icon {
  font-size: 32px;
  flex-shrink: 0;
}

.activity-level-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.activity-level-card__level {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent);
}

.activity-level-card__desc {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}
</style>
