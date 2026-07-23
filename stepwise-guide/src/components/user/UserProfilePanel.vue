<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useI18n } from '@/composables/useI18n'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const router = useRouter()
const userStore = useUserStore()
const { currentLang } = useI18n()

const displayNameInput = ref('')
const selectedAvatar = ref('U')
const savedMessage = ref(false)

const avatars = ['U', 'A', 'B', 'C']

const text = computed(() => {
  if (currentLang.value === 'en') {
    return {
      profile: 'Profile',
      displayName: 'User name',
      saveName: 'Save name',
      saved: 'Saved',
      logout: 'Logout',
      placeholder: 'User name',
    }
  }

  return {
    profile: '用户资料',
    displayName: '用户名',
    saveName: '保存名称',
    saved: '已保存',
    logout: '退出登录',
    placeholder: '用户名',
  }
})

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      displayNameInput.value = userStore.displayName || userStore.user?.username || ''
      selectedAvatar.value = userStore.avatar || 'U'
      savedMessage.value = false
    }
  }
)

function closePanel() {
  emit('update:visible', false)
}

function saveProfile() {
  userStore.updateProfile({
    displayName: displayNameInput.value,
    avatar: selectedAvatar.value,
  })

  savedMessage.value = true

  setTimeout(() => {
    savedMessage.value = false
  }, 1500)
}

async function handleLogout() {
  await userStore.logout()
  closePanel()
  router.push('/login')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="profile-panel">
      <div v-if="props.visible" class="profile">
        <div class="profile__overlay" @click="closePanel"></div>

        <aside class="profile__panel">
          <div class="profile__header">
            <h2 class="profile__title">{{ text.profile }}</h2>
            <button class="profile__close" @click="closePanel">×</button>
          </div>

          <div class="profile__avatar">
            <div class="profile__avatar-preview">
              {{ selectedAvatar }}
            </div>

            <div class="profile__avatar-options">
              <button
                v-for="item in avatars"
                :key="item"
                class="profile__avatar-option"
                :class="{ 'profile__avatar-option--active': selectedAvatar === item }"
                @click="selectedAvatar = item"
              >
                {{ item }}
              </button>
            </div>
          </div>

          <div class="profile__section">
            <label class="profile__label">{{ text.displayName }}</label>
            <input
              v-model="displayNameInput"
              class="profile__input"
              :placeholder="text.placeholder"
            />

            <div class="profile__save-row">
              <button class="profile__save" @click="saveProfile">
                {{ text.saveName }}
              </button>
              <span v-if="savedMessage" class="profile__saved">
                {{ text.saved }}
              </span>
            </div>
          </div>

          <div class="profile__footer">
            <button class="profile__logout" @click="handleLogout">
              {{ text.logout }}
            </button>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.profile {
  position: fixed;
  inset: 0;
  z-index: 500;
}

.profile__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.24);
}

.profile__panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  max-width: 86vw;
  height: 100%;
  background: var(--color-surface);
  box-shadow: var(--shadow-modal);
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.profile__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.profile__title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.profile__close {
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.profile__avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.profile__avatar-preview {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
}

.profile__avatar-options {
  display: flex;
  gap: var(--space-2);
}

.profile__avatar-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  color: var(--color-text-secondary);
}

.profile__avatar-option--active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.profile__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.profile__label,
.profile__section-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.profile__input {
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
}

.profile__save-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.profile__save {
  align-self: flex-start;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-4);
  background: var(--color-primary-light);
  color: var(--color-primary);
  cursor: pointer;
}

.profile__saved {
  font-size: var(--font-size-caption);
  color: var(--color-success);
}

.profile__footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

.profile__logout {
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-5);
  background: var(--color-primary);
  color: white;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
}

.profile-panel-enter-active,
.profile-panel-leave-active {
  transition: opacity 0.2s ease;
}

.profile-panel-enter-from,
.profile-panel-leave-to {
  opacity: 0;
}
</style>
