<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

interface Props {
  suggestions: string[]
}

defineProps<Props>()
const { t } = useI18n()
</script>

<template>
  <div class="suggestion-list">
    <h3 class="suggestion-list__title">{{ t('assess.suggestionTitle') }}</h3>
    <ul class="suggestion-list__items">
      <li v-for="(suggestion, i) in suggestions" :key="i" class="suggestion-list__item">
        <span class="suggestion-list__number">{{ i + 1 }}</span>
        <span class="suggestion-list__text">{{ suggestion }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.suggestion-list {
  margin-top: var(--space-6);
}

.suggestion-list__title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-4);
}

.suggestion-list__items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.suggestion-list__item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.suggestion-list__number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.suggestion-list__text {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  line-height: var(--line-height-relaxed);
}
</style>
