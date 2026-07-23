<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSlider from '@/components/base/BaseSlider.vue'
import { useI18n } from '@/composables/useI18n'
import type { CalorieEstimateState } from '@/utils/calorieEstimate'

interface Props {
  calories: number
  calorieStatus: CalorieEstimateState['status']
  caloriesGoal: number
  duration: number
  durationGoal: number
  steps: number
  stepsGoal: number
  caloriesLabel: string
  durationLabel: string
  stepsLabel: string
  kcalUnit: string
  minuteUnit: string
  stepUnit: string
}

interface RingConfig {
  key: string
  value: number
  goal: number
  radius: number
  width: number
  trackColor: string
  progressColor: string
  icon: 'flame' | 'timer' | 'footprints'
}

type GoalType = 'calories' | 'duration' | 'steps'

const props = defineProps<Props>()
const emit = defineEmits<{
  updateGoal: [payload: { type: GoalType; value: number }]
}>()
const { currentLang } = useI18n()
const router = useRouter()

const center = 120
const startAngle = 150
const sweepAngle = 240
const sweepRadians = (sweepAngle * Math.PI) / 180
const displayedProgress = ref<Record<string, number>>({
  calories: 0,
  duration: 0,
  steps: 0,
})
let animationFrameId: number | null = null
const editingGoalType = ref<GoalType | null>(null)
const draftGoalValue = ref(0)

function clampProgress(value: number, goal: number) {
  if (goal <= 0) return 0
  return Math.min(Math.max(value / goal, 0), 1)
}

function polarToCartesian(radius: number, angle: number) {
  const angleInRadians = (angle * Math.PI) / 180

  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  }
}

function describeArc(radius: number, start: number, end: number) {
  const startPoint = polarToCartesian(radius, start)
  const endPoint = polarToCartesian(radius, end)
  const largeArcFlag = end - start <= 180 ? 0 : 1

  return [
    'M', startPoint.x, startPoint.y,
    'A', radius, radius, 0, largeArcFlag, 1, endPoint.x, endPoint.y,
  ].join(' ')
}

function formatNumber(value: number) {
  return value.toLocaleString()
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3)
}

function animateProgress(progressEntries: readonly (readonly [string, number])[]) {
  if (typeof requestAnimationFrame !== 'function') {
    displayedProgress.value = Object.fromEntries(progressEntries)
    return
  }

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }

  const duration = 700
  const startedAt = performance.now()
  const startProgress = { ...displayedProgress.value }
  const targetProgress = Object.fromEntries(progressEntries)

  const tick = (currentTime: number) => {
    const elapsed = currentTime - startedAt
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeOutCubic(progress)
    const nextProgress: Record<string, number> = {}

    for (const [key, target] of progressEntries) {
      const start = startProgress[key] ?? 0
      nextProgress[key] = start + (target - start) * easedProgress
    }

    displayedProgress.value = nextProgress

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(tick)
    } else {
      animationFrameId = null
    }
  }

  animationFrameId = requestAnimationFrame(tick)
}

const ringConfigs = computed<RingConfig[]>(() => [
  {
    key: 'calories',
    value: props.calories,
    goal: props.caloriesGoal,
    radius: 88,
    width: 18,
    trackColor: '#FFE3DD',
    progressColor: '#FF3B30',
    icon: 'flame',
  },
  {
    key: 'duration',
    value: props.duration,
    goal: props.durationGoal,
    radius: 64,
    width: 18,
    trackColor: '#FFF1C8',
    progressColor: '#FFB800',
    icon: 'timer',
  },
  {
    key: 'steps',
    value: props.steps,
    goal: props.stepsGoal,
    radius: 40,
    width: 18,
    trackColor: '#DDF2FF',
    progressColor: '#19A7FF',
    icon: 'footprints',
  },
])

const rings = computed(() => {
  return ringConfigs.value.map((ring) => {
    const targetProgress = clampProgress(ring.value, ring.goal)
    const progress = displayedProgress.value[ring.key] ?? 0
    const endAngle = startAngle + sweepAngle * progress
    const pathLength = ring.radius * sweepRadians

    return {
      ...ring,
      progress,
      targetProgress,
      pathLength,
      dashOffset: pathLength * (1 - progress),
      trackPath: describeArc(ring.radius, startAngle, startAngle + sweepAngle),
      iconPosition: polarToCartesian(ring.radius, endAngle),
    }
  })
})

watch(
  () => ringConfigs.value.map((ring) => [ring.key, clampProgress(ring.value, ring.goal)] as const),
  (progressEntries) => {
    animateProgress(progressEntries)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})

