<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import TodayOverviewCard from '@/components/record/TodayOverviewCard.vue'
import QuickRecordForm from '@/components/record/QuickRecordForm.vue'
import WeeklySummary from '@/components/record/WeeklySummary.vue'
import WeekAdviceCard from '@/components/record/WeekAdviceCard.vue'
import HistoryRecordModal from '@/components/record/HistoryRecordModal.vue'
import { useWeekAdvice } from '@/composables/useWeekAdvice'
import { useAssessmentStore } from '@/stores/assessment'
import { useRecordStore } from '@/stores/record'

const store = useRecordStore()
const assessmentStore = useAssessmentStore()

onMounted(() => {
  store.fetchRecords()
  assessmentStore.fetchLatestAssessment()
})

const { t } = useI18n()
const isModalOpen = ref(false)
const isHistoryModalOpen = ref(false)
const { currentLang } = useI18n()
const weekAdvice = useWeekAdvice({
  weekRecords: computed(() => store.displayWeekRecords),
  goals: computed(() => store.goals),
  basicInfo: computed(() => assessmentStore.basicInfo),
  currentLang: computed(() => currentLang.value),
})
</script>

<template>
  <div class="page-content record-page">
    <TodayOverviewCard
      class="today-overview-clickable"
      :calories="store.overviewEstimatedCalories ?? 0"
      :calorie-status="store.overviewCalorieState.status"
      :calories-goal="store.goals.calories"
      :duration="store.displayRecord?.duration ?? 0"
      :duration-goal="store.goals.duration"
      :steps="store.displayRecord?.steps ?? 0"
      :steps-goal="store.goals.steps"
      :calories-label="t('record.calories')"
      :duration-label="t('record.duration')"
      :steps-label="t('record.steps')"
      :kcal-unit="t('record.kcalUnit')"
      :minute-unit="t('record.minuteUnit')"
      :step-unit="t('record.stepUnit')"
      role="button"
      tabindex="0"
      @click="isModalOpen = true"
      @keydown.enter="isModalOpen = true"
      @keydown.space.prevent="isModalOpen = true"
      @update-goal="store.updateGoal($event.type, $event.value)"
    />

    <div class="record-week-grid">
      <WeeklySummary
        class="weekly-summary-clickable"
        :week-days="store.displayWeekDays"
        :week-start="store.displayWeekStart"
        :week-end="store.displayWeekEnd"
        :steps-goal="store.goals.steps"
        :duration-goal="store.goals.duration"
        role="button"
        tabindex="0"
        @click="isHistoryModalOpen = true"
        @keydown.enter="isHistoryModalOpen = true"
        @keydown.space.prevent="isHistoryModalOpen = true"
      />

      <WeekAdviceCard :advice="weekAdvice" />
    </div>

    <QuickRecordForm
      :show="isModalOpen"
      @close="isModalOpen = false"
      @saved="isModalOpen = false"
    />

    <HistoryRecordModal
      :show="isHistoryModalOpen"
      :records="store.records"
      :week-days="store.displayWeekDays"
      :week-start="store.displayWeekStart"
      :week-end="store.displayWeekEnd"
      :daily-goal="store.goals.steps"
      :duration-goal="store.goals.duration"
      @close="isHistoryModalOpen = false"
    />
  </div>
</template>

<style scoped>
.record-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-top: var(--space-5);
  padding-bottom: var(--space-5);
}

.today-overview-clickable {
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    background-color var(--transition-fast);
}

.today-overview-clickable:hover {
  box-shadow: var(--shadow-card-hover);
}

.today-overview-clickable:active {
  transform: scale(0.98);
}

.today-overview-clickable:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.weekly-summary-clickable {
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    background-color var(--transition-fast);
}

.weekly-summary-clickable:hover {
  box-shadow: var(--shadow-card-hover);
}

.weekly-summary-clickable:active {
  transform: scale(0.98);
}

.weekly-summary-clickable:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.record-week-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-4);
  align-items: stretch;
}

@media (max-width: 640px) {
  .record-page {
    gap: var(--space-3);
    padding: var(--space-4);
  }

  .record-week-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
}
</style>
