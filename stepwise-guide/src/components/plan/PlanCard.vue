<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import type { PlanItem } from '@/types'

interface Props {
  plan: PlanItem
  adopted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  adopted: false,
})

const { t } = useI18n()

const emit = defineEmits<{
  viewDetail: [plan: PlanItem]
}>()

const theme = computed(() => {
  const id = props.plan.id

  if (id.includes('fat') || id.includes('burn')) {
    return { name: 'flame', rgb: '233, 148, 90' }
  }

  if (id.includes('strength') || id.includes('fit')) {
    return { name: 'bolt', rgb: '87, 143, 236' }
  }

  if (id.includes('recover') || id.includes('relax')) {
    return { name: 'leaf', rgb: '82, 162, 126' }
  }

  return { name: 'path', rgb: '99, 133, 241' }
})
</script>

<template>
  <button
    type="button"
    class="plan-card"
    :class="{ 'plan-card--adopted': adopted }"
    :style="{ '--plan-rgb': theme.rgb }"
    @click="emit('viewDetail', plan)"
  >
    <div class="plan-card__header">
      <div class="plan-card__badge" aria-hidden="true">
        <svg v-if="theme.name === 'flame'" viewBox="0 0 24 24">
          <path d="M12 3c1.4 2.6 3.6 4.7 3.6 8.2A3.6 3.6 0 0 1 12 14.8a4.5 4.5 0 0 0-4.4 4.6A5.4 5.4 0 0 0 13 21c3.8 0 6.4-2.7 6.4-6.4 0-5-3.6-8-7.4-11.6Z" />
        </svg>
        <svg v-else-if="theme.name === 'bolt'" viewBox="0 0 24 24">
          <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
        </svg>
        <svg v-else-if="theme.name === 'leaf'" viewBox="0 0 24 24">
          <path d="M19 4c-7.5.4-12.2 4.6-12.2 10.2 0 3.2 2.2 5.8 5.5 5.8 5.4 0 8.7-5 6.7-16Z" />
          <path d="M8 15c2.3-1.8 4.7-3.2 8-4.5" />
        </svg>
        <svg v-else viewBox="0 0 24 24">
          <path d="M4 18c3-6.5 7.3-10.6 16-12" />
          <path d="m15 6 5 .2-.2 5" />
          <path d="M6 11c1.8 1 3.2 2.4 4.2 4.2" />
        </svg>
      </div>
      <div class="plan-card__status" v-if="adopted">{{ t('plan.adopted') }}</div>
    </div>

    <div class="plan-card__body">
      <h3 class="plan-card__title">{{ plan.title }}</h3>
      <p class="plan-card__desc">{{ plan.description }}</p>
    </div>

    <div class="plan-card__meta">
      <span class="plan-card__tag">{{ plan.duration }}</span>
      <span class="plan-card__tag">{{ plan.level }}</span>
      <span class="plan-card__tag">{{ plan.dailyTime }}</span>
    </div>
  </button>
</template>

<style scoped>
.plan-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 214px;
  padding: 18px;
  border: 1px solid rgba(var(--plan-rgb), 0.16);
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(var(--plan-rgb), 0.12), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 252, 0.96));
  box-shadow: var(--shadow-card);
  text-align: left;
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    border-color var(--transition-fast);
}

.plan-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
}

.plan-card:active {
  transform: scale(0.985);
}

.plan-card:focus-visible {
  outline: 2px solid rgba(var(--plan-rgb), 0.4);
  outline-offset: 3px;
}

.plan-card--adopted {
  border-color: rgba(var(--plan-rgb), 0.28);
  box-shadow: 0 14px 32px rgba(var(--plan-rgb), 0.16);
}

.plan-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.plan-card__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.76);
  color: rgb(var(--plan-rgb));
  box-shadow: 0 10px 24px rgba(var(--plan-rgb), 0.14);
}

.plan-card__badge svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.plan-card__status {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(var(--plan-rgb), 0.14);
  color: rgb(var(--plan-rgb));
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
}

.plan-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
}

.plan-card__title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
}

.plan-card__desc {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.plan-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.plan-card__tag {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(var(--plan-rgb), 0.1);
  color: rgba(32, 48, 72, 0.82);
  font-size: 11px;
  font-weight: var(--font-weight-medium);
}

@media (max-width: 640px) {
  .plan-card {
    min-height: 188px;
    border-radius: 22px;
  }

  .plan-card__title {
    font-size: 18px;
  }
}
</style>
