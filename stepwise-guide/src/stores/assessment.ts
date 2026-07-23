import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BasicInfo, ExerciseHabit, Lifestyle, AssessmentResult } from '@/types'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { hasCompleteBasicInfo } from '@/utils/calorieEstimate'

// Store for the health assessment flow and saved assessment result.
export const useAssessmentStore = defineStore('assessment', () => {
  // Basic user information.
  const basicInfo = useLocalStorage<BasicInfo>('stepwise-basic-info', {
    height: 0,
    weight: 0,
    age: 0,
    gender: '',
  })

  // Exercise habit information.
  const exerciseHabit = ref<ExerciseHabit>({
    frequency: 'never',
    types: [],
  })

  // Lifestyle information.
  const lifestyle = ref<Lifestyle>({
    sittingHours: 8,
    sleepQuality: 'fair',
  })

  // Current step index, starting from 0.
  const currentStep = ref(0)

  // Whether the assessment has been completed.
  const isCompleted = ref(false)

  // Final assessment result.
  const result = ref<AssessmentResult | null>(null)

  // Whether the current result has been saved to the backend.
  const isSaved = ref(false)

  const hasValidBasicInfo = computed(() => {
    return hasCompleteBasicInfo(basicInfo.value)
  })

  // Calculate BMI from height and weight.
  const bmi = computed(() => {
    const h = basicInfo.value.height / 100
    if (h <= 0) return 0
    return Number((basicInfo.value.weight / (h * h)).toFixed(1))
  })

  // Classify BMI using a simple Chinese BMI standard.
  const bmiCategory = computed(() => {
    const v = bmi.value
    if (v < 18.5) return '偏瘦'
    if (v < 24) return '正常范围'
    if (v < 28) return '偏重'
    return '肥胖'
  })

  // Generate the final assessment result from user input.
  function calculateResult() {
    const activityMap: Record<string, { level: string; desc: string }> = {
      never: { level: '久坐型', desc: '当前活动量偏低，建议逐步增加日常活动' },
      occasionally: { level: '轻度活动', desc: '已有一定活动基础，可以尝试更有规律的运动' },
      weekly1_2: { level: '中度活动', desc: '运动习惯正在养成，建议保持并适当增加频率' },
      weekly3plus: { level: '活跃型', desc: '运动习惯良好，继续保持并注意运动多样性' },
    }

    const activity = activityMap[exerciseHabit.value.frequency] || activityMap.never

    const suggestions: string[] = []

    if (bmi.value >= 24) {
      suggestions.push('建议每周增加2-3次30分钟中等强度有氧运动')
    }

    if (exerciseHabit.value.frequency === 'never' || exerciseHabit.value.frequency === 'occasionally') {
      suggestions.push('建议每周增加2次30分钟快走')
    }

    if (lifestyle.value.sittingHours >= 8) {
      suggestions.push('每坐1小时起身活动3-5分钟')
    }

    if (lifestyle.value.sleepQuality === 'poor') {
      suggestions.push('睡前30分钟避免使用电子设备，尝试5分钟呼吸放松')
    }

    suggestions.push('每天饮水1500-2000毫升，运动前后注意补水')
    suggestions.push('运动前做5分钟热身，运动后做5分钟拉伸')

    result.value = {
      bmi: bmi.value,
      bmiCategory: bmiCategory.value,
      activityLevel: activity.level,
      activityDescription: activity.desc,
      suggestions,
    }

    isCompleted.value = true
    isSaved.value = false

    return result.value
  }

  // Load the latest saved assessment for the current logged-in user.
  async function fetchLatestAssessment() {
    const res = await fetch('http://localhost:3000/api/assessments/latest', {
      credentials: 'include',
    })

    if (!res.ok) {
      return
    }

    const data = await res.json()

    if (!data) {
      return
    }

    if (data.basicInfo) {
      basicInfo.value = data.basicInfo
    }

    if (data.exerciseHabit) {
      exerciseHabit.value = data.exerciseHabit
    }

    if (data.lifestyle) {
      lifestyle.value = data.lifestyle
    }

    if (data.result) {
      result.value = data.result
      isCompleted.value = true
      isSaved.value = true
    }
  }

  // Save the current assessment result to the backend.
  async function saveAssessment() {
    if (!result.value) {
      throw new Error('No assessment result to save')
    }

    const res = await fetch('http://localhost:3000/api/assessments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        basicInfo: basicInfo.value,
        exerciseHabit: exerciseHabit.value,
        lifestyle: lifestyle.value,
        result: result.value,
      }),
    })

    if (!res.ok) {
      throw new Error('Failed to save assessment')
    }

    isSaved.value = true

    return await res.json()
  }

  async function saveBasicInfo() {
    const res = await fetch('http://localhost:3000/api/assessments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        basicInfo: basicInfo.value,
        exerciseHabit: exerciseHabit.value,
        lifestyle: lifestyle.value,
        result: result.value,
      }),
    })

    if (!res.ok) {
      throw new Error('Failed to save basic info')
    }

    isSaved.value = true

    return await res.json()
  }

  // Delete the latest saved assessment and reset local state.
  async function discardAssessment() {
    await fetch('http://localhost:3000/api/assessments/latest', {
      method: 'DELETE',
      credentials: 'include',
    })

    reset()
  }

  // Reset the assessment flow.
  function reset(preserveBasicInfo = true) {
    if (!preserveBasicInfo) {
      basicInfo.value = {
        height: 0,
        weight: 0,
        age: 0,
        gender: '',
      }
    }

    exerciseHabit.value = {
      frequency: 'never',
      types: [],
    }

    lifestyle.value = {
      sittingHours: 8,
      sleepQuality: 'fair',
    }

    currentStep.value = 0
    isCompleted.value = false
    result.value = null
    isSaved.value = false
  }

  return {
    basicInfo,
    hasValidBasicInfo,
    exerciseHabit,
    lifestyle,
    currentStep,
    isCompleted,
    result,
    isSaved,
    bmi,
    bmiCategory,
    calculateResult,
    fetchLatestAssessment,
    saveAssessment,
    saveBasicInfo,
    discardAssessment,
    reset,
  }
})
