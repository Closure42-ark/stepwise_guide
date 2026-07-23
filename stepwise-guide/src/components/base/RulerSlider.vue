<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

interface Props {
  modelValue: number
  min: number
  max: number
  step?: number
  majorStep?: number
  label: string
  unit: string
  requiredLabel?: string
  clearLabel?: string
  emptyValue?: number
  fallbackValue?: number
  decimals?: number
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
  majorStep: 5,
  requiredLabel: '',
  clearLabel: '',
  emptyValue: 0,
  fallbackValue: undefined,
  decimals: 0,
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const SCROLL_DEBOUNCE_MS = 120
const TICK_SPACING = 14

const viewportRef = ref<HTMLDivElement | null>(null)
const sidePadding = ref(0)
const isSyncingScroll = ref(false)
const isDragging = ref(false)

let scrollTimer: number | undefined
let resizeObserver: ResizeObserver | undefined
let activePointerId: number | null = null
let dragStartX = 0
let dragStartScrollLeft = 0

const totalSteps = computed(() => Math.round((props.max - props.min) / props.step))
const ticks = computed(() => {
  return Array.from({ length: totalSteps.value + 1 }, (_, index) => {
    const value = Number((props.min + index * props.step).toFixed(props.decimals))
    const isMajor = index % Math.max(1, Math.round(props.majorStep / props.step)) === 0

    return {
      index,
      value,
      isMajor,
      label: isMajor ? formatValue(value) : '',
    }
  })
})

const displayedValue = computed(() => {
  if (props.modelValue === props.emptyValue) {
    return formatValue(props.emptyValue)
  }

  return formatValue(props.modelValue)
})

function formatValue(value: number) {
  return value.toFixed(props.decimals)
}

function clampValue(value: number) {
  return Math.max(props.min, Math.min(props.max, value))
}

function normalizeValue(value: number) {
  return Number(clampValue(value).toFixed(props.decimals))
}

function valueToIndex(value: number) {
  if (value === props.emptyValue) {
    return 0
  }

  const safeValue = normalizeValue(value)
  const index = Math.round((safeValue - props.min) / props.step)

  return Math.max(0, Math.min(totalSteps.value, index))
}

function indexToValue(index: number) {
  return Number((props.min + index * props.step).toFixed(props.decimals))
}

function syncSpacerWidth() {
  const viewport = viewportRef.value

  if (!viewport) {
    return
  }

  sidePadding.value = Math.max(0, viewport.clientWidth / 2 - TICK_SPACING / 2)
}

function indexToScrollLeft(index: number) {
  return index * TICK_SPACING
}

function scrollLeftToIndex(scrollLeft: number) {
  const viewport = viewportRef.value

  if (!viewport) {
    return Math.max(0, Math.min(totalSteps.value, Math.round(scrollLeft / TICK_SPACING)))
  }

  const centerInTrack = scrollLeft + viewport.clientWidth / 2 - sidePadding.value - TICK_SPACING / 2

  return Math.max(0, Math.min(totalSteps.value, Math.round(centerInTrack / TICK_SPACING)))
}

function scrollToValue(value: number, behavior: ScrollBehavior = 'smooth') {
  const viewport = viewportRef.value

  if (!viewport) {
    return
  }

  const nextIndex = valueToIndex(value)
  const left = indexToScrollLeft(nextIndex)

  isSyncingScroll.value = true
  viewport.scrollTo({ left, behavior })

  window.setTimeout(() => {
    isSyncingScroll.value = false
  }, behavior === 'smooth' ? 220 : 0)
}

function clearScrollTimer() {
  if (scrollTimer) {
    window.clearTimeout(scrollTimer)
    scrollTimer = undefined
  }
}

function snapToClosestTick() {
  const viewport = viewportRef.value

  if (!viewport) {
    return
  }

  const nextIndex = scrollLeftToIndex(viewport.scrollLeft)
  const nextValue = indexToValue(nextIndex)

  if (nextValue !== props.modelValue) {
    emit('update:modelValue', nextValue)
  }

  scrollToValue(nextValue, 'smooth')
}

function handleScroll() {
  if (!viewportRef.value || isSyncingScroll.value) {
    return
  }

  const nextIndex = scrollLeftToIndex(viewportRef.value.scrollLeft)
  const nextValue = indexToValue(nextIndex)

  if (nextValue !== props.modelValue) {
    emit('update:modelValue', nextValue)
  }

  clearScrollTimer()
  scrollTimer = window.setTimeout(() => {
    snapToClosestTick()
  }, SCROLL_DEBOUNCE_MS)
}

function resetValue() {
  emit('update:modelValue', props.emptyValue)
  scrollToValue(props.emptyValue, 'auto')
}

function handlePointerDown(event: PointerEvent) {
  const viewport = viewportRef.value

  if (!viewport) {
    return
  }

  event.preventDefault()
  clearScrollTimer()

  isDragging.value = true
  activePointerId = event.pointerId
  dragStartX = event.clientX
  dragStartScrollLeft = viewport.scrollLeft
  viewport.setPointerCapture(event.pointerId)
}

function handlePointerMove(event: PointerEvent) {
  const viewport = viewportRef.value

  if (!viewport || !isDragging.value || activePointerId !== event.pointerId) {
    return
  }

  event.preventDefault()
  const deltaX = event.clientX - dragStartX
  viewport.scrollLeft = dragStartScrollLeft - deltaX
}

function handlePointerUp(event: PointerEvent) {
  const viewport = viewportRef.value

  if (!viewport || activePointerId !== event.pointerId) {
    return
  }

  event.preventDefault()
  isDragging.value = false

  if (viewport.hasPointerCapture(event.pointerId)) {
    viewport.releasePointerCapture(event.pointerId)
  }

  activePointerId = null
  snapToClosestTick()
}

onMounted(async () => {
  await nextTick()
  syncSpacerWidth()
  scrollToValue(props.modelValue, 'auto')

  if (viewportRef.value) {
    resizeObserver = new ResizeObserver(() => {
      syncSpacerWidth()
      scrollToValue(props.modelValue, 'auto')
    })
    resizeObserver.observe(viewportRef.value)
  }
})

onBeforeUnmount(() => {
  clearScrollTimer()
  resizeObserver?.disconnect()
})

watch(
  () => props.modelValue,
  async (value) => {
    await nextTick()

    if (!viewportRef.value || isSyncingScroll.value) {
      return
    }

    scrollToValue(value, 'auto')
  }
)
</script>

<template>
  <section class="ruler-slider" :class="{ 'ruler-slider--dragging': isDragging }">
    <header class="ruler-slider__header">
      <div class="ruler-slider__label-group">
        <span class="ruler-slider__label">{{ label }}</span>
        <span v-if="requiredLabel" class="ruler-slider__required">{{ requiredLabel }}</span>
      </div>

