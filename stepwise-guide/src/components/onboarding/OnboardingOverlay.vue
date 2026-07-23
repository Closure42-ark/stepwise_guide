<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from '@/stores/onboarding'
import { useI18n } from '@/composables/useI18n'
import type { Language } from '@/types'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const store = useOnboardingStore()
const { t, currentLang, reloadWithLanguage } = useI18n()

const showLanguageStep = ref(!localStorage.getItem('stepwise-lang'))

function selectLanguage(lang: Language) {
  reloadWithLanguage(lang)
}

function dismiss() {
  showLanguageStep.value = false
  store.dismissOnboarding()
}

function goToAssess() {
  showLanguageStep.value = false
  store.dismissOnboarding()
  router.push('/assess')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="store.showOnboarding" class="onboarding__overlay" @click.self="dismiss"></div>
    </Transition>
    <Transition name="modal">
      <div v-if="store.showOnboarding" class="onboarding__container">
        <div v-if="showLanguageStep" class="onboarding__card">
          <div class="onboarding__icon">🌐</div>
          <h2 class="onboarding__title">{{ t('onboarding.welcome') }}</h2>
          <p class="onboarding__desc">{{ t('onboarding.welcomeDesc') }}</p>
          <p class="onboarding__label">{{ t('onboarding.selectLang') }}</p>
          <div class="onboarding__lang-options">
            <button
              class="onboarding__lang-btn"
              :class="{ 'onboarding__lang-btn--active': currentLang === 'zh' }"
              @click="selectLanguage('zh')"
            >
              🇨🇳 {{ t('onboarding.zh') }}
            </button>
            <button
              class="onboarding__lang-btn"
              :class="{ 'onboarding__lang-btn--active': currentLang === 'en' }"
              @click="selectLanguage('en')"
            >
              🇺🇸 {{ t('onboarding.en') }}
            </button>
          </div>
        </div>
        <div v-else class="onboarding__card">
          <div class="onboarding__icon">🌿</div>
          <h2 class="onboarding__title">{{ t('onboarding.step1Title') }}</h2>
          <p class="onboarding__desc">{{ t('onboarding.step1Desc') }}</p>
          <div class="onboarding__step-preview">
            <span class="onboarding__step-icon">📋</span>
            <span class="onboarding__step-text">{{ t('assess.title') }}</span>
            <span class="onboarding__step-sub">{{ t('assess.subtitle') }}</span>
          </div>
          <BaseButton type="primary" size="lg" class="onboarding__btn" @click="goToAssess">
            {{ t('onboarding.getStarted') }} →
          </BaseButton>
          <button class="onboarding__skip" @click="dismiss">{{ t('common.cancel') }}</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.onboarding__overlay {
  position: fixed;
  inset: 0;
  background: rgba(45, 52, 54, 0.5);
  z-index: 400;
}
.onboarding__container {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 410;
  padding: var(--space-6);
}
.onboarding__card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-10) var(--space-8);
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-modal);
}
.onboarding__icon {
  font-size: 48px;
  margin-bottom: var(--space-4);
}
.onboarding__title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-3);
}
.onboarding__desc {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-6);
}
.onboarding__label {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}
.onboarding__lang-options {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
}
.onboarding__lang-btn {
  padding: 12px 32px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  font-size: 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text);
}
.onboarding__lang-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.onboarding__lang-btn--active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}
.onboarding__step-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-6);
  width: 100%;
}
.onboarding__step-icon {
  font-size: 24px;
}
.onboarding__step-text {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
}
.onboarding__step-sub {
  font-size: var(--font-size-caption);
  color: var(--color-text-secondary);
}
.onboarding__btn {
  width: 100%;
  margin-bottom: var(--space-3);
}
.onboarding__skip {
  font-size: var(--font-size-caption);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color var(--transition-fast);
}
.onboarding__skip:hover {
  color: var(--color-text-secondary);
}
</style>
