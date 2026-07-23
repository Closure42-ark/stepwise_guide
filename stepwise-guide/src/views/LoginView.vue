<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true

  try {
    await userStore.login(username.value, password.value)
    router.push('/record')
  } catch (err: any) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  errorMsg.value = ''
  loading.value = true

  try {
    await userStore.register(username.value, password.value)
    await userStore.login(username.value, password.value)
    router.push('/record')
  } catch (err: any) {
    errorMsg.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login">
    <div class="login__card">
      <h1 class="login__title">Stepwise Guide</h1>
      <p class="login__subtitle">Login to continue</p>

      <input
        v-model="username"
        class="login__input"
        placeholder="Username"
      />

      <input
        v-model="password"
        type="password"
        class="login__input"
        placeholder="Password"
      />

      <p v-if="errorMsg" class="login__error">
        {{ errorMsg }}
      </p>

      <div class="login__buttons">
        <BaseButton
          type="primary"
          :disabled="loading"
          @click="handleLogin"
        >
          Login
        </BaseButton>

        <BaseButton
          type="secondary"
          :disabled="loading"
          @click="handleRegister"
        >
          Register
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
}

.login__card {
  width: 320px;
  padding: var(--space-6);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.login__title {
  font-size: var(--font-size-title);
  text-align: center;
}

.login__subtitle {
  text-align: center;
  color: var(--color-text-secondary);
}

.login__input {
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
}

.login__buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.login__error {
  color: var(--color-error);
  font-size: var(--font-size-small);
  text-align: center;
}
</style>