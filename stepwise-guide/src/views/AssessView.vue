<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SleepToolIcon from '@/components/assessment/SleepToolIcon.vue'
import { sleepEventTheme } from '@/constants/sleepEventTheme'
import { useI18n } from '@/composables/useI18n'
import { useSleepSandbox } from '@/composables/useSleepSandbox'
import type { SleepEventType, SleepSandboxEvent } from '@/types'

type DragMode =
  | 'creating-event'
  | 'moving-event-time'
  | 'adjusting-event-intensity'

interface ActiveDragState {
  mode: DragMode
  pointerId: number
  sourceElement: HTMLElement | null
  sourceType?: SleepEventType
  eventId?: string
  x: number
  y: number
  previewHour: number | null
  outsideCard: boolean
  insideAxis: boolean
  levelIndex?: number
  tooltip?: string
}

interface PositionedEvent {
  event: SleepSandboxEvent
  lane: number
  leftPx: number
}

const { currentLang } = useI18n()
const sandbox = useSleepSandbox(() => currentLang.value)

const timelineStart = 12
const timelineEnd = 36
const timelineHours = timelineEnd - timelineStart
const timelineTicks = [12, 15, 18, 21, 24, 27, 30, 33, 36]
const toolTypes: SleepEventType[] = ['coffee', 'nap', 'melatonin', 'meditation', 'screen', 'shift']

const CURVE_BASELINE_Y = 170
const CURVE_PEAK_HEIGHT = 70
const EVENT_AXIS_TOP = 212
const EVENT_LANE_GAP = 56
const EVENT_FOOTPRINT = 84
const BAR_MIN_HEIGHT = 10
const BAR_MAX_HEIGHT = 36
const PEAK_BUBBLE_PADDING = 14
const PEAK_BUBBLE_MIN_WIDTH = 116

const sandboxCardRef = ref<HTMLElement | null>(null)
const axisRef = ref<HTMLElement | null>(null)
const peakBubbleRef = ref<HTMLElement | null>(null)
const selectedEventId = ref('')
const activeDrag = ref<ActiveDragState | null>(null)
const peakBubbleWidth = ref(PEAK_BUBBLE_MIN_WIDTH)

const eventsList = computed(() => sandbox.events.value)
const result = computed(() => sandbox.result.value)
const predictedSleepHour = computed(() => sandbox.predictedSleepHour.value)
const uncertaintyHours = computed(() => sandbox.uncertaintyHours.value)
const previewHour = computed(() => activeDrag.value?.previewHour ?? null)
const dragGhostType = computed<SleepEventType>(() => {
  if (!activeDrag.value) return 'coffee'
  if (activeDrag.value.mode === 'creating-event') return activeDrag.value.sourceType ?? 'coffee'
  return eventsList.value.find(item => item.id === activeDrag.value?.eventId)?.type ?? 'coffee'
})
const activeTheme = computed(() => eventTheme(dragGhostType.value))

const copy = computed(() => {
  if (currentLang.value === 'en') {
    return {
      title: 'Sleep Sandbox',
      subtitle: 'Drop events on the axis, then tune the bar above each chip to shift the predicted sleep peak.',
      helper: 'Drag a tool onto the event axis. Drag the chip to move time. Drag the bar to adjust intensity.',
      clear: 'Clear',
      deleteHint: 'Release to delete',
      deleteIdle: 'Drag an event outside the card to delete it',
      dragHint: 'Drag to place',
      estimatePrefix: 'Likely',
      nearBaseline: 'Near baseline',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    }
  }

  return {
    title: '睡眠沙盒',
    subtitle: '先把事件放到时间轴上，再拖动事件上方的强度条，直接看入睡峰值怎么移动。',
    helper: '把工具拖到事件轴上创建事件。拖事件本体改时间，拖上方强度条改剂量或时长。',
    clear: '清空',
    deleteHint: '松手删除',
    deleteIdle: '把事件拖出整张卡片即可删除',
    dragHint: '拖动放置',
    estimatePrefix: '预计',
    nearBaseline: '接近基线',
    low: '低',
    medium: '中',
    high: '高',
  }
})

