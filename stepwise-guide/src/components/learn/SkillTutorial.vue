<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useI18n } from '@/composables/useI18n'
import { type HoldStatus, useTimerStore } from '@/stores/timer'
import type { SkillItem } from '@/types'
import { parseHoldMatches } from '@/utils/skillHoldParser'

interface Props {
  skill: SkillItem
}

interface StepQueueItem {
  id: string
  seconds: number
  text: string
  pointIndex: number
  matchIndex: number
}

interface HighlightSegment {
  key: string
  text: string
  isHold: boolean
  status: HoldStatus | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: []
  close: []
}>()

const { currentLang } = useI18n()
const timerStore = useTimerStore()

const currentStep = ref(0)

const totalSteps = computed(() => props.skill.steps.length)
const step = computed(() => props.skill.steps[currentStep.value])
const isFirstStep = computed(() => currentStep.value === 0)
const isLastStep = computed(() => currentStep.value === totalSteps.value - 1)

const stepHoldQueue = computed<StepQueueItem[]>(() => {
  return step.value.points.flatMap((point, pointIndex) =>
    parseHoldMatches(point).map((match, matchIndex) => ({
      id: `${currentStep.value}-${pointIndex}-${match.key}`,
      seconds: match.seconds,
      text: match.text,
      pointIndex,
      matchIndex,
    })),
  )
})

const holdStatusMap = computed(() => {
  return new Map(timerStore.queue.map(item => [item.id, item.status]))
})

const illustrationTheme = computed(() => {
  if (props.skill.id === 'bodyweight-squat' || props.skill.id === 'wall-sit') {
    return {
      tone: 'strength',
      label: currentLang.value === 'en' ? 'Strength form' : '力量动作',
    }
  }

  if (props.skill.id === 'running-posture') {
    return {
      tone: 'cardio',
      label: currentLang.value === 'en' ? 'Running form' : '跑姿示意',
    }
  }

  if (props.skill.id === 'cat-cow') {
    return {
      tone: 'posture',
      label: currentLang.value === 'en' ? 'Mobility flow' : '脊柱活动',
    }
  }

  return {
    tone: 'stretch',
    label: currentLang.value === 'en' ? 'Stretch form' : '拉伸示意',
  }
})

const stepSegments = computed<HighlightSegment[][]>(() => {
  return step.value.points.map((point, pointIndex) => {
    const matches = parseHoldMatches(point)

    if (!matches.length) {
      return [
        {
          key: `${currentStep.value}-${pointIndex}-plain`,
          text: point,
          isHold: false,
          status: null,
        },
      ]
    }

    const segments: HighlightSegment[] = []
    let cursor = 0

    matches.forEach(match => {
      if (match.start > cursor) {
        segments.push({
          key: `${currentStep.value}-${pointIndex}-${match.key}-before-${cursor}`,
          text: point.slice(cursor, match.start),
          isHold: false,
          status: null,
        })
      }

      const id = `${currentStep.value}-${pointIndex}-${match.key}`
      segments.push({
        key: id,
        text: point.slice(match.start, match.end),
        isHold: true,
        status: holdStatusMap.value.get(id) ?? 'pending',
      })

      cursor = match.end
    })

    if (cursor < point.length) {
      segments.push({
        key: `${currentStep.value}-${pointIndex}-after-${cursor}`,
        text: point.slice(cursor),
        isHold: false,
        status: null,
      })
    }

    return segments
  })
})

function clearSkillStepTimer() {
  if (timerStore.source === 'skill-step') {
    timerStore.clearSkillTimer(true)
  }
}

function configureCurrentStepTimer() {
  if (!stepHoldQueue.value.length) {
    clearSkillStepTimer()
    return
  }

  timerStore.configureSkillTimer(stepHoldQueue.value, true)
}

function goToStep(nextIndex: number) {
  if (nextIndex < 0 || nextIndex >= totalSteps.value) {
    return
  }

  clearSkillStepTimer()
  currentStep.value = nextIndex
}

