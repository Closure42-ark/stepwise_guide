<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useAssessmentStore } from '@/stores/assessment'
import type { RecordItem } from '@/types'
import type { DisplayWeekDay } from '@/stores/record'
import { getCalorieEstimateState } from '@/utils/calorieEstimate'

interface Props {
  show: boolean
  records: RecordItem[]
  weekDays: DisplayWeekDay[]
  weekStart: string
  weekEnd: string
  dailyGoal: number
  durationGoal: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const { t, currentLang } = useI18n()
const assessmentStore = useAssessmentStore()
const expandedDate = ref('')
const selectedDate = ref('')
let previousBodyOverflow = ''

const recentRecords = computed(() => props.records.slice(0, 7))
const hasRecords = computed(() => recentRecords.value.length > 0)
const stepsColor = '#19A7FF'
const durationColor = '#FFB800'
const chartWidth = 320
const chartHeight = 150
const chartLeft = 24
const chartRight = 24
const chartTop = 16
const chartBottom = 116
const chartValueHeight = chartBottom - chartTop
const chartDayGap = (chartWidth - chartLeft - chartRight) / 6
const durationBarWidth = 14

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

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

function formatShortDate(dateKey: string) {
  const [, month, day] = dateKey.split('-')
  return `${Number(month)}/${Number(day)}`
}

const weekDays = computed(() => {
  return props.weekDays.map(day => ({
    ...day,
    label: getWeekdayLabel(day.weekday),
    shortDate: formatShortDate(day.dateKey),
  }))
})
const weekRecords = computed(() => weekDays.value.map(day => day.record).filter(Boolean) as RecordItem[])
const selectedDay = computed(() => {
  return weekDays.value.find(day => day.dateKey === selectedDate.value)
    ?? weekDays.value.find(day => day.isToday)
    ?? weekDays.value[0]
})
const weekRangeLabel = computed(() => {
  return `${formatShortDate(props.weekStart)} - ${formatShortDate(props.weekEnd)}`
})
const maxStepsForLine = computed(() => Math.max(
  props.dailyGoal,
  ...weekRecords.value.map(record => record.steps),
  1,
))
const maxDurationForBars = computed(() => Math.max(
  props.durationGoal,
  ...weekRecords.value.map(record => record.duration ?? 0),
  1,
))
const chartDays = computed(() => weekDays.value.map((day, index) => {
  const x = chartLeft + index * chartDayGap

  return {
    ...day,
    x,
    hitX: x - chartDayGap / 2,
    hitWidth: chartDayGap,
  }
}))
const stepPoints = computed(() => weekDays.value.map((day, index) => {
  const hasRecord = Boolean(day.record)
  const ratio = hasRecord ? Math.min((day.record?.steps ?? 0) / maxStepsForLine.value, 1) : 0
  const x = chartLeft + index * chartDayGap

  return {
    dateKey: day.dateKey,
    x,
    y: chartBottom - ratio * chartValueHeight,
    hasRecord,
    isSelected: selectedDate.value === day.dateKey,
  }
}))
const stepsLineSegments = computed(() => {
  const segments: string[] = []
  let currentSegment: string[] = []

  stepPoints.value.forEach((point) => {
    if (!point.hasRecord) {
      if (currentSegment.length > 1) {
        segments.push(currentSegment.join(' '))
      }

      currentSegment = []
      return
    }

    currentSegment.push(`${point.x},${point.y}`)
  })

  if (currentSegment.length > 1) {
    segments.push(currentSegment.join(' '))
  }

  return segments
})
const durationBars = computed(() => chartDays.value
  .filter(day => day.record)
  .map((day) => {
    const ratio = Math.min(((day.record?.duration ?? 0) / maxDurationForBars.value), 1)
    const height = Math.max(2, ratio * chartValueHeight)

    return {
      dateKey: day.dateKey,
      x: day.x - durationBarWidth / 2,
      y: chartBottom - height,
      height,
    }
  }))

function getCaloriesText(record: RecordItem) {
  const calorieState = getCalorieEstimateState(
    assessmentStore.basicInfo,
    record.steps,
    record.duration ?? 0,
  )

  if (calorieState.status === 'missing_basic_info') {
    return currentLang.value === 'en' ? 'Calories pending estimate' : '热量待估算'
  }

  return `${calorieState.calories} ${t('record.kcalUnit')}`
}

function formatPercent(steps: number) {
  const percent = Math.round((steps / props.dailyGoal) * 100)
  return percent > 100 ? '100%+' : `${percent}%`
}

function getDayAriaLabel(day: { label: string; shortDate: string; record?: RecordItem }) {
  if (!day.record) {
    return `${day.label} ${day.shortDate}`
  }

  return `${day.label} ${day.shortDate}, ${day.record.steps} ${t('record.stepUnit')}, ${day.record.duration ?? 0} ${t('record.minuteUnit')}`
}

function formatDateLabel(record: RecordItem) {
  const parsedDate = new Date(`${record.date}T00:00:00`)

  if (!Number.isNaN(parsedDate.getTime())) {
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

    if (sameDay(parsedDate, today)) {
      return currentLang.value === 'en' ? 'Today' : '今天'
    }

    if (sameDay(parsedDate, yesterday)) {
      return currentLang.value === 'en' ? 'Yesterday' : '昨天'
    }
  }

  const weekdayMap: Record<string, string> = {
    Mon: t('record.weekdayMon'),
    Tue: t('record.weekdayTue'),
    Wed: t('record.weekdayWed'),
    Thu: t('record.weekdayThu'),
    Fri: t('record.weekdayFri'),
    Sat: t('record.weekdaySat'),
    Sun: t('record.weekdaySun'),
  }

  return weekdayMap[record.weekday] || record.date
}

function toggleRecord(record: RecordItem) {
  expandedDate.value = expandedDate.value === record.date ? '' : record.date
}

function selectDay(dateKey: string) {
  selectedDate.value = dateKey
}

function close() {
  emit('close')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
  }
}

