<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import GuidedPlanWizard from '@/components/plan/GuidedPlanWizard.vue'
import PlanCard from '@/components/plan/PlanCard.vue'
import PlanModeToggle from '@/components/plan/PlanModeToggle.vue'
import ReminderSection from '@/components/plan/ReminderSection.vue'
import WeekBreakdown from '@/components/plan/WeekBreakdown.vue'
import { useI18n } from '@/composables/useI18n'
import { mockPlans } from '@/mock/plans'
import { mockPlansEn } from '@/mock/plans-en'
import { usePlanStore } from '@/stores/plan'
import type { PlanItem, ReminderConfig } from '@/types'

const { t, currentLang } = useI18n()
const planStore = usePlanStore()
const mode = ref<'preset' | 'guided'>('preset')

const activePlans = computed(() => currentLang.value === 'en' ? mockPlansEn : mockPlans)

const selectedPlan = ref<PlanItem | null>(null)
const showDetail = ref(false)
const showReminder = ref(false)
const showAdoptedToast = ref(false)

const heroCopy = computed(() => {
  if (currentLang.value === 'en') {
    return {
      title: 'Training Plan',
      subtitle: 'Choose a plan that fits your goal.',
    }
  }

  return {
    title: '方案规划',
    subtitle: '根据目标选择合适的运动安排。',
  }
})

function viewDetail(plan: PlanItem) {
  selectedPlan.value = plan
  showDetail.value = true
}

function adoptPlan() {
  if (!selectedPlan.value) {
    return
  }

  planStore.adoptPlan(selectedPlan.value.id)
  showDetail.value = false
  showReminder.value = true
}

function handleReminderSave(config: Partial<ReminderConfig>) {
  planStore.updateReminder(config)
  showReminder.value = false
  showAdoptedToast.value = true

  window.setTimeout(() => {
    showAdoptedToast.value = false
  }, 2500)
}

function handleGuidedGenerate(data: { goal: string; frequency: string; time: string }) {
  const isEn = currentLang.value === 'en'
  const plan: PlanItem = {
    id: `custom-${Date.now()}`,
    icon: 'custom-plan',
    title: isEn ? 'My Custom Plan' : '我的专属计划',
    duration: isEn ? '4 weeks' : '4周',
    level: isEn ? 'Personalized' : '个性化',
    dailyTime: `${data.time}${isEn ? ' min' : '分钟'}`,
    description: isEn ? 'Custom exercise plan tailored to your needs' : '根据你的需求定制的运动计划',
    weeks: [
      { weekNumber: 1, summary: isEn ? 'Adaptation' : '适应期', dailyPlan: isEn ? '15 min walk + light stretch daily' : '每日散步15分钟 + 基础拉伸' },
      { weekNumber: 2, summary: isEn ? 'Progression' : '提升期', dailyPlan: isEn ? '20 min walk + 2 sets core training daily' : '每日散步20分钟 + 2组核心训练' },
      { weekNumber: 3, summary: isEn ? 'Consolidation' : '巩固期', dailyPlan: isEn ? '30 min cardio + strength training daily' : '每日30分钟有氧 + 力量训练' },
      { weekNumber: 4, summary: isEn ? 'Habit Formation' : '习惯期', dailyPlan: isEn ? '30 min free exercise + stretch daily' : '每日30分钟自由运动 + 拉伸放松' },
    ],
  }

  planStore.setCustomPlan(plan)
  showAdoptedToast.value = true

  window.setTimeout(() => {
    showAdoptedToast.value = false
  }, 2500)
}
</script>

<template>
  <div class="page-content plan-page">
    <section class="plan-page__hero">
      <div class="plan-page__hero-copy">
        <h1>{{ heroCopy.title }}</h1>
        <p>{{ heroCopy.subtitle }}</p>
      </div>
    </section>

    <section class="plan-page__controls">
      <div class="section-divider">{{ t('plan.selectTitle') }}</div>
      <PlanModeToggle v-model="mode" />
    </section>

    <div v-if="mode === 'preset'" class="plan-grid">
      <PlanCard
        v-for="plan in activePlans"
        :key="plan.id"
        :plan="plan"
        :adopted="planStore.adoptedPlanId === plan.id"
        @view-detail="viewDetail"
      />
    </div>

    <div v-else class="plan-page__guided">
      <GuidedPlanWizard @generate="handleGuidedGenerate" />
    </div>

    <section v-if="planStore.adoptedPlanId" class="plan-page__reminder">
      <div class="section-divider">{{ t('plan.reminder') }}</div>
      <ReminderSection @save="handleReminderSave" />
    </section>

    <BaseModal v-model:visible="showDetail" :title="selectedPlan?.title ?? ''">
      <div v-if="selectedPlan">
        <WeekBreakdown :weeks="selectedPlan.weeks" />
        <div class="plan-page__detail-actions">
          <BaseButton type="secondary" @click="showDetail = false">{{ t('common.back') }}</BaseButton>
          <BaseButton type="primary" @click="adoptPlan">{{ t('plan.adoptPlan') }}</BaseButton>
        </div>
      </div>
    </BaseModal>

    <BaseModal v-model:visible="showReminder" :title="t('plan.reminder')">
      <ReminderSection @save="handleReminderSave" />
    </BaseModal>

    <Teleport to="body">
      <Transition name="toast">
        <div v-if="showAdoptedToast" class="plan-page__toast">
          <span class="plan-page__toast-icon" aria-hidden="true">
            <svg viewBox="0 0 20 20">
              <path d="m4 10 4 4 8-9" />
            </svg>
          </span>
          <span>{{ t('plan.activatedDesc') }}</span>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.plan-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-bottom: calc(112px + env(safe-area-inset-bottom));
}

.plan-page__hero {
  padding: var(--space-5);
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(104, 146, 235, 0.16), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 249, 252, 0.98));
  border: 1px solid rgba(91, 141, 239, 0.12);
  box-shadow: var(--shadow-card);
}

.plan-page__hero-copy {
  max-width: 520px;
}

.plan-page__hero h1 {
  margin: 0 0 var(--space-2);
  color: var(--color-text-primary);
  font-size: 30px;
}

.plan-page__hero p {
  margin: 0;
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.plan-page__controls,
.plan-page__reminder {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

.plan-page__guided {
  min-width: 0;
}

.plan-page__detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.plan-page__toast {
  position: fixed;
  top: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-modal);
  border-left: 3px solid var(--color-success);
  z-index: 300;
  font-size: var(--font-size-body);
}

.plan-page__toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.plan-page__toast-icon svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, -12px);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -8px);
}

@media (max-width: 1200px) {
  .plan-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .plan-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .plan-page {
    gap: var(--space-3);
  }

  .plan-page__hero {
    padding: var(--space-4);
  }

  .plan-page__hero h1 {
    font-size: 26px;
  }

  .plan-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .plan-page__detail-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
