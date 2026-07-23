<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from '@/composables/useI18n'
import BasicInfoStep from '@/components/assessment/BasicInfoStep.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useAssessmentStore } from '@/stores/assessment'

const store = useAssessmentStore()
const { currentLang } = useI18n()
const isSaving = ref(false)
const savedMessage = ref(false)

const canSave = computed(() => store.hasValidBasicInfo)

const text = computed(() => {
  if (currentLang.value === 'en') {
    return {
      title: 'Personal Basic Info',
      subtitle: 'Keep your height, weight, age, and gender up to date for sleep sandbox and activity estimates.',
      save: 'Save Info',
      saved: 'Saved',
    }
  }

  return {
    title: '个人基础信息',
    subtitle: '维护身高、体重、年龄和性别，供后续睡眠沙盒与运动估算使用。',
    save: '保存信息',
    saved: '已保存',
  }
})

onMounted(() => {
  store.fetchLatestAssessment()
})

async function saveBasicInfo() {
  if (!canSave.value) {
    return
  }

  isSaving.value = true
  await store.saveBasicInfo()
  isSaving.value = false
  savedMessage.value = true

  setTimeout(() => {
    savedMessage.value = false
  }, 2200)
}
</script>

<template>
  <div class="page-content basic-info-page">
    <section class="basic-info-page__panel">
      <header class="basic-info-page__header">
        <h2>{{ text.title }}</h2>
        <p>{{ text.subtitle }}</p>
      </header>

      <BasicInfoStep />

      <div class="basic-info-page__actions">
        <span v-if="savedMessage" class="basic-info-page__saved">{{ text.saved }}</span>
        <BaseButton :disabled="!canSave" :loading="isSaving" @click="saveBasicInfo">
          {{ text.save }}
        </BaseButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.basic-info-page {
  padding-bottom: calc(112px + env(safe-area-inset-bottom));
}

.basic-info-page__panel {
  padding: var(--space-6);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.basic-info-page__header {
  margin-bottom: var(--space-6);
}

.basic-info-page__header h2 {
  margin: 0 0 var(--space-2);
  color: var(--color-text-primary);
  font-size: var(--font-size-h2);
}

.basic-info-page__header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
}

.basic-info-page__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-4);
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
}

.basic-info-page__saved {
  color: var(--color-success);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
}

@media (max-width: 640px) {
  .basic-info-page__panel {
    padding: var(--space-5);
  }

  .basic-info-page__actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