      <div class="ruler-slider__value-group" aria-live="polite">
        <strong class="ruler-slider__value">{{ displayedValue }}</strong>
        <span class="ruler-slider__unit">{{ unit }}</span>
      </div>

      <button
        class="ruler-slider__reset"
        type="button"
        :aria-label="clearLabel || `Reset ${label}`"
        :title="clearLabel || `Reset ${label}`"
        @click="resetValue"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 3-6.708" />
          <path d="M3 4v5h5" />
        </svg>
      </button>
    </header>

    <div class="ruler-slider__viewport-shell">
      <div class="ruler-slider__center-line" aria-hidden="true"></div>
      <div
        class="ruler-slider__viewport"
        ref="viewportRef"
        @scroll="handleScroll"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerUp"
      >
        <div class="ruler-slider__track" :style="{ paddingInline: `${sidePadding}px` }">
          <div
            v-for="tick in ticks"
            :key="tick.index"
            class="ruler-slider__tick"
          >
            <div
              class="ruler-slider__tick-line"
              :class="{ 'ruler-slider__tick-line--major': tick.isMajor }"
            ></div>
            <span v-if="tick.label" class="ruler-slider__tick-label">{{ tick.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ruler-slider {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  user-select: none;
  -webkit-user-select: none;
}

.ruler-slider,
.ruler-slider * {
  user-select: none;
  -webkit-user-select: none;
}

.ruler-slider--dragging {
  cursor: grabbing;
}

.ruler-slider__header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--space-3);
}

.ruler-slider__label-group {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}

.ruler-slider__label {
  color: var(--color-text-primary);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
}

.ruler-slider__required {
  color: var(--color-text-tertiary);
  font-size: 12px;
}

.ruler-slider__value-group {
  display: inline-flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  min-width: 0;
}

.ruler-slider__value {
  color: #161b1c;
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(30px, 4vw, 40px);
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.ruler-slider__unit {
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
}

.ruler-slider__reset {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: var(--radius-full);
  background: rgba(45, 52, 54, 0.05);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.ruler-slider__reset:hover {
  background: rgba(74, 158, 111, 0.1);
  color: var(--color-primary);
  transform: translateY(-1px);
}

.ruler-slider__reset svg {
  width: 16px;
  height: 16px;
}

.ruler-slider__viewport-shell {
  position: relative;
}

.ruler-slider__viewport {
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  padding: var(--space-5) 0 var(--space-4);
  border-radius: calc(var(--radius-lg) + 2px);
  background: linear-gradient(180deg, rgba(248, 249, 250, 0.98), rgba(243, 245, 246, 0.94));
  scrollbar-width: none;
  -ms-overflow-style: none;
  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  cursor: grab;
  touch-action: none;
}

.ruler-slider__viewport::-webkit-scrollbar {
  display: none;
}

.ruler-slider__center-line {
  position: absolute;
  top: 18px;
  bottom: 14px;
  left: 50%;
  z-index: 2;
  width: 4px;
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, #ff8a4c, #ff6234);
  box-shadow: 0 0 0 1px rgba(255, 98, 52, 0.08), 0 10px 22px rgba(255, 98, 52, 0.16);
  transform: translateX(-50%);
  pointer-events: none;
}

.ruler-slider__track {
  display: flex;
  align-items: flex-start;
  min-width: max-content;
}

.ruler-slider__tick {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 14px;
  flex: 0 0 14px;
}

.ruler-slider__tick-line {
  width: 2px;
  height: 18px;
  border-radius: var(--radius-full);
  background: rgba(99, 110, 114, 0.32);
}

.ruler-slider__tick-line--major {
  height: 30px;
  background: rgba(99, 110, 114, 0.52);
}

.ruler-slider__tick-label {
  margin-top: var(--space-2);
  color: var(--color-text-secondary);
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  letter-spacing: 0.02em;
}

@media (max-width: 640px) {
  .ruler-slider__header {
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .ruler-slider__value-group {
    justify-content: flex-start;
  }

  .ruler-slider__reset {
    justify-self: start;
  }
}
</style>