function lockBodyScroll() {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlockBodyScroll() {
  document.body.style.overflow = previousBodyOverflow
}

watch(
  () => props.show,
  (show) => {
    if (show) {
      expandedDate.value = ''
      selectedDate.value = toDateKey(new Date())
      lockBodyScroll()
      document.addEventListener('keydown', handleKeydown)
    } else {
      unlockBodyScroll()
      document.removeEventListener('keydown', handleKeydown)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  unlockBodyScroll()
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="show" class="history-modal">
        <div class="history-modal__backdrop" @click="close"></div>
        <Transition name="modal" appear>
          <section
            class="history-modal__panel"
            role="dialog"
            aria-modal="true"
            :aria-label="t('record.viewHistory')"
            @click.stop
          >
            <header class="history-modal__header">
              <div>
                <h3 class="history-modal__title">{{ t('record.viewHistory') }}</h3>
                <p class="history-modal__subtitle">{{ t('record.weekStepsTrend') }} · {{ weekRangeLabel }}</p>
              </div>
              <button class="history-modal__close" type="button" aria-label="Close" @click="close">
                <span aria-hidden="true">&times;</span>
              </button>
            </header>

            <template v-if="hasRecords">

              <div class="history-modal__legend" aria-hidden="true">
                <span><i class="history-modal__legend-line" :style="{ backgroundColor: stepsColor }"></i>{{ t('record.steps') }}</span>
                <span><i class="history-modal__legend-bar" :style="{ backgroundColor: durationColor }"></i>{{ t('record.duration') }}</span>
              </div>
              <div class="history-modal__trend">
                <svg
                  class="history-modal__chart"
                  :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
                  role="img"
                  :aria-label="t('record.weekStepsTrend')"
                >
                  <line
                    class="history-modal__baseline"
                    :x1="chartLeft"
                    :x2="chartWidth - chartRight"
                    :y1="chartBottom"
                    :y2="chartBottom"
                  />
                  <rect
                    v-for="bar in durationBars"
                    :key="bar.dateKey"
                    class="history-modal__duration-bar"
                    :x="bar.x"
                    :y="bar.y"
                    :width="durationBarWidth"
                    :height="bar.height"
                    :fill="durationColor"
                    rx="5"
                  />
                  <polyline
                    v-for="segment in stepsLineSegments"
                    :key="segment"
                    class="history-modal__steps-path"
                    :points="segment"
                    :stroke="stepsColor"
                  />
                  <circle
                    v-for="point in stepPoints.filter(item => item.hasRecord)"
                    :key="point.dateKey"
                    class="history-modal__steps-point"
                    :class="{
                      'history-modal__steps-point--selected': point.isSelected,
                    }"
                    :cx="point.x"
                    :cy="point.y"
                    r="3.4"
                    :fill="stepsColor"
                    :stroke="stepsColor"
                  />
                  <text
                    v-for="day in chartDays"
                    :key="`label-${day.dateKey}`"
                    class="history-modal__trend-label"
                    :class="{ 'history-modal__trend-label--today': day.isToday }"
                    :x="day.x"
                    y="140"
                    text-anchor="middle"
                  >
                    {{ day.label }}
                  </text>
                  <rect
                    v-for="day in chartDays"
                    :key="`hit-${day.dateKey}`"
                    class="history-modal__chart-hit"
                    :class="{ 'history-modal__chart-hit--selected': selectedDate === day.dateKey }"
                    :x="Math.max(0, day.hitX)"
                    y="4"
                    :width="day.hitX < 0 || day.hitX + day.hitWidth > chartWidth ? day.hitWidth / 2 : day.hitWidth"
                    height="140"
                    rx="6"
                    tabindex="0"
                    role="button"
                    :aria-label="getDayAriaLabel(day)"
                    @click="selectDay(day.dateKey)"
                    @keydown.enter="selectDay(day.dateKey)"
                    @keydown.space.prevent="selectDay(day.dateKey)"
                  />
                </svg>
              </div>


              <div v-if="selectedDay" class="history-modal__selected">
                <strong>{{ selectedDay.label }} {{ selectedDay.shortDate }}</strong>
                <span v-if="selectedDay.record">
                  {{ selectedDay.record.steps.toLocaleString() }} {{ t('record.stepUnit') }} ·
                  {{ selectedDay.record.duration ?? 0 }} {{ t('record.minuteUnit') }} ·
                  {{ getCaloriesText(selectedDay.record) }}
                </span>
                <span v-else>
                  {{ currentLang === 'en' ? 'No record for this day' : '当天暂无记录' }}
                </span>
              </div>

              <div class="history-modal__list">
                <button
                  v-for="record in recentRecords"
                  :key="record.date"
                  class="history-record"
                  type="button"
                  @click="toggleRecord(record)"
                >
                  <span class="history-record__top">
                    <span class="history-record__date">{{ formatDateLabel(record) }}</span>
                    <strong class="history-record__steps">{{ record.steps.toLocaleString() }} {{ t('record.stepUnit') }}</strong>
                    <span class="history-record__percent">{{ formatPercent(record.steps) }}</span>
                  </span>
                  <span class="history-record__meta">
                    {{ record.duration ?? 0 }} {{ t('record.minuteUnit') }} · {{ getCaloriesText(record) }}
                  </span>
                  <span v-if="expandedDate === record.date" class="history-record__details">
                    <span>{{ t('record.date') }}: {{ record.date }}</span>
                    <span>{{ t('record.colSteps') }}: {{ record.steps.toLocaleString() }}</span>
                    <span>{{ t('record.colDuration') }}: {{ record.duration ?? 0 }} {{ t('record.minuteUnit') }}</span>
                    <span>{{ t('record.colCalories') }}: {{ getCaloriesText(record) }}</span>
                  </span>
                </button>
              </div>
            </template>

            <div v-else class="history-modal__empty">
              <strong>{{ t('record.noRecords') }}</strong>
              <span>
                {{ currentLang === 'en'
                  ? 'Complete a record to see your steps trend here.'
                  : '完成一次记录后，这里会显示你的步数趋势。' }}
              </span>
            </div>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.history-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.history-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(45, 52, 54, 0.35);
}

.history-modal__panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: min(92vw, 560px);
  max-height: 76vh;
  margin: 8vh auto 0;
  padding: var(--space-5);
  overflow-y: auto;
  border-radius: 20px;
  background: var(--color-surface);
  box-shadow: var(--shadow-modal);
}

.history-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.history-modal__title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
}

