<script setup lang="ts">
import { useAssessmentStore } from '@/stores/assessment'
import BaseSlider from '@/components/base/BaseSlider.vue'
import BaseRadioGroup from '@/components/base/BaseRadioGroup.vue'
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'

const store = useAssessmentStore()
const { t } = useI18n()

const sleepOptions = computed(() => [
  { label: t('assess.lifestyle.good'), value: 'good' },
  { label: t('assess.lifestyle.fair'), value: 'fair' },
  { label: t('assess.lifestyle.poor'), value: 'poor' },
])
</script>

<template>
  <div class="lifestyle-step">
    <h3 class="lifestyle-step__title">{{ t('assess.lifestyle.title') }}</h3>
    <div class="lifestyle-step__form">
      <BaseSlider
        :model-value="store.lifestyle.sittingHours"
        :label="t('assess.lifestyle.sitHours')"
        :min="1"
        :max="14"
        :step="1"
        unit="小时"
        @update:model-value="store.lifestyle.sittingHours = $event"
      />
      <div class="lifestyle-step__field">
        <span class="lifestyle-step__field-label">{{ t('assess.lifestyle.sleepQuality') }}</span>
        <BaseRadioGroup
          :model-value="store.lifestyle.sleepQuality"
          :options="sleepOptions"
          direction="row"
          @update:model-value="store.lifestyle.sleepQuality = $event as any"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.lifestyle-step {
  animation: fadeInUp 0.4s ease-out;
}

.lifestyle-step__title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-6);
}

.lifestyle-step__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.lifestyle-step__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.lifestyle-step__field-label {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
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
