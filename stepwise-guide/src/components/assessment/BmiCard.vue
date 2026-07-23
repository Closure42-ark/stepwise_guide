<script setup lang="ts">
import { useAssessmentStore } from '@/stores/assessment'
import { useAnimatedNumber } from '@/composables/useAnimation'
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const store = useAssessmentStore()
const { t } = useI18n()

const bmiDisplay = computed(() => store.result?.bmi ?? 0)
const { current: animatedBmi } = useAnimatedNumber(bmiDisplay.value, 800)

const bmiPosition = computed(() => {
  const bmi = animatedBmi.value
  const min = 14
  const max = 35
  return Math.max(0, Math.min(100, ((bmi - min) / (max - min)) * 100))
})

const bmiColor = computed(() => {
  const bmi = store.result?.bmi ?? 0
  if (bmi < 18.5) return 'var(--color-info)'
  if (bmi < 24) return 'var(--color-success)'
  if (bmi < 28) return 'var(--color-warning)'
  return '#E17055'
})
</script>

<template>
  <div class="bmi-card">
    <div class="bmi-card__value-row">
      <span class="bmi-card__number">{{ animatedBmi.toFixed(1) }}</span>
      <span class="bmi-card__category" :style="{ color: bmiColor }">
        {{ store.result?.bmiCategory }}
      </span>
    </div>
    <div class="bmi-card__scale">
      <div class="bmi-card__scale-track">
        <div class="bmi-card__scale-segment bmi-card__scale-segment--thin"></div>
        <div class="bmi-card__scale-segment bmi-card__scale-segment--normal"></div>
        <div class="bmi-card__scale-segment bmi-card__scale-segment--overweight"></div>
        <div class="bmi-card__scale-segment bmi-card__scale-segment--obese"></div>
      </div>
      <div class="bmi-card__indicator" :style="{ left: `${bmiPosition}%` }">
        <div class="bmi-card__indicator-dot"></div>
      </div>
    </div>
    <div class="bmi-card__labels">
      <span>{{ t('assess.bmiUnderweight') }}</span>
      <span>{{ t('assess.bmiNormal') }}</span>
      <span>{{ t('assess.bmiOverweight') }}</span>
      <span>{{ t('assess.bmiObese') }}</span>
    </div>
  </div>
</template>

<style scoped>
.bmi-card {
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

.bmi-card__value-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.bmi-card__number {
  font-family: 'DM Sans', sans-serif;
  font-size: var(--font-size-data);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.bmi-card__category {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
}

.bmi-card__scale {
  position: relative;
  margin-bottom: var(--space-2);
}

.bmi-card__scale-track {
  display: flex;
  height: 8px;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.bmi-card__scale-segment {
  flex: 1;
}

.bmi-card__scale-segment--thin {
  background: var(--color-info);
}

.bmi-card__scale-segment--normal {
  background: var(--color-success);
}

.bmi-card__scale-segment--overweight {
  background: var(--color-warning);
}

.bmi-card__scale-segment--obese {
  background: #E17055;
}

.bmi-card__indicator {
  position: absolute;
  top: -4px;
  transform: translateX(-50%);
  transition: left 0.8s ease-out;
}

.bmi-card__indicator-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-text-primary);
  border: 2.5px solid var(--color-surface);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.bmi-card__labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-tertiary);
}
</style>
