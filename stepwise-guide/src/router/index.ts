import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/',
    redirect: '/record',
  },
  {
    path: '/record',
    name: 'Record',
    component: () => import('@/views/RecordView.vue'),
    meta: { title: '运动记录', tipKey: 'record' },
  },
  {
    path: '/assess',
    name: 'Assess',
    component: () => import('@/views/AssessView.vue'),
    meta: { title: '睡眠沙盒', tipKey: 'assess' },
  },
  {
    path: '/basic-info',
    name: 'BasicInfo',
    component: () => import('@/views/BasicInfoView.vue'),
    meta: { title: '个人基础信息', tipKey: 'basicInfo' },
  },
  {
    path: '/plan',
    name: 'Plan',
    component: () => import('@/views/PlanView.vue'),
    meta: { title: '方案规划', tipKey: 'plan' },
  },
  {
    path: '/learn',
    name: 'Learn',
    component: () => import('@/views/LearnView.vue'),
    meta: { title: '运动技能', tipKey: 'learn' },
  },
  {
    path: '/timer',
    name: 'Timer',
    component: () => import('@/views/TimerView.vue'),
    meta: { title: '计时打卡', tipKey: 'timer', requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (!userStore.hasCheckedAuth) {
    await userStore.fetchUser()
  }

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
    return
  }

  next()
})

export default router
