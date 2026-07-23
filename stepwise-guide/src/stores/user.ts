import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const user = ref<null | {
    id: string
    username: string
  }>(null)

  const isLoggedIn = ref(false)
  const hasCheckedAuth = ref(false)
  const displayName = ref('')
  const avatar = ref('U')

  function loadProfileDefaults() {
    displayName.value = user.value?.username || ''
    avatar.value = 'U'
  }

  function updateProfile(data: { displayName?: string; avatar?: string }) {
    if (typeof data.displayName === 'string') {
      displayName.value = data.displayName
    }

    if (typeof data.avatar === 'string') {
      avatar.value = data.avatar
    }
  }

  async function login(username: string, password: string) {
    try {
      const res = await axios.post(
        'http://localhost:3000/api/auth/login',
        { username, password },
        { withCredentials: true }
      )

      user.value = res.data.user
      isLoggedIn.value = true
      loadProfileDefaults()

      return res.data
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Login failed')
    }
  }

  async function register(username: string, password: string) {
    try {
      const res = await axios.post(
        'http://localhost:3000/api/auth/register',
        { username, password }
      )

      return res.data
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Register failed')
    }
  }

  async function fetchUser() {
    try {
      const res = await axios.get(
        'http://localhost:3000/api/auth/me',
        { withCredentials: true }
      )

      user.value = res.data
      isLoggedIn.value = true
      loadProfileDefaults()
    } catch {
      user.value = null
      isLoggedIn.value = false
      displayName.value = ''
      avatar.value = 'U'
    } finally {
      hasCheckedAuth.value = true
    }
  }

  async function logout() {
    await axios.post(
      'http://localhost:3000/api/auth/logout',
      {},
      { withCredentials: true }
    )

    user.value = null
    isLoggedIn.value = false
    displayName.value = ''
    avatar.value = 'U'
  }

  return {
    user,
    isLoggedIn,
    hasCheckedAuth,
    displayName,
    avatar,
    login,
    register,
    fetchUser,
    logout,
    updateProfile,
    loadProfileDefaults,
  }
})
