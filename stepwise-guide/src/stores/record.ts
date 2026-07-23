import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RecordItem } from '@/types'
import { useAssessmentStore } from '@/stores/assessment'
import { getCalorieEstimateState } from '@/utils/calorieEstimate'

interface TodayRecord {
  steps: number
  duration: number
  calories: number
  exercise: string
}

interface SaveRecordInput {
  steps: number
  duration: number
  calories?: number
  exercise?: string
}

export interface DisplayWeekDay {
  dateKey: string
  weekday: string
  record?: RecordItem
  isToday: boolean
}

interface UserGoals {
  steps: number
  duration: number
  calories: number
}

const RECORDS_STORAGE_KEY = 'stepwise-records'
const GOALS_STORAGE_KEY = 'stepwise-record-goals'
const DEFAULT_GOALS: UserGoals = {
  steps: 10000,
  duration: 60,
  calories: 500,
}
const GOAL_LIMITS = {
  steps: { min: 1000, max: 30000 },
  duration: { min: 5, max: 240 },
  calories: { min: 50, max: 2000 },
}

// Create a clean initial state for today's record.
// This prevents new users from seeing mock data by default.
function createEmptyToday(): TodayRecord {
  return {
    steps: 0,
    duration: 0,
    calories: 0,
    exercise: '--',
  }
}

function clampGoal(type: keyof UserGoals, value: number) {
  const limits = GOAL_LIMITS[type]
  const numericValue = Number(value)

  if (!Number.isFinite(numericValue)) {
    return DEFAULT_GOALS[type]
  }

  return Math.min(Math.max(Math.round(numericValue), limits.min), limits.max)
}

function loadGoals() {
  try {
    const raw = localStorage.getItem(GOALS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}

    return {
      steps: clampGoal('steps', parsed.steps ?? DEFAULT_GOALS.steps),
      duration: clampGoal('duration', parsed.duration ?? DEFAULT_GOALS.duration),
      calories: clampGoal('calories', parsed.calories ?? DEFAULT_GOALS.calories),
    }
  } catch {
    return { ...DEFAULT_GOALS }
  }
}

function getTodayDateString() {
  const date = new Date()
  return formatDateString(date)
}

function formatDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getWeekday(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
  })
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00`)
  date.setDate(date.getDate() + days)

  return formatDateString(date)
}

function toRecordItem(item: any): RecordItem {
  return {
    date: item.date,
    weekday: item.weekday || getWeekday(item.date),
    steps: Number(item.steps) || 0,
    exercise: item.exercise || '--',
    duration: Number(item.duration) || 0,
    calories: Number(item.calories) || 0,
  }
}

function loadStoredRecords() {
  try {
    const raw = localStorage.getItem(RECORDS_STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return mergeRecordsByDate(parsed.map(toRecordItem).filter(item => typeof item.date === 'string' && item.date))
  } catch {
    return []
  }
}

function persistRecords(records: RecordItem[]) {
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records))
}

function sortRecordsByDateDesc(items: RecordItem[]) {
  return [...items].sort((a, b) => b.date.localeCompare(a.date))
}

function mergeRecordsByDate(items: RecordItem[]) {
  const recordMap = new Map<string, RecordItem>()

  for (const item of items) {
    if (!recordMap.has(item.date)) {
      recordMap.set(item.date, item)
    }
  }

  return sortRecordsByDateDesc([...recordMap.values()])
}

function getLatestRecordDate(items: RecordItem[]) {
  if (items.length === 0) return null

  return items.reduce((latest, item) => {
    return item.date > latest ? item.date : latest
  }, items[0].date)
}

function getWeekStart(dateString: string) {
  const weekStart = new Date(`${dateString}T00:00:00`)
  const day = weekStart.getDay()
  const offset = day === 0 ? -6 : 1 - day
  weekStart.setDate(weekStart.getDate() + offset)
  weekStart.setHours(0, 0, 0, 0)

  return weekStart
}

function getNextRecordDate(items: RecordItem[]) {
  const latestDate = getLatestRecordDate(items)

  if (!latestDate) {
    return getTodayDateString()
  }

  return addDays(latestDate, 1)
}

// Store for exercise records and weekly summary data.
export const useRecordStore = defineStore('record', () => {
  const assessmentStore = useAssessmentStore()

  // Historical records start empty and will be loaded from the backend.
  const records = ref<RecordItem[]>(loadStoredRecords())

  // Today's record is a temporary editable state.
  const today = ref<TodayRecord>(createEmptyToday())
  const goals = ref<UserGoals>(loadGoals())
  const todayCalorieState = computed(() => {
    return getCalorieEstimateState(
      assessmentStore.basicInfo,
      today.value.steps,
      today.value.duration,
    )
  })
  const todayEstimatedCalories = computed(() => {
    return todayCalorieState.value.status === 'estimated' || todayCalorieState.value.status === 'no_activity'
      ? todayCalorieState.value.calories
      : null
  })
  const displayRecord = computed<RecordItem | null>(() => records.value[0] ?? null)
  const overviewCalorieState = computed(() => {
    return getCalorieEstimateState(
      assessmentStore.basicInfo,
      displayRecord.value?.steps ?? 0,
      displayRecord.value?.duration ?? 0,
    )
  })
  const overviewEstimatedCalories = computed(() => {
    return overviewCalorieState.value.status === 'estimated' || overviewCalorieState.value.status === 'no_activity'
      ? overviewCalorieState.value.calories
      : null
  })

  // Only the latest seven records are used for weekly summaries.
  const weeklyRecords = computed(() => records.value.slice(0, 7))

  // Calculate the average steps for the latest seven records.
  const weeklyAvgSteps = computed(() => {
    if (weeklyRecords.value.length === 0) return 0

    const total = weeklyRecords.value.reduce((sum, record) => {
      return sum + record.steps
    }, 0)

    return Math.round(total / weeklyRecords.value.length)
  })

  // Count how many days reached the step goal.
  const weeklyGoalDays = computed(() => {
    return weeklyRecords.value.filter(record => record.steps >= 5000).length
  })

  // Count how many days contain an actual exercise type.
  const weeklyExerciseCount = computed(() => {
    return weeklyRecords.value.filter(record => record.exercise !== '--').length
  })

  // Calculate total calories for the latest seven records.
  const weeklyTotalCalories = computed(() => {
    return weeklyRecords.value.reduce((sum, record) => {
      const calorieState = getCalorieEstimateState(
        assessmentStore.basicInfo,
        record.steps,
        record.duration ?? 0,
      )

      if (calorieState.status === 'estimated' || calorieState.status === 'no_activity') {
        return sum + calorieState.calories
      }

      return sum
    }, 0)
  })

  const latestRecordDate = computed(() => getLatestRecordDate(records.value))
  const displayWeekBaseDate = computed(() => latestRecordDate.value ?? getTodayDateString())
  const displayWeekStart = computed(() => formatDateString(getWeekStart(displayWeekBaseDate.value)))
  const displayWeekEnd = computed(() => addDays(displayWeekStart.value, 6))
  const displayWeekDays = computed<DisplayWeekDay[]>(() => {
    const recordMap = new Map(records.value.map(record => [record.date, record]))
    const today = getTodayDateString()

    return Array.from({ length: 7 }, (_, index) => {
      const dateKey = addDays(displayWeekStart.value, index)

      return {
        dateKey,
        weekday: getWeekday(dateKey),
        record: recordMap.get(dateKey),
        isToday: dateKey === today,
      }
    })
  })
  const displayWeekRecords = computed(() => {
    return displayWeekDays.value.map(day => day.record).filter(Boolean) as RecordItem[]
  })

  function syncTodayFromRecords() {
    const latestRecord = records.value[0]

    if (latestRecord) {
      today.value.steps = latestRecord.steps
      today.value.duration = latestRecord.duration ?? 0
      today.value.calories = latestRecord.calories
      today.value.exercise = latestRecord.exercise
      return
    }

    today.value = createEmptyToday()
  }

  // Load records for the current logged-in user from the backend.
  async function fetchRecords() {
    const storedRecords = loadStoredRecords()

    if (storedRecords.length > 0) {
      records.value = storedRecords
      syncTodayFromRecords()
    }

    try {
      const res = await fetch('http://localhost:3000/api/records', {
        credentials: 'include',
      })

      if (!res.ok) {
        syncTodayFromRecords()
        return
      }

      const data = await res.json()
      records.value = mergeRecordsByDate([
        ...data.map(toRecordItem),
        ...storedRecords,
      ])
      persistRecords(records.value)
      syncTodayFromRecords()
    } catch {
      syncTodayFromRecords()
    }
  }

  // Add a record to local state and keep the timeline ordered.
  function addRecord(record: RecordItem) {
    records.value = records.value.filter(item => item.date !== record.date && item.date <= record.date)
    records.value.unshift(record)
    records.value = sortRecordsByDateDesc(records.value)
    persistRecords(records.value)
    syncTodayFromRecords()
  }

  // Save today's editable data into the backend.
  async function saveTodayRecord(input?: SaveRecordInput) {
    const nextRecordDate = getNextRecordDate(records.value)
    const steps = input?.steps ?? today.value.steps
    const duration = input?.duration ?? today.value.duration
    const exercise = input?.exercise ?? today.value.exercise
    const calorieState = getCalorieEstimateState(
      assessmentStore.basicInfo,
      steps,
      duration,
    )
    const calories = input?.calories ?? (
      calorieState.status === 'estimated' || calorieState.status === 'no_activity'
        ? calorieState.calories
        : 0
    )

    const record: RecordItem = {
      date: nextRecordDate,
      weekday: getWeekday(nextRecordDate),
      steps,
      exercise,
      duration,
      calories,
    }

    const res = await fetch('http://localhost:3000/api/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(record),
    })

    if (!res.ok) {
      throw new Error('Failed to save record')
    }

    addRecord(record)
  }

  // Update today's temporary record from a form.
  function updateToday(data: {
    steps?: number
    duration?: number
    calories?: number
    exercise?: string
  }) {
    if (typeof data.steps === 'number') {
      today.value.steps = data.steps
    }

    if (typeof data.duration === 'number') {
      today.value.duration = data.duration
    }

    if (typeof data.calories === 'number') {
      today.value.calories = data.calories
    }

    if (typeof data.exercise === 'string') {
      today.value.exercise = data.exercise
    }
  }

  function updateGoal(type: keyof UserGoals, value: number) {
    goals.value[type] = clampGoal(type, value)
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals.value))
  }

  // Clear all local record data.
  // This is useful when switching users or logging out.
  function resetRecords() {
    records.value = []
    today.value = createEmptyToday()
    persistRecords(records.value)
  }

  return {
    records,
    today,
    goals,
    todayCalorieState,
    todayEstimatedCalories,
    displayRecord,
    overviewCalorieState,
    overviewEstimatedCalories,
    weeklyAvgSteps,
    weeklyGoalDays,
    weeklyExerciseCount,
    weeklyTotalCalories,
    latestRecordDate,
    displayWeekBaseDate,
    displayWeekStart,
    displayWeekEnd,
    displayWeekDays,
    displayWeekRecords,
    fetchRecords,
    addRecord,
    saveTodayRecord,
    updateToday,
    updateGoal,
    resetRecords,
  }
})
