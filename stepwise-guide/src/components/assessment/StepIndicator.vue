<script setup lang="ts">
interface Props {
  current: number
  total: number
  labels: string[]
}

defineProps<Props>()
</script>

<template>
  <div class="step-indicator">
    <div class="step-indicator__steps">
      <template v-for="i in total" :key="i">
        <div
          class="step-indicator__dot"
          :class="{
            'step-indicator__dot--active': i === current,
            'step-indicator__dot--done': i < current,
          }"
        >
          <svg v-if="i < current" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span v-else>{{ i }}</span>
        </div>
        <div v-if="i < total" class="step-indicator__line" :class="{ 'step-indicator__line--done': i < current }"></div>
      </template>
    </div>
    <div class="step-indicator__labels">
      <span
        v-for="(label, i) in labels"
        :key="i"
        class="step-indicator__label"
        :class="{
          'step-indicator__label--active': i + 1 === current,
          'step-indicator__label--done': i + 1 < current,
        }"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.step-indicator {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
}

.step-indicator__steps {
  display: flex;
  align-items: center;
  gap: 0;
}

.step-indicator__dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  background: var(--color-border);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  transition: all var(--transition-normal);
}

.step-indicator__dot--active {
  background: var(--color-primary);
  color: #fff;
}

.step-indicator__dot--done {
  background: var(--color-primary);
  color: #fff;
}

.step-indicator__line {
  flex: 1;
  height: 2px;
  background: var(--color-border);
  transition: background var(--transition-normal);
}

.step-indicator__line--done {
  background: var(--color-primary);
}

.step-indicator__labels {
  display: flex;
  justify-content: space-between;
}

.step-indicator__label {
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-align: center;
  flex: 1;
}

.step-indicator__label--active {
  color: var(--color-primary);
  font-weight: var(--font-weight-medium);
}

.step-indicator__label--done {
  color: var(--color-primary);
}
</style>
