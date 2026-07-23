<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import BaseModal from '@/components/base/BaseModal.vue'
import CategoryFilter from '@/components/learn/CategoryFilter.vue'
import SkillCard from '@/components/learn/SkillCard.vue'
import SkillTutorial from '@/components/learn/SkillTutorial.vue'
import { useI18n } from '@/composables/useI18n'
import { mockSkills } from '@/mock/skills'
import { mockSkillsEn } from '@/mock/skills-en'
import { useLearnStore } from '@/stores/learn'
import type { SkillItem } from '@/types'

const { t, currentLang } = useI18n()
const learnStore = useLearnStore()

const activeSkills = computed(() => currentLang.value === 'en' ? mockSkillsEn : mockSkills)

const selectedCategory = ref(t('learn.all'))
const categories = computed(() => [...new Set(activeSkills.value.map(skill => skill.category))])

const filteredSkills = computed(() => {
  if (selectedCategory.value === t('learn.all')) {
    return activeSkills.value
  }

  return activeSkills.value.filter(skill => skill.category === selectedCategory.value)
})

const activeSkill = ref<SkillItem | null>(null)
const showTutorial = ref(false)

const heroCopy = computed(() => {
  if (currentLang.value === 'en') {
    return {
      title: 'Movement Skills',
      subtitle: 'Learn a few clean movement patterns and improve everyday posture with less friction.',
    }
  }

  return {
    title: '运动技能',
    subtitle: '从几组简单动作开始，逐步改善日常姿势、稳定性和活动质量。',
  }
})

function startTutorial(skill: SkillItem) {
  activeSkill.value = skill
  showTutorial.value = true
}

function closeTutorial() {
  showTutorial.value = false
  activeSkill.value = null
}

watch(showTutorial, (open) => {
  learnStore.setSkillTutorialOpen(open)
}, { immediate: true })

onBeforeUnmount(() => {
  learnStore.setSkillTutorialOpen(false)
})
</script>

<template>
  <div class="page-content learn-page">
    <section class="learn-page__hero">
      <h1>{{ heroCopy.title }}</h1>
      <p>{{ heroCopy.subtitle }}</p>
    </section>

    <section class="learn-page__filters">
      <div class="section-divider">{{ t('learn.categoryTitle') }}</div>
      <CategoryFilter v-model="selectedCategory" :categories="categories" />
    </section>

    <div class="learn-page__grid">
      <SkillCard
        v-for="skill in filteredSkills"
        :key="skill.id"
        :skill="skill"
        @start="startTutorial"
      />
    </div>

    <BaseModal v-model:visible="showTutorial" :title="activeSkill?.title ?? ''">
      <div v-if="activeSkill" class="learn-skill-modal-anchor">
        <SkillTutorial
          :skill="activeSkill"
          @complete="closeTutorial"
          @close="closeTutorial"
        />
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.learn-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding-bottom: calc(112px + env(safe-area-inset-bottom));
}

.learn-page__hero {
  padding: var(--space-5);
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(104, 146, 235, 0.16), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 249, 252, 0.98));
  border: 1px solid rgba(91, 141, 239, 0.12);
  box-shadow: var(--shadow-card);
}

.learn-page__hero h1 {
  margin: 0 0 var(--space-2);
  color: var(--color-text-primary);
  font-size: 30px;
}

.learn-page__hero p {
  margin: 0;
  max-width: 580px;
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.learn-page__filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.learn-page__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}

@media (max-width: 960px) {
  .learn-page__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .learn-page {
    gap: var(--space-3);
  }

  .learn-page__hero {
    padding: var(--space-4);
  }

  .learn-page__hero h1 {
    font-size: 26px;
  }

  .learn-page__grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
}
</style>
