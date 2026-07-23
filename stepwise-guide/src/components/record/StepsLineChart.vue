<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RecordItem } from '@/types'
import { useI18n } from '@/composables/useI18n'

const props = defineProps<{
  records: RecordItem[]
  title: string
}>()

const { t } = useI18n()
const xAxisLabel = computed(() => t('record.colDate'))
const yAxisLabel = computed(() => t('record.colSteps'))

const width = 310
const height = 165
const paddingLeft = 20
const paddingRight = 8
const paddingTop = 14
const paddingBottom = 25

interface ChartPoint {
  x: number
  y: number
  xPercent: number
  yPercent: number
  steps: number
  date: string
}

const hoveredPoint = ref<ChartPoint | null>(null)

const chartRecords = computed(() => {
  return [...props.records].reverse()
})

const maxSteps = computed(() => {
  const max = Math.max(...chartRecords.value.map(record => record.steps), 0)
  return max > 0 ? max : 1
})

const chartWidth = computed(() => width - paddingLeft - paddingRight)
const chartHeight = computed(() => height - paddingTop - paddingBottom)

const points = computed(() => {
  if (chartRecords.value.length === 0) return ''

  return chartRecords.value.map((record, index) => {
    const x =
      chartRecords.value.length === 1
        ? paddingLeft + chartWidth.value / 2
        : paddingLeft + (index / (chartRecords.value.length - 1)) * chartWidth.value

    const y =
      height -
      paddingBottom -
      (record.steps / maxSteps.value) * chartHeight.value

    return `${x},${y}`
  }).join(' ')
})

const pointItems = computed<ChartPoint[]>(() => {
  return chartRecords.value.map((record, index) => {
    const x =
      chartRecords.value.length === 1
        ? paddingLeft + chartWidth.value / 2
        : paddingLeft + (index / (chartRecords.value.length - 1)) * chartWidth.value

    const y =
      height -
      paddingBottom -
      (record.steps / maxSteps.value) * chartHeight.value

    return {
      x,
      y,
      xPercent: (x / width) * 100,
      yPercent: (y / height) * 100,
      steps: record.steps,
      date: record.date,
    }
  })
})

function shouldShowDateLabel(index: number) {
  return pointItems.value.length <= 7 || index % 2 === 0
}

function showTooltip(point: ChartPoint) {
  hoveredPoint.value = point
}

function hideTooltip() {
  hoveredPoint.value = null
}
</script>

<template>
  <div class="steps-chart">

    <div v-if="records.length === 0" class="steps-chart__empty">
      No record data yet
    </div>

    <div v-else class="steps-chart__plot">
      <svg
        class="steps-chart__svg"
        :viewBox="`0 0 ${width} ${height}`"
        role="img"
      >
        <line
          :x1="paddingLeft"
          :y1="height - paddingBottom"
          :x2="width - paddingRight"
          :y2="height - paddingBottom"
          class="steps-chart__axis"
        />

        <line
          :x1="paddingLeft"
          :y1="paddingTop"
          :x2="paddingLeft"
          :y2="height - paddingBottom"
          class="steps-chart__axis"
        />

        <text
        :x="width / 2"
        :y="height - 4"
        text-anchor="middle"
        class="steps-chart__axis-label"
        >
          {{ xAxisLabel }}
        </text>

        <text
          :x="5"
          :y="height / 2"
          text-anchor="middle"
          class="steps-chart__axis-label"
          :transform="`rotate(-90 9 ${height / 2})`"
        >
          {{ yAxisLabel }}
        </text>

        <text
          :x="paddingLeft - 5"
          :y="height - paddingBottom + 3"
          text-anchor="end"
          class="steps-chart__tick"
        >
          0
        </text>

        <text
          :x="paddingLeft - 5"
          :y="paddingTop + 3"
          text-anchor="end"
          class="steps-chart__tick"
        >
          {{ maxSteps }}
        </text>

        <text
          v-for="(point, index) in pointItems"
          v-show="shouldShowDateLabel(index)"
          :key="point.date + '-label'"
          :x="point.x"
          :y="height - paddingBottom + 10"
          text-anchor="middle"
          class="steps-chart__tick"
        >
          {{ point.date.slice(5) }}
        </text>

        <polyline
          :points="points"
          fill="none"
          class="steps-chart__line"
        />

        <g
          v-for="point in pointItems"
          :key="point.date"
          class="steps-chart__point-group"
          @mouseenter="showTooltip(point)"
          @mouseleave="hideTooltip"
        >
          <circle
            :cx="point.x"
            :cy="point.y"
            r="1.6"
            class="steps-chart__point"
          />

          <circle
            :cx="point.x"
            :cy="point.y"
            r="7"
            class="steps-chart__hit-area"
          />
        </g>
      </svg>

      <div
        v-if="hoveredPoint"
        class="steps-chart__tooltip"
        :style="{
          left: hoveredPoint.xPercent + '%',
          top: hoveredPoint.yPercent + '%',
        }"
      >
        {{ hoveredPoint.steps }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.steps-chart {
  padding: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  font-family: inherit;
}

.steps-chart__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.steps-chart__title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.steps-chart__hint {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}

.steps-chart__empty {
  padding: var(--space-6) 0;
  text-align: center;
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.steps-chart__plot {
  position: relative;
  width: 100%;
}

.steps-chart__svg {
  width: 100%;
  height: auto;
  display: block;
  font-family: 'DM Sans', sans-serif;
}

.steps-chart__svg text {
  font-family: 'DM Sans', sans-serif;
}

.steps-chart__axis {
  stroke: var(--color-border);
  stroke-width: 0.9;
}

.steps-chart__axis-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 6px;
  font-weight: var(--font-weight-medium);
  fill: var(--color-text-secondary);
}

.steps-chart__tick {
  font-family: 'DM Sans', sans-serif;
  font-size: 5px;
  font-weight: var(--font-weight-medium);
  fill: var(--color-text-tertiary);
}

.steps-chart__line {
  stroke: var(--color-primary);
  stroke-width: 0.9;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.steps-chart__point {
  fill: var(--color-surface);
  stroke: var(--color-primary);
  stroke-width: 1;
}

.steps-chart__hit-area {
  fill: transparent;
  cursor: pointer;
}

.steps-chart__tooltip {
  position: absolute;
  transform: translate(-50%, -150%);
  padding: 4px 12px;
  background: var(--color-surface);
  border: 0.5px solid var(--color-border);
  border-radius: 4px;
  box-shadow: none;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.2;
  color: var(--color-text-primary);
  pointer-events: none;
  white-space: nowrap;
  z-index: 2;
}
</style>