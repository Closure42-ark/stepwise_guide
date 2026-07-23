<script setup lang="ts">
import SkillCardIcon from '@/components/learn/SkillCardIcon.vue'
import type { SkillItem } from '@/types'

interface Props {
  skill: SkillItem
}

const props = defineProps<Props>()

const emit = defineEmits<{
  start: [skill: SkillItem]
}>()

const skillThemeMap: Record<string, { rgb: string; tint: string; border: string }> = {
  'neck-stretch': {
    rgb: '99, 133, 241',
    tint: 'linear-gradient(180deg, rgba(99, 133, 241, 0.1), rgba(99, 133, 241, 0.22))',
    border: 'rgba(99, 133, 241, 0.18)',
  },
  'shoulder-circle': {
    rgb: '67, 163, 152',
    tint: 'linear-gradient(180deg, rgba(67, 163, 152, 0.08), rgba(67, 163, 152, 0.22))',
    border: 'rgba(67, 163, 152, 0.18)',
  },
  'bodyweight-squat': {
    rgb: '233, 148, 90',
    tint: 'linear-gradient(180deg, rgba(233, 148, 90, 0.08), rgba(233, 148, 90, 0.22))',
    border: 'rgba(233, 148, 90, 0.18)',
  },
  'running-posture': {
    rgb: '87, 143, 236',
    tint: 'linear-gradient(180deg, rgba(87, 143, 236, 0.08), rgba(87, 143, 236, 0.22))',
    border: 'rgba(87, 143, 236, 0.18)',
  },
  'cat-cow': {
    rgb: '142, 110, 230',
    tint: 'linear-gradient(180deg, rgba(142, 110, 230, 0.08), rgba(142, 110, 230, 0.22))',
    border: 'rgba(142, 110, 230, 0.18)',
  },
  'wall-sit': {
    rgb: '82, 122, 152',
    tint: 'linear-gradient(180deg, rgba(82, 122, 152, 0.08), rgba(82, 122, 152, 0.22))',
    border: 'rgba(82, 122, 152, 0.18)',
  },
}

const theme = skillThemeMap[props.skill.id] ?? {
  rgb: '74, 158, 111',
  tint: 'linear-gradient(180deg, rgba(74, 158, 111, 0.08), rgba(74, 158, 111, 0.22))',
  border: 'rgba(74, 158, 111, 0.18)',
}
</script>

<template>
  <button
    type="button"
    class="skill-card"
    :style="{
      '--skill-rgb': theme.rgb,
      '--skill-glow': theme.tint,
      '--skill-border': theme.border,
    }"
    @click="emit('start', skill)"
  >
    <div class="skill-card__icon-wrap" aria-hidden="true">
      <SkillCardIcon :skill-id="skill.id" />
    </div>

    <div class="skill-card__footer">
      <h3 class="skill-card__title">{{ skill.title }}</h3>
    </div>
  </button>
</template>

<style scoped>
.skill-card {
  position: relative;
  min-height: 172px;
  padding: 18px;
  border: 1px solid var(--skill-border);
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(var(--skill-rgb), 0.12), transparent 44%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 252, 0.96));
  box-shadow: var(--shadow-card);
  text-align: left;
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    border-color var(--transition-fast);
  overflow: hidden;
}

.skill-card::before {
  content: '';
  position: absolute;
  top: 12px;
  right: 12px;
  width: 108px;
  height: 108px;
  border-radius: 999px;
  background: var(--skill-glow);
  opacity: 0.9;
  pointer-events: none;
}

.skill-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
}

.skill-card:active {
  transform: scale(0.985);
}

.skill-card:focus-visible {
  outline: 2px solid rgba(var(--skill-rgb), 0.42);
  outline-offset: 3px;
}

.skill-card__icon-wrap {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.74);
  color: rgb(var(--skill-rgb));
  box-shadow: 0 10px 24px rgba(var(--skill-rgb), 0.12);
}

.skill-card__footer {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 18px;
  z-index: 1;
}

.skill-card__title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 20px;
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
}

@media (max-width: 640px) {
  .skill-card {
    min-height: 156px;
    border-radius: 22px;
  }

  .skill-card__title {
    font-size: 18px;
  }
}
</style>
