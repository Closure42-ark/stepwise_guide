<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { WeekAdvice } from '@/composables/useWeekAdvice'
import { useI18n } from '@/composables/useI18n'

interface Props {
  advice: WeekAdvice
}

const props = defineProps<Props>()
const router = useRouter()
const { currentLang } = useI18n()

const toneClass = computed(() => `week-advice-card--${props.advice.tone}`)
const helperText = computed(() => {
  return currentLang.value === 'en' ? 'One suggestion for this week' : '基于当前展示周给你的一条建议'
})

function handleAction(to?: string) {
  if (!to) return
  router.push(to)
}
</script>

<template>
  <section class="week-advice-card" :class="toneClass" aria-label="Week advice">
    <div class="week-advice-card__header">
      <div>
        <span class="week-advice-card__eyebrow">{{ currentLang === 'en' ? 'Week Advice' : '本周建议' }}</span>
        <p class="week-advice-card__helper">{{ helperText }}</p>
      </div>
      <span class="week-advice-card__badge">{{ advice.title }}</span>
    </div>

    <div class="week-advice-card__body">
      <strong class="week-advice-card__title">{{ advice.title }}</strong>
      <p class="week-advice-card__message">{{ advice.message }}</p>
    </div>

    <div class="week-advice-card__actions" aria-label="Advice actions">
      <template v-for="action in advice.actions" :key="action.label">
        <button
          v-if="action.to"
          type="button"
          class="week-advice-card__chip week-advice-card__chip--interactive"
          @click="handleAction(action.to)"
        >
          {{ action.label }}
        </button>
        <span v-else class="week-advice-card__chip">
          {{ action.label }}
        </span>
      </template>
    </div>
  </section>
</template>

<style scoped>
.week-advice-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: 100%;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(250, 251, 252, 0.98));
  box-shadow: var(--shadow-card);
}

.week-advice-card--empty,
.week-advice-card--info-needed {
  background: linear-gradient(180deg, rgba(232, 245, 255, 0.95), rgba(255, 255, 255, 0.98));
}

.week-advice-card--low,
.week-advice-card--improve {
  background: linear-gradient(180deg, rgba(255, 243, 235, 0.96), rgba(255, 255, 255, 0.98));
}

.week-advice-card--good,
.week-advice-card--steady {
  background: linear-gradient(180deg, rgba(232, 245, 236, 0.96), rgba(255, 255, 255, 0.98));
}

.week-advice-card--rest {
  background: linear-gradient(180deg, rgba(240, 245, 255, 0.96), rgba(255, 255, 255, 0.98));
}

.week-advice-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.week-advice-card__eyebrow {
  display: block;
  margin-bottom: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.week-advice-card__helper {
  margin: 0;
  color: var(--color-text-tertiary);
  font-size: 12px;
  line-height: 1.4;
}

.week-advice-card__badge {
  flex: 0 0 auto;
  padding: 6px 10px;
  border-radius: var(--radius-full);
  background: rgba(74, 158, 111, 0.12);
  color: var(--color-primary-dark);
  font-size: 12px;
  font-weight: var(--font-weight-medium);
}

.week-advice-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.week-advice-card__title {
  color: var(--color-text-primary);
  font-size: 24px;
  line-height: 1.15;
}

.week-advice-card__message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
  line-height: 1.55;
}

.week-advice-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.week-advice-card__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.76);
  color: var(--color-text-primary);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  border: 1px solid rgba(97, 160, 111, 0.12);
}

.week-advice-card__chip--interactive {
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), background var(--transition-fast);
}

.week-advice-card__chip--interactive:hover {
  background: #fff;
  box-shadow: var(--shadow-card);
  transform: translateY(-1px);
}

.week-advice-card__chip--interactive:active {
  transform: scale(0.98);
}

.week-advice-card__chip--interactive:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .week-advice-card {
    padding: var(--space-4);
  }

  .week-advice-card__title {
    font-size: 22px;
  }

  .week-advice-card__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
