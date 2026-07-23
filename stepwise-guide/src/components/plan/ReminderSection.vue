<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseToggle from '@/components/base/BaseToggle.vue'
import BaseSlider from '@/components/base/BaseSlider.vue'

const { t } = useI18n()

const exerciseReminder = ref(false)
const exerciseTime = ref('18:00')
const exerciseDays = ref<number[]>([2, 4])
const sittingReminder = ref(false)
const sittingInterval = ref(60)

const dayLabels = computed(() => [
  t('plan.dayMon'),
  t('plan.dayTue'),
  t('plan.dayWed'),
  t('plan.dayThu'),
  t('plan.dayFri'),
  t('plan.daySat'),
  t('plan.daySun'),
])

function toggleDay(day: number) {
  const idx = exerciseDays.value.indexOf(day)
  if (idx >= 0) {
    exerciseDays.value.splice(idx, 1)
  } else {
    exerciseDays.value.push(day)
  }
}

const emit = defineEmits<{
  save: [config: any]
}>()

function handleSave() {
  emit('save', {
    exerciseReminder: exerciseReminder.value,
    exerciseTime: exerciseTime.value,
    exerciseDays: exerciseDays.value,
    sittingReminder: sittingReminder.value,
    sittingInterval: sittingInterval.value,
  })
}
</script>

<template>
  <div class="reminder-section">
    <div class="reminder-section__group">
      <BaseToggle v-model="exerciseReminder" :label="t('plan.exerciseReminder')" />
      <div v-if="exerciseReminder" class="reminder-section__settings">
        <div class="reminder-section__row">
          <span class="reminder-section__label">{{ t('plan.reminderTime') }}</span>
          <input
            v-model="exerciseTime"
            type="time"
            class="reminder-section__time-input"
          />
        </div>
        <div class="reminder-section__row">
          <span class="reminder-section__label">{{ t('plan.reminderRepeatDays') }}</span>
          <div class="reminder-section__days">
            <button
              v-for="(label, i) in dayLabels"
              :key="i"
              class="reminder-section__day-btn"
              :class="{ 'reminder-section__day-btn--active': exerciseDays.includes(i + 1) }"
              @click="toggleDay(i + 1)"
            >
              {{ label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="reminder-section__group">
      <BaseToggle v-model="sittingReminder" :label="t('plan.sitReminder')" />
      <div v-if="sittingReminder" class="reminder-section__settings">
        <BaseSlider
          v-model="sittingInterval"
          :label="t('plan.reminderSittingInterval')"
          :min="15"
          :max="120"
          :step="15"
          :unit="t('plan.reminderSittingUnit')"
        />
      </div>
    </div>

    <BaseButton type="primary" size="lg" class="reminder-section__save" @click="handleSave">
      {{ t('plan.reminderSave') }}
    </BaseButton>
  </div>
</template>

<style scoped>
.reminder-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.reminder-section__group {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.reminder-section__settings {
  padding: var(--space-4);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  animation: slideDown 0.3s ease-out;
}

.reminder-section__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.reminder-section__label {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.reminder-section__time-input {
  padding: var(--space-2) var(--space-3);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: 'DM Sans', sans-serif;
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  background: var(--color-surface);
}

.reminder-section__time-input:focus {
  border-color: var(--color-primary);
  outline: none;
}

.reminder-section__days {
  display: flex;
  gap: var(--space-1);
}

.reminder-section__day-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  transition: all var(--transition-fast);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reminder-section__day-btn--active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.reminder-section__save {
  align-self: flex-end;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
