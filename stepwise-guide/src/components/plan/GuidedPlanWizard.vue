<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseRadioGroup from '@/components/base/BaseRadioGroup.vue'

const { t } = useI18n()

const currentStep = ref(0)

const goal = ref('')
const frequency = ref('')
const timeCommit = ref('')

const goalOptions = computed(() => [
  { label: `🏃 ${t('plan.boostEndurance')}`, value: 'endurance' },
  { label: `🧘 ${t('plan.improvePosture')}`, value: 'posture' },
  { label: `💪 ${t('plan.loseWeight')}`, value: 'weight' },
])

const frequencyOptions = computed(() => [
  { label: t('assess.exerciseHabit.rarely'), value: 'never' },
  { label: t('assess.exerciseHabit.sometimes'), value: 'occasionally' },
  { label: t('assess.exerciseHabit.often'), value: 'weekly1_2' },
  { label: t('assess.exerciseHabit.veryOften'), value: 'weekly3plus' },
])

const timeOptions = computed(() => [
  { label: t('plan.wizardTime_10'), value: '10' },
  { label: t('plan.wizardTime_15_20'), value: '15-20' },
  { label: t('plan.wizardTime_30'), value: '30' },
  { label: t('plan.wizardTime_45plus'), value: '45+' },
])

const canGenerate = computed(() => goal.value && frequency.value && timeCommit.value)

const emit = defineEmits<{
  generate: [data: { goal: string; frequency: string; time: string }]
}>()

function handleGenerate() {
  emit('generate', { goal: goal.value, frequency: frequency.value, time: timeCommit.value })
}
</script>

<template>
  <div class="guided-plan-wizard">
    <div class="guided-plan-wizard__step" v-if="currentStep === 0">
      <h3 class="guided-plan-wizard__title">{{ t('plan.wizardGoalTitle') }}</h3>
      <div class="guided-plan-wizard__cards">
        <button
          v-for="opt in goalOptions"
          :key="opt.value"
          class="guided-plan-wizard__card"
          :class="{ 'guided-plan-wizard__card--active': goal === opt.value }"
          @click="goal = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="guided-plan-wizard__step" v-if="currentStep === 1">
      <h3 class="guided-plan-wizard__title">{{ t('plan.wizardFrequencyTitle') }}</h3>
      <BaseRadioGroup
        v-model="frequency"
        :options="frequencyOptions"
        direction="column"
      />
    </div>

    <div class="guided-plan-wizard__step" v-if="currentStep === 2">
      <h3 class="guided-plan-wizard__title">{{ t('plan.wizardTimeTitle') }}</h3>
      <BaseRadioGroup
        v-model="timeCommit"
        :options="timeOptions"
        direction="row"
      />
    </div>

    <div class="guided-plan-wizard__nav">
      <BaseButton
        v-if="currentStep > 0"
        type="text"
        @click="currentStep--"
      >
        ← {{ t('assess.prevStep') }}
      </BaseButton>
      <div v-else></div>
      <BaseButton
        v-if="currentStep < 2"
        type="primary"
        :disabled="!goal && currentStep === 0"
        @click="currentStep++"
      >
        {{ t('assess.nextStep') }} →
      </BaseButton>
      <BaseButton
        v-else
        type="primary"
        :disabled="!canGenerate"
        @click="handleGenerate"
      >
        {{ t('plan.wizardGenerate') }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.guided-plan-wizard {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.guided-plan-wizard__step {
  animation: fadeInUp 0.4s ease-out;
}

.guided-plan-wizard__title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-5);
}

.guided-plan-wizard__cards {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.guided-plan-wizard__card {
  flex: 1;
  min-width: 120px;
  padding: var(--space-5) var(--space-4);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
  cursor: pointer;
  text-align: center;
}

.guided-plan-wizard__card:hover {
  border-color: var(--color-primary-lighter);
}

.guided-plan-wizard__card--active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.guided-plan-wizard__nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
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
