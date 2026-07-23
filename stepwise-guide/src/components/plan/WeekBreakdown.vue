<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import type { WeekPlan } from '@/types'

const { t } = useI18n()

interface Props {
  weeks: WeekPlan[]
}

defineProps<Props>()
</script>

<template>
  <div class="week-breakdown">
    <div v-for="week in weeks" :key="week.weekNumber" class="week-breakdown__item">
      <div class="week-breakdown__header">
        <span class="week-breakdown__number">{{ t('plan.weekPlan', { week: week.weekNumber }) }}</span>
        <span class="week-breakdown__summary">{{ week.summary }}</span>
      </div>
      <p class="week-breakdown__plan">{{ week.dailyPlan }}</p>
    </div>
  </div>
</template>

<style scoped>
.week-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.week-breakdown__item {
  padding: var(--space-4);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-primary);
}

.week-breakdown__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.week-breakdown__number {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.week-breakdown__summary {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  padding: 2px var(--space-2);
  background: var(--color-primary-light);
  border-radius: var(--radius-full);
}

.week-breakdown__plan {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
}
</style>