function handlePrevious() {
  goToStep(currentStep.value - 1)
}

function handleNext() {
  if (isLastStep.value) {
    clearSkillStepTimer()
    emit('complete')
    return
  }

  goToStep(currentStep.value + 1)
}

watch(
  () => currentStep.value,
  () => {
    configureCurrentStepTimer()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearSkillStepTimer()
})
</script>

<template>
  <div class="skill-tutorial">
    <header class="skill-tutorial__header">
      <div>
        <p class="skill-tutorial__eyebrow">{{ skill.category }}</p>
        <h2 class="skill-tutorial__title">{{ step.title }}</h2>
      </div>
    </header>

    <section class="skill-tutorial__hero">
      <div class="skill-tutorial__hero-copy">
        <p class="skill-tutorial__progress">
          {{ currentLang === 'en' ? 'Step' : '步骤' }} {{ currentStep + 1 }} / {{ totalSteps }}
        </p>
        <p class="skill-tutorial__description">{{ skill.description }}</p>
      </div>
      <div
        class="skill-tutorial__illustration"
        :class="`skill-tutorial__illustration--${illustrationTheme.tone}`"
        :aria-label="illustrationTheme.label"
      >
        <svg viewBox="0 0 120 120" class="skill-tutorial__illustration-svg" aria-hidden="true">
          <template v-if="illustrationTheme.tone === 'strength'">
            <circle cx="60" cy="25" r="12" />
            <path d="M42 48c10 6 26 6 36 0" />
            <path d="M50 50 38 78" />
            <path d="M70 50 82 78" />
            <path d="M50 82 44 102" />
            <path d="M70 82 76 102" />
            <path d="M36 74h48" />
          </template>
          <template v-else-if="illustrationTheme.tone === 'cardio'">
            <circle cx="67" cy="24" r="12" />
            <path d="M48 48c10-8 24-8 33 0" />
            <path d="M58 48 46 70" />
            <path d="M73 50 92 66" />
            <path d="M47 72 34 98" />
            <path d="M69 72 83 100" />
            <path d="M22 96h20" />
          </template>
          <template v-else-if="illustrationTheme.tone === 'posture'">
            <circle cx="60" cy="24" r="11" />
            <path d="M40 54c12-10 28-10 40 0" />
            <path d="M42 56c0 18 12 28 18 28s18-10 18-28" />
            <path d="M44 86c8 8 24 8 32 0" />
            <path d="M34 94h52" />
          </template>
          <template v-else>
            <circle cx="60" cy="24" r="12" />
            <path d="M60 38v28" />
            <path d="M60 46c-10 2-20 10-23 22" />
            <path d="M60 46c10 2 20 10 23 22" />
            <path d="M60 66 46 98" />
            <path d="M60 66 74 98" />
          </template>
        </svg>
        <span class="skill-tutorial__illustration-label">{{ illustrationTheme.label }}</span>
      </div>
    </section>

    <section class="skill-tutorial__content">
      <ol class="skill-tutorial__points">
        <li
          v-for="(segments, pointIndex) in stepSegments"
          :key="`${currentStep}-${pointIndex}`"
          class="skill-tutorial__point"
        >
          <span
            v-for="segment in segments"
            :key="segment.key"
            class="skill-tutorial__segment"
            :class="{
              'skill-tutorial__segment--hold': segment.isHold,
              'skill-tutorial__segment--active': segment.status === 'active',
              'skill-tutorial__segment--done': segment.status === 'done',
              'skill-tutorial__segment--pending': segment.isHold && segment.status === 'pending',
            }"
          >
            {{ segment.text }}
          </span>
        </li>
      </ol>

      <div class="skill-tutorial__note">
        <span class="skill-tutorial__note-label">{{ currentLang === 'en' ? 'Coach note' : '动作提示' }}</span>
        <p>{{ step.note }}</p>
      </div>
    </section>

    <footer class="skill-tutorial__footer">
      <BaseButton type="secondary" :disabled="isFirstStep" @click="handlePrevious">
        {{ currentLang === 'en' ? 'Previous' : '上一步' }}
      </BaseButton>
      <BaseButton @click="handleNext">
        {{ isLastStep ? (currentLang === 'en' ? 'Finish' : '完成') : (currentLang === 'en' ? 'Next' : '下一步') }}
      </BaseButton>
    </footer>
  </div>
