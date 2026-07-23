<script setup lang="ts">
import { computed } from 'vue'
import { useAssessmentStore } from '@/stores/assessment'
import { useI18n } from '@/composables/useI18n'
import BaseRadioGroup from '@/components/base/BaseRadioGroup.vue'
import RulerSlider from '@/components/base/RulerSlider.vue'

const store = useAssessmentStore()
const { t, currentLang } = useI18n()

const genderOptions = computed(() => [
  { label: t('assess.basicInfo.male'), value: 'male' },
  { label: t('assess.basicInfo.female'), value: 'female' },
])

const bmiStatus = computed(() => {
  const bmi = store.bmi

  if (bmi <= 0) {
    return null
  }

  if (bmi < 18.5) {
    return {
      label: t('assess.bmiUnderweight'),
      color: 'var(--color-info)',
      tone: 'rgba(91, 141, 239, 0.12)',
    }
  }

  if (bmi < 24) {
    return {
      label: t('assess.bmiNormal'),
      color: 'var(--color-success)',
      tone: 'rgba(74, 158, 111, 0.12)',
    }
  }

  if (bmi < 28) {
    return {
      label: t('assess.bmiOverweight'),
      color: 'var(--color-warning)',
      tone: 'rgba(240, 180, 41, 0.16)',
    }
  }

  return {
    label: t('assess.bmiObese'),
    color: 'var(--color-accent)',
    tone: 'rgba(232, 148, 90, 0.14)',
  }
})
</script>

<template>
  <div class="basic-info-step">
    <h3 class="basic-info-step__title">{{ t('assess.basicInfo.title') }}</h3>

    <div class="basic-info-step__form">
      <RulerSlider
        :model-value="store.basicInfo.height"
        :label="t('assess.basicInfo.height')"
        :required-label="currentLang === 'en' ? '(Required)' : '（必填）'"
        :clear-label="currentLang === 'en' ? 'Reset height' : '重置身高'"
        :unit="currentLang === 'en' ? 'cm' : '厘米'"
        :min="120"
        :max="220"
        :step="1"
        :major-step="5"
        :empty-value="0"
        :fallback-value="170"
        @update:model-value="store.basicInfo.height = $event"
      />

      <RulerSlider
        :model-value="store.basicInfo.weight"
        :label="t('assess.basicInfo.weight')"
        :required-label="currentLang === 'en' ? '(Required)' : '（必填）'"
        :clear-label="currentLang === 'en' ? 'Reset weight' : '重置体重'"
        :unit="currentLang === 'en' ? 'kg' : '公斤'"
        :min="30"
        :max="150"
        :step="0.5"
        :major-step="5"
        :empty-value="0"
        :fallback-value="60"
        :decimals="1"
        @update:model-value="store.basicInfo.weight = $event"
      />

      <RulerSlider
        :model-value="store.basicInfo.age"
        :label="t('assess.basicInfo.age')"
        :required-label="currentLang === 'en' ? '(Required)' : '（必填）'"
        :clear-label="currentLang === 'en' ? 'Reset age' : '重置年龄'"
        :unit="currentLang === 'en' ? 'years' : '岁'"
        :min="10"
        :max="100"
        :step="1"
        :major-step="5"
        :empty-value="0"
        :fallback-value="30"
        @update:model-value="store.basicInfo.age = $event"
      />

      <div
        v-if="bmiStatus"
        class="basic-info-step__bmi-card"
        :style="{ '--bmi-color': bmiStatus.color, '--bmi-tone': bmiStatus.tone }"
      >
        <div class="basic-info-step__bmi-header">
          <span>{{ t('assess.bmiTitle') }}</span>
          <strong>{{ store.bmi.toFixed(1) }}</strong>
        </div>
        <div class="basic-info-step__bmi-meta">
          <span class="basic-info-step__bmi-chip">{{ bmiStatus.label }}</span>
          <p>{{ t('assess.bmiDesc') }}</p>
        </div>
      </div>

      <div class="basic-info-step__field">
        <span class="basic-info-step__field-label">{{ t('assess.basicInfo.gender') }}</span>
        <BaseRadioGroup
          :model-value="store.basicInfo.gender"
          :options="genderOptions"
          direction="row"
          @update:model-value="store.basicInfo.gender = $event as 'male' | 'female' | ''"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.basic-info-step {
  animation: fadeInUp 0.4s ease-out;
}

.basic-info-step__title {
  margin-bottom: var(--space-6);
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
}

.basic-info-step__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.basic-info-step__bmi-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid color-mix(in srgb, var(--bmi-color) 22%, white);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--bmi-tone), rgba(255, 255, 255, 0.94));
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.basic-info-step__bmi-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
}

.basic-info-step__bmi-header span {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.basic-info-step__bmi-header strong {
  color: var(--bmi-color);
  font-family: 'DM Sans', sans-serif;
  font-size: 28px;
  font-weight: var(--font-weight-bold);
}

.basic-info-step__bmi-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.basic-info-step__bmi-meta p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
  text-align: right;
}

.basic-info-step__bmi-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-full);
  background: color-mix(in srgb, var(--bmi-color) 16%, white);
  color: var(--bmi-color);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.basic-info-step__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.basic-info-step__field-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-body);
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

@media (max-width: 640px) {
  .basic-info-step__bmi-meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .basic-info-step__bmi-meta p {
    text-align: left;
  }
}
</style>