const metrics = computed(() => [
  {
    key: 'calories',
    label: props.caloriesLabel,
    value: props.calories,
    goal: props.caloriesGoal,
    unit: props.kcalUnit,
    color: '#FF3B30',
    min: 50,
    max: 2000,
    step: 50,
    status: props.calorieStatus,
  },
  {
    key: 'duration',
    label: props.durationLabel,
    value: props.duration,
    goal: props.durationGoal,
    unit: props.minuteUnit,
    color: '#FFB800',
    min: 5,
    max: 240,
    step: 5,
  },
  {
    key: 'steps',
    label: props.stepsLabel,
    value: props.steps,
    goal: props.stepsGoal,
    unit: props.stepUnit,
    color: '#19A7FF',
    min: 1000,
    max: 30000,
    step: 500,
  },
])
const editingMetric = computed(() => {
  return metrics.value.find(metric => metric.key === editingGoalType.value) ?? null
})

function formatGoalValue(value: number, unit: string) {
  return `${value.toLocaleString()} ${unit}`
}

function openGoalEditor(type: GoalType) {
  const metric = metrics.value.find(item => item.key === type)

  if (!metric) return

  editingGoalType.value = type
  draftGoalValue.value = metric.goal
}

function closeGoalEditor() {
  editingGoalType.value = null
}

function saveGoal() {
  if (!editingMetric.value || !editingGoalType.value) return

  emit('updateGoal', {
    type: editingGoalType.value,
    value: draftGoalValue.value,
  })
  closeGoalEditor()
}

function goToBasicInfo() {
  router.push('/basic-info')
}
</script>

<template>
  <section class="today-overview-card" aria-label="Today overview">
    <div class="today-overview-card__rings" aria-hidden="true">
      <svg class="today-overview-card__svg" viewBox="0 0 240 240" role="img">
        <g v-for="ring in rings" :key="`${ring.key}-track`">
          <path
            class="today-overview-card__track"
            :d="ring.trackPath"
            :stroke="ring.trackColor"
            :stroke-width="ring.width"
          />
          <path
            class="today-overview-card__progress"
            :d="ring.trackPath"
            :stroke="ring.progressColor"
            :stroke-width="ring.width"
            :stroke-dasharray="ring.pathLength"
            :stroke-dashoffset="ring.dashOffset"
          />
          <g
            class="today-overview-card__icon"
            :class="{ 'today-overview-card__icon--hidden': ring.progress === 0 }"
            :transform="`translate(${ring.iconPosition.x} ${ring.iconPosition.y})`"
          >
            <circle :r="ring.width * 0.44" :fill="ring.progressColor" />

            <path
              v-if="ring.icon === 'flame'"
              d="M0 -7 C2.8 -4.8 4.4 -2.1 4.4 1 C4.4 4.6 2.1 7.2 0 7.2 C-2.8 7.2 -4.8 4.9 -4.8 1.9 C-4.8 -0.4 -3.7 -2.6 -1.7 -4.8 C-1.5 -2.8 -0.7 -1.3 0 -0.1 C0.9 -1.8 1.1 -4.2 0 -7 Z"
              fill="none"
              stroke="#fff"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <g
              v-else-if="ring.icon === 'timer'"
              stroke="#fff"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            >
              <circle cx="0" cy="0" r="5.8" />
              <path d="M-2 -7.6h4" />
              <path d="M0 -5.8v1.3" />
              <path d="M0 0 2.8 -2.2" />
            </g>
            <g
              v-else
              stroke="#fff"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              fill="none"
            >
              <path d="M-4.8 -3.8c1.2 0 2.2 1 2.2 2.2S-3.6.6-4.8.6-7-0.4-7-1.6s1-2.2 2.2-2.2Z" />
              <path d="M2.4 0c1.2 0 2.2 1 2.2 2.2S3.6 4.4 2.4 4.4.2 3.4.2 2.2 1.2 0 2.4 0Z" />
              <path d="M-1.8 -5c1 0 1.8.8 1.8 1.8S-.8-1.4-1.8-1.4s-1.8-.8-1.8-1.8S-2.8-5-1.8-5Z" />
              <path d="M5.4 -1c1 0 1.8.8 1.8 1.8S6.4 2.6 5.4 2.6 3.6 1.8 3.6.8 4.4-1 5.4-1Z" />
            </g>
          </g>
        </g>
      </svg>
    </div>

    <div class="today-overview-card__metrics" @click.stop>
      <button
        v-for="metric in metrics"
        :key="metric.key"
        class="today-overview-card__metric"
        type="button"
        @click="openGoalEditor(metric.key as GoalType)"
      >
        <div class="today-overview-card__metric-label">
          <span class="today-overview-card__dot" :style="{ backgroundColor: metric.color }"></span>
          <span>{{ metric.label }}</span>
        </div>
        <div class="today-overview-card__metric-value">
          <template v-if="metric.key === 'calories' && metric.status === 'missing_basic_info'">
            <strong class="today-overview-card__metric-text">
              {{ currentLang === 'en' ? 'Estimate later' : '待估算' }}
            </strong>
            <button
              class="today-overview-card__metric-link"
              type="button"
              @click.stop="goToBasicInfo"
            >
              {{ currentLang === 'en' ? 'Fill basic info' : '完善基础信息' }}
            </button>
          </template>
          <template v-else>
            <strong>{{ formatNumber(metric.value) }}</strong>
            <span>/{{ formatNumber(metric.goal) }} {{ metric.unit }}</span>
          </template>
        </div>
      </button>
    </div>

    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="editingMetric" class="goal-modal">
          <div class="goal-modal__backdrop" @click="closeGoalEditor"></div>
          <Transition name="modal" appear>
            <section class="goal-modal__panel" role="dialog" aria-modal="true" @click.stop>
              <header class="goal-modal__header">
                <h3 class="goal-modal__title">
                  {{ currentLang === 'en' ? `Edit ${editingMetric.label} Goal` : `修改${editingMetric.label}目标` }}
                </h3>
                <button class="goal-modal__close" type="button" aria-label="Close" @click="closeGoalEditor">
                  <span aria-hidden="true">&times;</span>
                </button>
              </header>

              <BaseSlider
                v-model="draftGoalValue"
                :min="editingMetric.min"
                :max="editingMetric.max"
                :step="editingMetric.step"
                :label="editingMetric.label"
                :value-formatter="(value) => formatGoalValue(value, editingMetric!.unit)"
              />

              <footer class="goal-modal__footer">
                <BaseButton type="primary" size="lg" class="goal-modal__save" @click="saveGoal">
                  {{ currentLang === 'en' ? 'Save Goal' : '保存目标' }}
                </BaseButton>
              </footer>
            </section>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.today-overview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
}

