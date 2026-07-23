<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useAssessmentStore } from '@/stores/assessment'
import type { RecordItem } from '@/types'
import type { DisplayWeekDay } from '@/stores/record'
import { getCalorieEstimateState } from '@/utils/calorieEstimate'

interface Props {
  weekDays: DisplayWeekDay[]
  weekStart: string
  weekEnd: string
  stepsGoal: number
  durationGoal: number
}

const props = defineProps<Props>()

const { t, currentLang } = useI18n()
const assessmentStore = useAssessmentStore()

function getWeekdayLabel(weekday: string) {
  const labels = currentLang.value === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const weekdayIndex: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  }

  return labels[weekdayIndex[weekday] ?? 0]
}

const weekDays = computed(() => props.weekDays.map(day => ({
  ...day,
  label: getWeekdayLabel(day.weekday),
})))
const weekRecords = computed(() => weekDays.value.map(day => day.record).filter(Boolean) as RecordItem[])
const hasRecords = computed(() => weekRecords.value.length > 0)
const totalSteps = computed(() => weekRecords.value.reduce((sum, record) => sum + record.steps, 0))
const totalDuration = computed(() => weekRecords.value.reduce((sum, record) => sum + (record.duration ?? 0), 0))
const calorieStates = computed(() => {
  return weekRecords.value.map(record => getCalorieEstimateState(
    assessmentStore.basicInfo,
    record.steps,
    record.duration ?? 0,
  ))
})
const hasPendingCalories = computed(() => {
  return calorieStates.value.some(state => state.status === 'missing_basic_info')
})
const totalCalories = computed(() => {
  return calorieStates.value.reduce((sum, state) => {
    if (state.status === 'estimated' || state.status === 'no_activity') {
      return sum + state.calories
    }

    return sum
  }, 0)
})
const maxSteps = computed(() => Math.max(...weekDays.value.map(day => day.record?.steps ?? 0), 1))
const recordDaysLabel = computed(() => {
  return currentLang.value === 'en'
    ? `${weekRecords.value.length} days logged`
    : `有记录 ${weekRecords.value.length} 天`
})
const emptyHint = computed(() => {
  return currentLang.value === 'en'
    ? 'Tap today overview to start'
    : '点击今日概览开始记录'
})
const weekRangeLabel = computed(() => {
  const format = (date: string) => {
    const [, month, day] = date.split('-')
    return `${Number(month)}/${Number(day)}`
  }

  return `${format(props.weekStart)} - ${format(props.weekEnd)}`
})
</script>

<template>
  <section class="weekly-summary" aria-label="Weekly summary">
    <template v-if="hasRecords">
      <div class="weekly-summary__header">
        <div>
          <span class="weekly-summary__eyebrow">{{ t('record.weekSummary') }}</span>
          <span class="weekly-summary__range">{{ weekRangeLabel }}</span>
          <strong class="weekly-summary__steps">{{ totalSteps.toLocaleString() }}</strong>
          <span class="weekly-summary__steps-label">{{ t('record.stepUnit') }}</span>
        </div>
        <span class="weekly-summary__open" aria-hidden="true">›</span>
      </div>

      <div class="weekly-summary__meta">
        <span>{{ recordDaysLabel }}</span>
        <span>{{ totalDuration }} {{ t('record.minuteUnit') }}</span>
        <span v-if="hasPendingCalories">{{ currentLang === 'en' ? 'Calories pending estimate' : '热量待估算' }}</span>
        <span v-else>{{ totalCalories }} {{ t('record.kcalUnit') }}</span>
      </div>

      <div class="weekly-summary__trend" aria-hidden="true">
        <div
          v-for="day in weekDays"
          :key="day.dateKey"
          class="weekly-summary__day"
          :class="{ 'weekly-summary__day--today': day.isToday }"
        >
          <span
            class="weekly-summary__bar"
            :style="{ height: `${Math.max(10, ((day.record?.steps ?? 0) / maxSteps) * 100)}%` }"
          ></span>
          <span class="weekly-summary__day-label">{{ day.label }}</span>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="weekly-summary__empty">
        <span class="weekly-summary__eyebrow">{{ t('record.weekSummary') }}</span>
        <strong>{{ t('record.noRecords') }}</strong>
        <span>{{ emptyHint }}</span>
      </div>
    </template>
  </section>
</template>

<style scoped>
.weekly-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

.weekly-summary__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
}

.weekly-summary__eyebrow {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.weekly-summary__range {
  display: block;
  margin-bottom: var(--space-2);
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.weekly-summary__steps {
  color: var(--color-text-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: var(--font-size-data);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.weekly-summary__steps-label {
  margin-left: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
}

.weekly-summary__open {
  color: var(--color-text-tertiary);
  font-size: 28px;
  line-height: 1;
}

.weekly-summary__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2) var(--space-4);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.weekly-summary__trend {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  align-items: flex-end;
  gap: var(--space-2);
  height: 70px;
  padding-top: var(--space-2);
}

.weekly-summary__day {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  min-width: 0;
  height: 70px;
}

.weekly-summary__day-label {
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1;
}

.weekly-summary__day--today .weekly-summary__day-label {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
}

.weekly-summary__bar {
  width: 58%;
  min-height: 8px;
  border-radius: var(--radius-full) var(--radius-full) var(--radius-sm) var(--radius-sm);
  background: var(--color-primary);
  opacity: 0.85;
}

.weekly-summary__empty {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
}

.weekly-summary__empty strong {
  color: var(--color-text-primary);
  font-size: var(--font-size-h3);
}
</style>
