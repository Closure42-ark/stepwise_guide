<script setup lang="ts">
import { useAssessmentStore } from '@/stores/assessment'
import BaseRadioGroup from '@/components/base/BaseRadioGroup.vue'
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const store = useAssessmentStore()
const { t } = useI18n()

const frequencyOptions = computed(() => [
  { label: t('assess.exerciseHabit.rarely'), value: 'never' },
  { label: t('assess.exerciseHabit.sometimes'), value: 'occasionally' },
  { label: t('assess.exerciseHabit.often'), value: 'weekly1_2' },
  { label: t('assess.exerciseHabit.veryOften'), value: 'weekly3plus' },
])

const allTypes = computed(() => [
  t('record.walking'),
  t('record.running'),
  t('record.cycling'),
  '游泳',
  t('record.strength'),
  t('record.yoga'),
  t('record.stretching'),
])

const selectedTypes = computed({
  get: () => store.exerciseHabit.types,
  set: (val: string[]) => { store.exerciseHabit.types = val },
})

function toggleType(type: string) {
  const idx = store.exerciseHabit.types.indexOf(type)
  if (idx >= 0) {
    store.exerciseHabit.types.splice(idx, 1)
  } else {
    store.exerciseHabit.types.push(type)
  }
}
</script>

<template>
  <div class="exercise-habit-step">
    <h3 class="exercise-habit-step__title">{{ t('assess.exerciseHabit.title') }}</h3>
    <div class="exercise-habit-step__form">
      <div class="exercise-habit-step__field">
        <span class="exercise-habit-step__field-label">{{ t('assess.exerciseHabit.frequency') }}</span>
        <BaseRadioGroup
          :model-value="store.exerciseHabit.frequency"
          :options="frequencyOptions"
          direction="column"
          @update:model-value="store.exerciseHabit.frequency = $event as any"
        />
      </div>
      <div class="exercise-habit-step__field">
        <span class="exercise-habit-step__field-label">{{ t('assess.exerciseHabit.types') }}</span>
        <div class="exercise-habit-step__type-grid">
          <button
            v-for="type in allTypes"
            :key="type"
            class="exercise-habit-step__type-btn"
            :class="{ 'exercise-habit-step__type-btn--active': selectedTypes.includes(type) }"
            @click="toggleType(type)"
          >
            {{ type }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exercise-habit-step {
  animation: fadeInUp 0.4s ease-out;
}

.exercise-habit-step__title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-6);
}

.exercise-habit-step__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.exercise-habit-step__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.exercise-habit-step__field-label {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.exercise-habit-step__type-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.exercise-habit-step__type-btn {
  padding: var(--space-2) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  background: var(--color-surface);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.exercise-habit-step__type-btn:hover {
  border-color: var(--color-primary-lighter);
}

.exercise-habit-step__type-btn--active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