const delayText = computed(() => {
  const delta = result.value.sleepDelayMinutes

  if (delta === 0) {
    return copy.value.nearBaseline
  }

  const absolute = Math.abs(delta)
  const hours = Math.floor(absolute / 60)
  const minutes = absolute % 60
  const duration = hours > 0
    ? `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`
    : `${minutes} min`

  if (currentLang.value === 'en') {
    return delta > 0 ? `${duration} later` : `${duration} earlier`
  }

  return delta > 0 ? `晚 ${duration}` : `早 ${duration}`
})

const peakPointerPercent = computed(() => hourToPercent(predictedSleepHour.value))
const peakBubbleStyle = computed(() => {
  const axisWidth = axisRef.value?.clientWidth ?? 712
  const bubbleWidth = peakBubbleWidth.value
  const rawCenter = (peakPointerPercent.value / 100) * axisWidth
  const minCenter = bubbleWidth / 2 + PEAK_BUBBLE_PADDING
  const maxCenter = axisWidth - bubbleWidth / 2 - PEAK_BUBBLE_PADDING
  const clampedCenter = clamp(rawCenter, minCenter, maxCenter)
  const pointerOffset = rawCenter - clampedCenter

  return {
    left: `${(clampedCenter / Math.max(axisWidth, 1)) * 100}%`,
    top: `${Math.max(12, CURVE_BASELINE_Y - CURVE_PEAK_HEIGHT - 56)}px`,
    '--pointer-offset': `${pointerOffset}px`,
  }
})

const positionedEvents = computed<PositionedEvent[]>(() => {
  const width = axisRef.value?.clientWidth ?? 720
  const sorted = [...eventsList.value]
    .map(event => ({
      event,
      leftPx: ((sandbox.snapHour(event.startHour) - timelineStart) / timelineHours) * width,
    }))
    .sort((a, b) => a.leftPx - b.leftPx)

  const laneEnds: number[] = []
  const positioned: PositionedEvent[] = []

  for (const item of sorted) {
    let lane = 0

    while (laneEnds[lane] !== undefined && item.leftPx - laneEnds[lane] < EVENT_FOOTPRINT) {
      lane += 1
    }

    laneEnds[lane] = item.leftPx
    positioned.push({
      event: item.event,
      lane,
      leftPx: item.leftPx,
    })
  }

  return positioned
})

watch([predictedSleepHour, delayText, currentLang], () => {
  void nextTick(measurePeakBubble)
})

onMounted(() => {
  void nextTick(measurePeakBubble)
  window.addEventListener('resize', handleResize)
})

function handleResize() {
  measurePeakBubble()
}

function measurePeakBubble() {
  peakBubbleWidth.value = Math.max(PEAK_BUBBLE_MIN_WIDTH, peakBubbleRef.value?.offsetWidth ?? PEAK_BUBBLE_MIN_WIDTH)
}

function hourToPercent(hour: number) {
  return ((hour - timelineStart) / timelineHours) * 100
}

function formatTick(hour: number) {
  return sandbox.formatHour(hour, currentLang.value)
}

function toolLabel(type: SleepEventType) {
  const labels: Record<SleepEventType, [string, string]> = {
    coffee: ['咖啡', 'Coffee'],
    nap: ['小睡', 'Nap'],
    melatonin: ['褪黑素', 'Melatonin'],
    meditation: ['冥想', 'Meditation'],
    screen: ['屏幕', 'Screen'],
    shift: ['夜班', 'Shift'],
  }

  return currentLang.value === 'en' ? labels[type][1] : labels[type][0]
}

function eventTheme(type: SleepEventType) {
  return sleepEventTheme[type]
}

function toolItemStyle(type: SleepEventType) {
  const theme = eventTheme(type)
  return {
    '--event-accent': theme.color,
    '--event-tint': theme.tint,
    '--event-border': theme.border,
  }
}