.history-modal__subtitle {
  margin: var(--space-2) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.history-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.history-modal__close:hover {
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.history-modal__trend {
  min-height: 182px;
  padding: var(--space-4) var(--space-3);
  margin-bottom: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-bg);
}

.history-modal__chart {
  display: block;
  width: 100%;
  height: 150px;
  overflow: visible;
}

.history-modal__duration-bar {
  opacity: 0.24;
}

.history-modal__baseline {
  stroke: var(--color-border);
  stroke-width: 1;
  opacity: 0.45;
  vector-effect: non-scaling-stroke;
}

.history-modal__steps-path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.5;
  vector-effect: non-scaling-stroke;
}

.history-modal__steps-point {
  stroke: var(--color-surface);
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}

.history-modal__steps-point--selected {
  stroke-width: 2;
}

.history-modal__trend-label {
  fill: var(--color-text-secondary);
  font-size: 11px;
  pointer-events: none;
}

.history-modal__trend-label--today {
  fill: var(--color-text-primary);
  font-weight: var(--font-weight-bold);
}

.history-modal__chart-hit {
  fill: transparent;
  cursor: pointer;
  outline: none;
}

.history-modal__chart-hit:hover,
.history-modal__chart-hit:focus-visible,
.history-modal__chart-hit--selected {
  fill: transparent;
}

.history-modal__legend {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.history-modal__legend span {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.history-modal__legend i {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
}

.history-modal__legend-line {
  width: 18px !important;
  height: 3px !important;
}

.history-modal__legend-bar {
  opacity: 0.32;
}

.history-modal__selected {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-primary-light);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.history-modal__selected strong {
  color: var(--color-text-primary);
  font-size: var(--font-size-body);
}

.history-modal__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.history-record {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.history-record:hover {
  border-color: var(--color-primary-lighter);
  background: var(--color-bg);
}

.history-record__top {
  display: grid;
  grid-template-columns: minmax(48px, 0.8fr) minmax(0, 1.8fr) auto;
  align-items: baseline;
  gap: var(--space-3);
}

.history-record__date {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.history-record__steps {
  color: var(--color-text-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: var(--font-size-data-sm);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}

.history-record__percent {
  color: var(--color-primary);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
}

.history-record__meta {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.history-record__details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
  padding-top: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.history-modal__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8) var(--space-4);
  color: var(--color-text-secondary);
  text-align: center;
}

.history-modal__empty strong {
  color: var(--color-text-primary);
  font-size: var(--font-size-h3);
}

@media (max-width: 640px) {
  .history-modal__panel {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 12px;
    width: auto;
    max-height: calc(100vh - 24px);
    margin: 0;
  }

  .history-record__top {
    grid-template-columns: 1fr auto;
  }

  .history-record__steps {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .history-record__percent {
    grid-column: 2;
    grid-row: 1;
  }

  .history-record__details {
    grid-template-columns: 1fr;
  }
}
</style>
