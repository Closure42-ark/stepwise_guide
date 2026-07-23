<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import OnboardingOverlay from '@/components/onboarding/OnboardingOverlay.vue'
import { useOnboardingStore } from '@/stores/onboarding'
import { useUserStore } from '@/stores/user'

const { currentLang } = useI18n()
const onboarding = useOnboardingStore()
const userStore = useUserStore()

onMounted(() => {
  userStore.fetchUser()

  if (onboarding.isFirstVisit) {
    onboarding.openOnboarding()
  }
})
</script>

<template>
  <div class="app" :lang="currentLang === 'zh' ? 'zh-CN' : 'en'">
    <AppNavbar />
    <main class="app__main">
      <router-view v-slot="{ Component }">
        <Transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
    <OnboardingOverlay />
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
}

.app__main {
  padding-bottom: calc(96px + env(safe-area-inset-bottom));
}
</style>
