<script setup lang="ts">
import type { RecordItem } from '@/types'
import { useI18n } from '@/composables/useI18n'
import { useAssessmentStore } from '@/stores/assessment'
import { getCalorieEstimateState } from '@/utils/calorieEstimate'

interface Props {
  records: RecordItem[]
}

defineProps<Props>()

const { t } = useI18n()
const assessmentStore = useAssessmentStore()

function getWeekdayLabel(weekday: string) {
  const map: Record<string, string> = {
    Mon: t('record.weekdayMon'),
    Tue: t('record.weekdayTue'),
    Wed: t('record.weekdayWed'),
    Thu: t('record.weekdayThu'),
    Fri: t('record.weekdayFri'),
    Sat: t('record.weekdaySat'),
    Sun: t('record.weekdaySun'),
  }

  return map[weekday] || weekday
}
// Convert stored exercise codes into the current interface language.
function getExerciseLabel(type: string) {
  const map: Record<string, string> = {
    walk: t('record.walking'),
    jog: t('record.running'),
    stretch: t('record.stretching'),
    bike: t('record.cycling'),
    strength: t('record.strength'),
    '--': '--',
  }

  return map[type] || type || '--'
}

function getCaloriesText(record: RecordItem) {
  const calorieState = getCalorieEstimateState(
    assessmentStore.basicInfo,
    record.steps,
    record.duration ?? 0,
  )

  if (calorieState.status === 'missing_basic_info') {
    return '待估算'
  }

  return `${calorieState.calories}${t('record.kcalUnit')}`
}
</script>

<template>
  <div class="record-table">
    <div class="record-table__header">
      <span class="record-table__cell">{{ t('record.colDate') }}</span>
      <span class="record-table__cell record-table__cell--right">{{ t('record.colSteps') }}</span>
      <span class="record-table__cell">{{ t('record.colExercise') }}</span>
      <span class="record-table__cell record-table__cell--right">{{ t('record.colDuration') }}</span>
      <span class="record-table__cell record-table__cell--right">{{ t('record.colCalories') }}</span>
    </div>
    <div v-for="record in records" :key="record.date" class="record-table__row">
      <span class="record-table__cell">
      <span class="record-table__date record-table__num">{{ record.date }}</span>
      <span class="record-table__weekday">{{ getWeekdayLabel(record.weekday) }}</span>
      </span>
      <span class="record-table__cell record-table__cell--right record-table__num">
        {{ record.steps.toLocaleString() }}
      </span>
      <span class="record-table__cell">{{ getExerciseLabel(record.exercise) }}</span>
      <span class="record-table__cell record-table__cell--right record-table__num">
        {{ record.duration ? record.duration + t('record.minuteUnit') : '--' }}
      </span>
      <span class="record-table__cell record-table__cell--right record-table__num">
        {{ getCaloriesText(record) }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.record-table {
  width: 100%;
}

.record-table__header {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 0.8fr 1fr;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  border-bottom: 1.5px solid var(--color-border);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.record-table__row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 0.8fr 1fr;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  transition: background var(--transition-fast);
}

.record-table__row:hover {
  background: var(--color-bg);
}

.record-table__row:last-child {
  border-bottom: none;
}

.record-table__cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.record-table__cell--right {
  align-items: flex-end;
  text-align: right;
}

.record-table__date {
  font-weight: var(--font-weight-medium);
}

.record-table__weekday {
  font-size: var(--font-size-caption);
  color: var(--color-text-tertiary);
}

.record-table__num {
  font-family: 'DM Sans', sans-serif;
  font-weight: var(--font-weight-medium);
}
</style>
