<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseSlider from '@/components/base/BaseSlider.vue'
import { useI18n } from '@/composables/useI18n'
import { useAssessmentStore } from '@/stores/assessment'
import { useRecordStore } from '@/stores/record'
import { getCalorieEstimateState } from '@/utils/calorieEstimate'

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { t, currentLang } = useI18n()
const store = useRecordStore()
const assessmentStore = useAssessmentStore()
const router = useRouter()

const duration = ref(30)
const steps = ref(3000)
const saving = ref(false)
let previousBodyOverflow = ''

const calorieState = computed(() => {
  return getCalorieEstimateState(assessmentStore.basicInfo, steps.value, duration.value)
})
const estimatedCalories = computed(() => {
  return calorieState.value.status === 'estimated' || calorieState.value.status === 'no_activity'
    ? calorieState.value.calories
    : null
})
const caloriesFeedback = computed(() => {
  if (calorieState.value.status === 'missing_basic_info') {
    return currentLang.value === 'en'
      ? 'Fill in basic info to estimate calories'
      : '完善基础信息后可估算热量'
  }

  if (currentLang.value === 'en') {
    return `About ${estimatedCalories.value} ${t('record.kcalUnit')} burned`
  }

  return `本次运动约消耗 ${estimatedCalories.value} ${t('record.kcalUnit')}`
})

function formatSteps(value: number) {
  return `${value.toLocaleString()} ${t('record.stepUnit')}`
}

function getInitialDuration() {
  const latestDuration = store.records[0]?.duration

  if (typeof latestDuration === 'number' && latestDuration > 0) {
    return latestDuration
  }

  if (store.today.duration > 0) {
    return store.today.duration
  }

  return 30
}

function getInitialSteps() {
  const latestSteps = store.records[0]?.steps

  if (typeof latestSteps === 'number' && latestSteps > 0) {
    return latestSteps
  }

  if (store.today.steps > 0) {
    return store.today.steps
  }

  return 3000
}

function resetDefaults() {
  duration.value = getInitialDuration()
  steps.value = getInitialSteps()
}

function close() {
  if (saving.value) return
  emit('close')
}

function goToBasicInfo() {
  emit('close')
  router.push('/basic-info')
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

async function handleSubmit() {
  if (saving.value) return

  saving.value = true

  try {
    await store.saveTodayRecord({
      steps: steps.value,
      duration: duration.value,
      calories: estimatedCalories.value ?? 0,
      exercise: 'walk',
    })
    emit('saved')
  } finally {
    saving.value = false
  }
}

watch(
  () => props.show,
  (show) => {
    if (show) {
      resetDefaults()
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
      <div v-if="show" class="quick-record-modal">
        <div class="quick-record-backdrop" @click="close"></div>
        <Transition name="modal" appear>
          <section
            class="quick-record-panel"
            role="dialog"
            aria-modal="true"
            :aria-label="t('record.quickRecord')"
            @click.stop
          >
            <header class="quick-record__header">
              <div>
                <h3 class="quick-record__title">{{ t('record.quickRecord') }}</h3>
                <p class="quick-record__hint">{{ t('record.quickRecordHint') }}</p>
              </div>
              <button
                class="quick-record__close"
                type="button"
                :disabled="saving"
                aria-label="Close"
                @click="close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </header>

            <div class="quick-record__body">
              <BaseSlider
                v-model="duration"
                :min="0"
                :max="180"
                :step="5"
                :unit="` ${t('record.minuteUnit')}`"
                :label="t('record.duration')"
              />

              <BaseSlider
                v-model="steps"
                :min="0"
                :max="20000"
                :step="500"
                :label="t('record.steps')"
                :value-formatter="formatSteps"
              />

              <div class="quick-record__calories" aria-live="polite">
                <span class="quick-record__calories-icon" aria-hidden="true">🔥</span>
                <span>{{ caloriesFeedback }}</span>
                <button
                  v-if="calorieState.status === 'missing_basic_info'"
                  class="quick-record__calories-link"
                  type="button"
                  @click="goToBasicInfo"
                >
                  {{ currentLang === 'en' ? 'Go fill in' : '去填写' }}
                </button>
              </div>
            </div>

            <footer class="quick-record__footer">
              <BaseButton
                type="primary"
                size="lg"
                class="quick-record-save-button"
                :loading="saving"
                :disabled="saving"
                @click="handleSubmit"
              >
                {{ t('record.save') }}
              </BaseButton>
            </footer>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.quick-record-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.quick-record-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(45, 52, 54, 0.35);
}

.quick-record-panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: min(92vw, 420px);
  margin: 12vh auto 0;
  padding: var(--space-5);
  border-radius: 20px;
  background: var(--color-surface);
  box-shadow: var(--shadow-modal);
}

.quick-record__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
}

.quick-record__title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}

.quick-record__hint {
  margin: var(--space-2) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-normal);
}

.quick-record__close {
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

.quick-record__close:hover:not(:disabled) {
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.quick-record__close:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.quick-record__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.quick-record__calories {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-accent-light);
  color: var(--color-text-primary);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
}

.quick-record__calories-icon {
  font-size: 20px;
}

.quick-record__calories-link {
  border: 0;
  background: transparent;
  color: var(--color-primary);
  cursor: pointer;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  text-decoration: underline;
}

.quick-record__footer {
  margin-top: var(--space-5);
}

.quick-record-save-button {
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 14px;
  font-weight: 600;
}

@media (max-width: 640px) {
  .quick-record-panel {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 12px;
    width: auto;
    max-height: calc(100vh - 24px);
    margin: 0;
  }
}
</style>
