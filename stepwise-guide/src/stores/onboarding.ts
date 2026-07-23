import { defineStore } from 'pinia'
import { ref } from 'vue'

const ONBOARDING_DISMISSED_KEY = 'stepwise-onboarding-dismissed'

function loadDismissedState() {
  try {
    return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === 'true'
  } catch {
    return false
  }
}

function persistDismissedState(dismissed: boolean) {
  localStorage.setItem(ONBOARDING_DISMISSED_KEY, dismissed ? 'true' : 'false')
}

export const useOnboardingStore = defineStore('onboarding', () => {
  const hasDismissedOnboarding = ref(loadDismissedState())
  const isFirstVisit = ref(!hasDismissedOnboarding.value)
  const showOnboarding = ref(false)
  const completedSteps = ref<string[]>([])

  function openOnboarding() {
    if (hasDismissedOnboarding.value) {
      showOnboarding.value = false
      return
    }

    showOnboarding.value = true
  }

  function dismissOnboarding() {
    showOnboarding.value = false
    isFirstVisit.value = false
    hasDismissedOnboarding.value = true
    persistDismissedState(true)
  }

  function completeStep(step: string) {
    if (!completedSteps.value.includes(step)) {
      completedSteps.value.push(step)
    }
  }

  return {
    isFirstVisit,
    showOnboarding,
    completedSteps,
    hasDismissedOnboarding,
    openOnboarding,
    dismissOnboarding,
    completeStep,
  }
})