</template>

<style scoped>
.skill-tutorial {
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: var(--color-text-primary);
}

.skill-tutorial__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.skill-tutorial__eyebrow {
  margin: 0 0 6px;
  color: var(--color-text-tertiary);
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.skill-tutorial__title {
  margin: 0;
  font-size: 24px;
  line-height: 1.15;
}

.skill-tutorial__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 132px;
  gap: 18px;
  padding: 18px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(86, 136, 232, 0.14), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(244, 248, 252, 0.98));
  border: 1px solid rgba(86, 136, 232, 0.14);
}

.skill-tutorial__progress {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
}

.skill-tutorial__description {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.skill-tutorial__illustration {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 140px;
  border-radius: 22px;
  border: 1px solid rgba(86, 136, 232, 0.14);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(241, 247, 255, 0.98));
  color: rgb(57, 85, 144);
}

.skill-tutorial__illustration--stretch {
  background:
    radial-gradient(circle at top, rgba(86, 136, 232, 0.18), transparent 50%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(241, 247, 255, 0.98));
}

.skill-tutorial__illustration--strength {
  background:
    radial-gradient(circle at top, rgba(226, 141, 82, 0.18), transparent 50%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(255, 246, 239, 0.98));
  color: rgb(144, 84, 43);
}

.skill-tutorial__illustration--cardio {
  background:
    radial-gradient(circle at top, rgba(78, 150, 210, 0.18), transparent 50%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(239, 248, 255, 0.98));
  color: rgb(43, 96, 143);
}

.skill-tutorial__illustration--posture {
  background:
    radial-gradient(circle at top, rgba(133, 110, 214, 0.16), transparent 50%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(246, 241, 255, 0.98));
  color: rgb(98, 73, 170);
}

.skill-tutorial__illustration-svg {
  width: 84px;
  height: 84px;
  fill: none;
  stroke: currentColor;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.skill-tutorial__illustration-label {
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.skill-tutorial__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skill-tutorial__points {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding-left: 20px;
}

.skill-tutorial__point {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.skill-tutorial__segment--hold {
  padding: 0 2px;
  border-radius: 6px;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.skill-tutorial__segment--pending {
  background: linear-gradient(180deg, transparent 45%, rgba(86, 136, 232, 0.12) 45%, rgba(86, 136, 232, 0.12) 100%);
  color: var(--color-text-primary);
}

.skill-tutorial__segment--active {
  background: linear-gradient(180deg, transparent 40%, rgba(74, 158, 111, 0.24) 40%, rgba(74, 158, 111, 0.24) 100%);
  color: rgb(33, 90, 59);
  box-shadow: inset 0 0 0 1px rgba(74, 158, 111, 0.18);
}

.skill-tutorial__segment--done {
  background: linear-gradient(180deg, transparent 45%, rgba(114, 128, 148, 0.14) 45%, rgba(114, 128, 148, 0.14) 100%);
  color: var(--color-text-secondary);
}

.skill-tutorial__note {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(246, 248, 250, 0.96);
  border: 1px solid rgba(30, 41, 59, 0.08);
}

.skill-tutorial__note-label {
  display: inline-block;
  margin-bottom: 8px;
  color: var(--color-text-tertiary);
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.skill-tutorial__note p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.skill-tutorial__footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

@media (max-width: 640px) {
  .skill-tutorial__hero {
    grid-template-columns: 1fr;
  }

  .skill-tutorial__illustration {
    min-height: 112px;
  }

  .skill-tutorial__footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
