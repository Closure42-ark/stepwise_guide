<script setup lang="ts">
interface Props {
  value: number
  max?: number
  color?: string
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  color: '',
  size: 'md',
})

const percentage = computed(() => Math.min((props.value / props.max) * 100, 100))
const barColor = computed(() => props.color || 'var(--color-primary)')
</script>

<script lang="ts">
import { computed } from 'vue'
</script>

<template>
  <div class="base-progress" :class="`base-progress--${size}`">
    <div class="base-progress__track">
      <div
        class="base-progress__fill"
        :style="{ width: `${percentage}%`, background: barColor }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.base-progress {
  width: 100%;
}

.base-progress--sm {
  height: 4px;
}

.base-progress--md {
  height: 6px;
}

.base-progress__track {
  width: 100%;
  height: 100%;
  border-radius: var(--radius-full);
  background: var(--color-border);
  overflow: hidden;
}

.base-progress__fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.6s ease-out;
}
</style>
