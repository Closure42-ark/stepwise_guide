import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PlanItem, ReminderConfig } from '@/types'

// 运动方案 Store - 管理方案选择和提醒配置
export const usePlanStore = defineStore('plan', () => {
  // 当前用户采用的方案 ID（预设方案或自定义方案）
  const adoptedPlanId = ref<string | null>(null)
  // 自定义方案详情（通过引导向导生成）
  const customPlan = ref<PlanItem | null>(null)
  // 提醒配置（默认：周二/四 18:00 运动提醒，每 60 分钟久坐提醒）
  const reminder = ref<ReminderConfig>({
    exerciseReminder: false,
    exerciseTime: '18:00',
    exerciseDays: [2, 4],
    sittingReminder: false,
    sittingInterval: 60,
  })

  // 采用预设方案
  function adoptPlan(planId: string) {
    adoptedPlanId.value = planId
  }

  // 设置自定义方案（同时更新 adoptedPlanId）
  function setCustomPlan(plan: PlanItem) {
    customPlan.value = plan
    adoptedPlanId.value = plan.id
  }

  // 局部更新提醒配置（使用 Partial 实现只更新部分字段）
  function updateReminder(config: Partial<ReminderConfig>) {
    reminder.value = { ...reminder.value, ...config }
  }

  return {
    adoptedPlanId,
    customPlan,
    reminder,
    adoptPlan,
    setCustomPlan,
    updateReminder,
  }
})