function probabilityPath() {
  const peak = predictedSleepHour.value
  const sigma = uncertaintyHours.value
  const steps = 120
  const areaPoints: string[] = []
  const linePoints: string[] = []

  for (let i = 0; i <= steps; i++) {
    const hour = timelineStart + (timelineHours * i) / steps
    const normalized = Math.exp(-Math.pow(hour - peak, 2) / (2 * sigma * sigma))
    const x = 24 + ((hour - timelineStart) / timelineHours) * 712
    const y = CURVE_BASELINE_Y - normalized * CURVE_PEAK_HEIGHT
    linePoints.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`)
    areaPoints.push(`${x} ${y}`)
  }

  return {
    line: linePoints.join(' '),
    area: `M 24 ${CURVE_BASELINE_Y} L ${areaPoints.join(' L ')} L 736 ${CURVE_BASELINE_Y} Z`,
  }
}

const probabilityShape = computed(() => probabilityPath())

function supportsIntensity(event: SleepSandboxEvent) {
  return event.type !== 'shift'
}

function intensityLevels(event: SleepSandboxEvent) {
  if (event.type === 'coffee') {
    return [
      { label: copy.value.low, value: 'low' as const },
      { label: copy.value.medium, value: 'medium' as const },
      { label: copy.value.high, value: 'high' as const },
    ]
  }

  if (event.type === 'melatonin') {
    return [
      { label: copy.value.low, value: 'low' as const },
      { label: copy.value.medium, value: 'medium' as const },
    ]
  }

  if (event.type === 'nap') {
    return [
      { label: '20 min', value: 20 },
      { label: '60 min', value: 60 },
      { label: '90 min', value: 90 },
    ]
  }

  if (event.type === 'screen') {
    return [
      { label: '30 min', value: 30 },
      { label: '60 min', value: 60 },
      { label: '120 min', value: 120 },
    ]
  }

  return [
    { label: '5 min', value: 5 },
    { label: '10 min', value: 10 },
    { label: '20 min', value: 20 },
  ]
}

function currentLevelIndex(event: SleepSandboxEvent) {
  const levels = intensityLevels(event)

  if (event.type === 'coffee' || event.type === 'melatonin') {
    const value = event.dose ?? (levels[0]?.value as 'low' | 'medium' | 'high')
    return Math.max(0, levels.findIndex(level => level.value === value))
  }

  const value = event.durationMinutes ?? (levels[0]?.value as number)
  return Math.max(0, levels.findIndex(level => level.value === value))
}

function barHeight(event: SleepSandboxEvent) {
  const levels = intensityLevels(event)
  const index = currentLevelIndex(event)

  if (levels.length <= 1) {
    return BAR_MIN_HEIGHT
  }

  return BAR_MIN_HEIGHT + (index / (levels.length - 1)) * (BAR_MAX_HEIGHT - BAR_MIN_HEIGHT)
}

function levelLabel(event: SleepSandboxEvent) {
  return intensityLevels(event)[currentLevelIndex(event)]?.label ?? ''
}

function applyLevelIndex(event: SleepSandboxEvent, index: number) {
  const levels = intensityLevels(event)
  const nextIndex = clamp(Math.round(index), 0, levels.length - 1)
  const next = levels[nextIndex]

  if (!next) {
    return
  }

  if (event.type === 'coffee' || event.type === 'melatonin') {
    sandbox.updateEvent(event.id, { dose: next.value as 'low' | 'medium' | 'high' })
    return
  }

  sandbox.updateEvent(event.id, { durationMinutes: next.value as number })
}

function timeStyle(hour: number, lane: number, type: SleepEventType) {
  const theme = eventTheme(type)

  return {
    left: `${hourToPercent(hour)}%`,
    top: `${EVENT_AXIS_TOP - lane * EVENT_LANE_GAP}px`,
    '--event-accent': theme.color,
    '--event-tint': theme.tint,
    '--event-border': theme.border,
  }
}

function createEventAtHour(type: SleepEventType, hour: number) {
  sandbox.addEvent(type)
  const newest = sandbox.events.value[sandbox.events.value.length - 1]

  if (newest) {
    sandbox.updateEvent(newest.id, { startHour: hour })
    selectedEventId.value = newest.id
  }
}

function resolveHourFromX(clientX: number) {
  const element = axisRef.value

  if (!element) {
    return timelineStart
  }

  const rect = element.getBoundingClientRect()
  const ratio = clamp((clientX - rect.left) / Math.max(rect.width, 1), 0, 1)
  return sandbox.snapHour(timelineStart + timelineHours * ratio)
}

function isInsideRect(x: number, y: number, rect: DOMRect | undefined) {
  if (!rect) return false
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

function startDrag(event: PointerEvent, payload: Omit<ActiveDragState, 'pointerId' | 'sourceElement' | 'x' | 'y' | 'previewHour' | 'outsideCard' | 'insideAxis'>) {
  const sourceElement = event.currentTarget as HTMLElement | null
  sourceElement?.setPointerCapture?.(event.pointerId)

  activeDrag.value = {
    ...payload,
    pointerId: event.pointerId,
    sourceElement,
    x: event.clientX,
    y: event.clientY,
    previewHour: null,
    outsideCard: false,
    insideAxis: false,
  }

  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
  window.addEventListener('pointercancel', handlePointerCancel)
}

function beginToolDrag(type: SleepEventType, event: PointerEvent) {
  event.preventDefault()
  startDrag(event, { mode: 'creating-event', sourceType: type })
}

function beginEventDrag(eventId: string, event: PointerEvent) {
  event.preventDefault()
  selectedEventId.value = eventId
  startDrag(event, { mode: 'moving-event-time', eventId })
}

function beginIntensityDrag(eventItem: SleepSandboxEvent, event: PointerEvent) {
  event.preventDefault()
  event.stopPropagation()
  selectedEventId.value = eventItem.id
  startDrag(event, {
    mode: 'adjusting-event-intensity',
    eventId: eventItem.id,
    levelIndex: currentLevelIndex(eventItem),
    tooltip: levelLabel(eventItem),
  })
}

function updateDragPosition(clientX: number, clientY: number) {
  if (!activeDrag.value) {
    return
  }

  const axisRect = axisRef.value?.getBoundingClientRect()
  const cardRect = sandboxCardRef.value?.getBoundingClientRect()
  const outsideCard = !isInsideRect(clientX, clientY, cardRect)
  const insideAxis = isInsideRect(clientX, clientY, axisRect)

  if (activeDrag.value.mode === 'adjusting-event-intensity') {
    const eventItem = eventsList.value.find(item => item.id === activeDrag.value?.eventId)

    if (!eventItem) {
      clearDrag()
      return
    }

    const levels = intensityLevels(eventItem)
    const currentRect = activeDrag.value.sourceElement?.getBoundingClientRect()
    const bottom = currentRect ? currentRect.bottom : clientY + BAR_MAX_HEIGHT
    const relative = clamp(bottom - clientY, 0, BAR_MAX_HEIGHT)
    const ratio = relative / BAR_MAX_HEIGHT
    const nextIndex = clamp(Math.round(ratio * Math.max(levels.length - 1, 1)), 0, levels.length - 1)

    applyLevelIndex(eventItem, nextIndex)
    activeDrag.value = {
      ...activeDrag.value,
      x: clientX,
      y: clientY,
      outsideCard,
      insideAxis,
      levelIndex: nextIndex,
      tooltip: levels[nextIndex]?.label ?? '',
    }
    return
  }

  activeDrag.value = {
    ...activeDrag.value,
    x: clientX,
    y: clientY,
    outsideCard,
    insideAxis,
    previewHour: insideAxis ? resolveHourFromX(clientX) : null,
  }
}

function clearDrag() {
  const pointerId = activeDrag.value?.pointerId
  const sourceElement = activeDrag.value?.sourceElement

  if (pointerId !== undefined && sourceElement?.hasPointerCapture?.(pointerId)) {
    sourceElement.releasePointerCapture(pointerId)
  }

  activeDrag.value = null
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
  window.removeEventListener('pointercancel', handlePointerCancel)
}

function finishDrag() {
  if (!activeDrag.value) {
    return
  }

  const drag = activeDrag.value

  if (drag.mode === 'creating-event' && drag.sourceType && drag.previewHour !== null) {
    createEventAtHour(drag.sourceType, drag.previewHour)
  }

  if (drag.mode === 'moving-event-time' && drag.eventId) {
    if (drag.previewHour !== null) {
      sandbox.updateEvent(drag.eventId, { startHour: drag.previewHour })
    } else if (drag.outsideCard) {
      sandbox.removeEvent(drag.eventId)
    }
  }

  clearDrag()
}

function handlePointerMove(event: PointerEvent) {
  if (!activeDrag.value || event.pointerId !== activeDrag.value.pointerId) {
    return
  }

  updateDragPosition(event.clientX, event.clientY)
}

function handlePointerUp(event: PointerEvent) {
  if (!activeDrag.value || event.pointerId !== activeDrag.value.pointerId) {
    return
  }

  updateDragPosition(event.clientX, event.clientY)
  finishDrag()
}

function handlePointerCancel() {
  clearDrag()
}

function movingThisEvent(eventId: string) {
  return activeDrag.value?.mode === 'moving-event-time' && activeDrag.value.eventId === eventId
}

function adjustingThisEvent(eventId: string) {
  return activeDrag.value?.mode === 'adjusting-event-intensity' && activeDrag.value.eventId === eventId
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

onBeforeUnmount(() => {
  clearDrag()
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="page-content simplified-sandbox">
    <section class="simplified-sandbox__hero">
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.subtitle }}</p>
    </section>

    <section class="tool-bar" aria-label="Sleep event tools">
      <button
        v-for="type in toolTypes"
        :key="type"
        class="tool-bar__item"
        :style="toolItemStyle(type)"
        type="button"
        :title="copy.dragHint"
        @pointerdown="beginToolDrag(type, $event)"
      >
        <span class="tool-bar__icon" aria-hidden="true">
          <SleepToolIcon :type="type" />
        </span>
        <span>{{ toolLabel(type) }}</span>
      </button>
    </section>

    <section ref="sandboxCardRef" class="timeline-shell">
      <div class="timeline-shell__header">
        <p>{{ copy.helper }}</p>
        <button type="button" class="timeline-shell__clear" @click="sandbox.clearEvents">
          {{ copy.clear }}
        </button>
      </div>

      <div class="single-timeline" :class="{ 'single-timeline--delete': activeDrag?.mode === 'moving-event-time' && activeDrag.outsideCard }">
        <svg class="single-timeline__curve" viewBox="0 0 760 250" role="img" aria-label="Predicted sleep window">
          <path :d="probabilityShape.area" class="single-timeline__area" />
          <path :d="probabilityShape.line" class="single-timeline__line" />
          <line x1="24" x2="736" :y1="CURVE_BASELINE_Y" :y2="CURVE_BASELINE_Y" class="single-timeline__baseline" />
        </svg>

        <div ref="peakBubbleRef" class="single-timeline__peak-bubble" :style="peakBubbleStyle">
          <strong>{{ copy.estimatePrefix }} {{ sandbox.formatHour(predictedSleepHour, currentLang) }}</strong>
          <span>{{ delayText }}</span>
          <i class="single-timeline__peak-pointer"></i>
        </div>

        <div ref="axisRef" class="single-timeline__axis">
          <div class="single-timeline__axis-line"></div>

          <div
            v-if="previewHour !== null"
            class="single-timeline__preview"
            :style="{ left: `${hourToPercent(previewHour)}%`, '--event-accent': activeTheme.color }"
          >
            <span class="single-timeline__preview-label">{{ sandbox.formatHour(previewHour, currentLang) }}</span>
          </div>

          <div
            v-for="tick in timelineTicks"
            :key="tick"
            class="single-timeline__tick"
            :style="{ left: `${hourToPercent(tick)}%` }"
          >
            <span class="single-timeline__tick-mark"></span>
            <span class="single-timeline__tick-label">{{ formatTick(tick) }}</span>
          </div>

          <div
            v-for="item in positionedEvents"
            :key="item.event.id"
            class="single-timeline__event-group"
            :style="timeStyle(item.event.startHour, item.lane, item.event.type)"
          >
            <div
              v-if="supportsIntensity(item.event) && !movingThisEvent(item.event.id)"
              class="single-timeline__bar-wrap"
            >
              <button
                type="button"
                class="single-timeline__bar"
                :class="{ 'single-timeline__bar--active': adjustingThisEvent(item.event.id) }"
                :style="{ height: `${barHeight(item.event)}px` }"
                @pointerdown="beginIntensityDrag(item.event, $event)"
              ></button>
              <span
                v-if="adjustingThisEvent(item.event.id)"
                class="single-timeline__bar-tooltip"
              >
                {{ activeDrag?.tooltip }}
              </span>
            </div>

            <button
              type="button"
              class="single-timeline__event"
              :class="{ 'single-timeline__event--active': selectedEventId === item.event.id }"
              @click="selectedEventId = item.event.id"
              @pointerdown="beginEventDrag(item.event.id, $event)"
            >
              <span class="single-timeline__event-icon" aria-hidden="true">
                <SleepToolIcon :type="item.event.type" />
              </span>
              <span class="single-timeline__event-label">
                {{ toolLabel(item.event.type) }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        class="timeline-shell__delete-hint"
        :class="{ 'timeline-shell__delete-hint--armed': activeDrag?.mode === 'moving-event-time' && activeDrag.outsideCard }"
      >
        {{ activeDrag?.mode === 'moving-event-time' && activeDrag.outsideCard ? copy.deleteHint : copy.deleteIdle }}
      </div>
    </section>

    <div
      v-if="activeDrag?.mode !== 'adjusting-event-intensity'"
      class="drag-ghost"
      :class="{ 'drag-ghost--delete': activeDrag?.mode === 'moving-event-time' && activeDrag.outsideCard }"
      :style="{
        left: `${activeDrag?.x ?? 0}px`,
        top: `${activeDrag?.y ?? 0}px`,
        opacity: activeDrag ? 1 : 0,
        '--event-accent': activeTheme.color,
        '--event-tint': activeTheme.tint,
        '--event-border': activeTheme.border,
      }"
    >
      <span class="drag-ghost__icon" aria-hidden="true">
        <SleepToolIcon :type="dragGhostType" />
      </span>
      <span>{{ toolLabel(dragGhostType) }}</span>
    </div>
  </div>
</template>

<style scoped>
.simplified-sandbox,
.simplified-sandbox * {
  user-select: none;
  -webkit-user-select: none;
}

.simplified-sandbox {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-top: var(--space-5);
  padding-bottom: var(--space-6);
}

.simplified-sandbox__hero {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5);
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(232, 148, 90, 0.16), transparent 30%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(246, 249, 252, 0.98));
  border: 1px solid rgba(91, 141, 239, 0.12);
  box-shadow: var(--shadow-card);
}

.simplified-sandbox__hero h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 30px;
}

.simplified-sandbox__hero p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.tool-bar {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--space-2);
}

.tool-bar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 1px solid var(--event-border);
  border-radius: 16px;
  background: var(--event-tint);
  color: var(--event-accent);
  cursor: grab;
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
  touch-action: none;
}

.tool-bar__item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-card-hover);
  background: color-mix(in srgb, var(--event-tint) 72%, white);
  border-color: color-mix(in srgb, var(--event-border) 82%, var(--event-accent));
}

.tool-bar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.75);
  color: var(--event-accent);
}

.timeline-shell {
  position: relative;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.timeline-shell__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.timeline-shell__header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.timeline-shell__clear {
  min-height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.timeline-shell__delete-hint {
  margin-top: var(--space-3);
  color: var(--color-text-secondary);
  font-size: 12px;
  transition: color var(--transition-fast);
}

.timeline-shell__delete-hint--armed {
  color: #b94e48;
}

.single-timeline {
  position: relative;
  isolation: isolate;
  min-height: 360px;
  padding: 8px 18px 24px;
  overflow: hidden;
  border-radius: 20px;
  background: #fbfcfd;
  border: 1px solid rgba(91, 141, 239, 0.1);
}

.single-timeline--delete {
  border-color: rgba(185, 78, 72, 0.35);
}

.single-timeline::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    linear-gradient(
      90deg,
      rgba(255, 248, 220, 0.78) 0%,
      rgba(255, 237, 213, 0.72) 24%,
      rgba(255, 225, 208, 0.68) 38%,
      rgba(219, 234, 254, 0.62) 52%,
      rgba(224, 231, 255, 0.68) 74%,
      rgba(239, 246, 255, 0.76) 100%
    );
  pointer-events: none;
}

.single-timeline__curve {
  width: 100%;
  height: auto;
  display: block;
  position: relative;
  z-index: 1;
  background: transparent;
  pointer-events: none;
}

.single-timeline__area {
  fill: rgba(74, 158, 111, 0.12);
}

.single-timeline__line {
  fill: none;
  stroke: rgba(74, 158, 111, 0.9);
  stroke-width: 3;
}

.single-timeline__baseline {
  stroke: rgba(99, 110, 114, 0.16);
  stroke-width: 1.5;
}

.single-timeline__peak-bubble {
  position: absolute;
  z-index: 5;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 116px;
  max-width: calc(100% - 28px);
  padding: 8px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 16px 34px rgba(45, 52, 54, 0.14);
  transform: translateX(-50%);
}

.single-timeline__peak-bubble strong {
  color: var(--color-text-primary);
  font-size: 13px;
}

.single-timeline__peak-bubble span {
  color: var(--color-text-secondary);
  font-size: 11px;
}

.single-timeline__peak-pointer {
  position: absolute;
  left: calc(50% + var(--pointer-offset, 0px));
  bottom: -10px;
  width: 2px;
  height: 10px;
  background: rgba(255, 255, 255, 0.98);
  transform: translateX(-50%);
  box-shadow: 0 6px 14px rgba(45, 52, 54, 0.08);
}

.single-timeline__axis {
  position: absolute;
  left: 24px;
  right: 24px;
  top: 118px;
  bottom: 18px;
  z-index: 2;
  background: transparent;
  touch-action: none;
}

.single-timeline__axis-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 148px;
  height: 8px;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, rgba(91, 141, 239, 0.18), rgba(74, 158, 111, 0.18));
}

.single-timeline__preview {
  position: absolute;
  top: 128px;
  width: 3px;
  height: 38px;
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, color-mix(in srgb, var(--event-accent) 18%, white), var(--event-accent));
  transform: translateX(-50%);
}

.single-timeline__preview-label {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translate(-50%, -100%);
  padding: 4px 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.96);
  color: var(--color-text-primary);
  font-size: 11px;
  white-space: nowrap;
  box-shadow: var(--shadow-card);
}

.single-timeline__tick {
  position: absolute;
  top: 150px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.single-timeline__tick-mark {
  width: 2px;
  height: 14px;
  background: rgba(99, 110, 114, 0.28);
}

.single-timeline__tick-label {
  color: var(--color-text-secondary);
  font-size: 11px;
  white-space: nowrap;
}

.single-timeline__event-group {
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transform: translate(-50%, -100%);
}

.single-timeline__bar-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.single-timeline__bar {
  width: 18px;
  min-height: 10px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--event-accent) 80%, white), color-mix(in srgb, var(--event-accent) 50%, white));
  opacity: 0.7;
  cursor: ns-resize;
  touch-action: none;
}

.single-timeline__bar--active {
  opacity: 0.95;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--event-accent) 16%, transparent);
}

.single-timeline__bar-tooltip {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translate(-50%, -100%);
  padding: 4px 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.98);
  color: var(--color-text-primary);
  font-size: 11px;
  white-space: nowrap;
  box-shadow: var(--shadow-card);
}

.single-timeline__event {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 68px;
  padding: 8px 10px;
  border: 1px solid var(--event-border);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.98);
  color: var(--color-text-primary);
  box-shadow: 0 10px 24px rgba(45, 52, 54, 0.08);
  cursor: grab;
  white-space: nowrap;
  touch-action: none;
}

.single-timeline__event--active {
  box-shadow: 0 12px 28px color-mix(in srgb, var(--event-accent) 22%, transparent);
}

.single-timeline__event-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
  color: var(--event-accent);
}

.single-timeline__event-label {
  font-size: 12px;
}

.drag-ghost {
  position: fixed;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 14px;
  background: var(--event-tint);
  color: var(--event-accent);
  border: 1px solid var(--event-border);
  box-shadow: 0 18px 44px rgba(45, 52, 54, 0.18);
  pointer-events: none;
  transform: translate(-50%, -50%);
}

.drag-ghost--delete {
  background: rgba(255, 241, 239, 0.98);
  border-color: rgba(185, 78, 72, 0.22);
  color: #b94e48;
}

.drag-ghost__icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
  color: var(--event-accent);
}

@media (max-width: 900px) {
  .tool-bar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .simplified-sandbox {
    gap: var(--space-3);
    padding: var(--space-4);
  }

  .simplified-sandbox__hero,
  .timeline-shell {
    padding: var(--space-4);
  }

  .timeline-shell__header {
    flex-direction: column;
  }

  .single-timeline {
    min-height: 390px;
    padding-left: 12px;
    padding-right: 12px;
  }

  .single-timeline__axis {
    left: 12px;
    right: 12px;
  }

  .single-timeline__event {
    min-width: 58px;
    padding: 7px 9px;
  }
}
</style>