.today-overview-card__rings {
  display: flex;
  justify-content: center;
  width: 100%;
}

.today-overview-card__svg {
  width: min(280px, 100%);
  height: auto;
  overflow: visible;
}

.today-overview-card__track,
.today-overview-card__progress {
  fill: none;
  stroke-linecap: round;
}

.today-overview-card__progress {
  will-change: stroke-dashoffset;
}

.today-overview-card__icon {
  opacity: 1;
  transition: opacity var(--transition-fast);
  will-change: transform;
}

.today-overview-card__icon--hidden {
  opacity: 0;
}

.today-overview-card__metrics {
  display: flex;
  width: 100%;
  max-width: 720px;
  justify-content: center;
}

.today-overview-card__metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  flex: 1;
  min-width: 0;
  padding: 0 var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  text-align: center;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast);
}

.today-overview-card__metric + .today-overview-card__metric {
  border-left: 1px solid var(--color-border);
}

.today-overview-card__metric:hover {
  background: var(--color-bg);
  border-color: var(--color-border);
}

.today-overview-card__metric:active {
  transform: scale(0.98);
}

.today-overview-card__metric-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-normal);
  white-space: nowrap;
}

.today-overview-card__dot {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  flex: 0 0 auto;
}

.today-overview-card__metric-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-tight);
  white-space: nowrap;
}

.today-overview-card__metric-value strong {
  color: var(--color-text-primary);
  font-family: 'DM Sans', sans-serif;
  font-size: 30px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0;
}

.today-overview-card__metric-text {
  font-size: 20px !important;
  line-height: 1.2;
}

.today-overview-card__metric-link {
  border: 0;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  text-decoration: underline;
}

.goal-modal {
  position: fixed;
  inset: 0;
  z-index: 1100;
}

.goal-modal__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(45, 52, 54, 0.35);
}

.goal-modal__panel {
  position: relative;
  z-index: 1;
  width: min(92vw, 420px);
  margin: 14vh auto 0;
  padding: var(--space-5);
  border-radius: 20px;
  background: var(--color-surface);
  box-shadow: var(--shadow-modal);
}

.goal-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.goal-modal__title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
}

.goal-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 24px;
  cursor: pointer;
}

.goal-modal__close:hover {
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.goal-modal__footer {
  margin-top: var(--space-5);
}

.goal-modal__save {
  width: 100%;
  min-height: 48px;
  border-radius: 14px;
  font-weight: 600;
}

@media (max-width: 640px) {
  .today-overview-card {
    padding: var(--space-5);
    gap: var(--space-5);
  }

  .today-overview-card__metrics {
    max-width: 100%;
  }

  .today-overview-card__metric {
    padding: 0 var(--space-2);
  }

  .today-overview-card__metric-label {
    font-size: 12px;
  }

  .today-overview-card__metric-value {
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
  }

  .today-overview-card__metric-value strong {
    font-size: 24px;
  }
}
</style>
