export interface RecordItem {
  date: string
  weekday: string
  steps: number
  exercise: string
  duration: number | null
  calories: number
}

export interface BasicInfo {
  height: number
  weight: number
  age: number
  gender: 'male' | 'female' | ''
}

export interface ExerciseHabit {
  frequency: 'never' | 'occasionally' | 'weekly1_2' | 'weekly3plus'
  types: string[]
}

export interface Lifestyle {
  sittingHours: number
  sleepQuality: 'good' | 'fair' | 'poor'
}

export interface AssessmentResult {
  bmi: number
  bmiCategory: string
  activityLevel: string
  activityDescription: string
  suggestions: string[]
}

export interface PlanItem {
  id: string
  icon: string
  title: string
  duration: string
  level: string
  dailyTime: string
  description: string
  weeks: WeekPlan[]
}

export interface WeekPlan {
  weekNumber: number
  summary: string
  dailyPlan: string
}

export interface ReminderConfig {
  exerciseReminder: boolean
  exerciseTime: string
  exerciseDays: number[]
  sittingReminder: boolean
  sittingInterval: number
}

export interface SkillItem {
  id: string
  title: string
  category: string
  totalSteps: number
  duration: string
  description: string
  steps: SkillStep[]
}

export interface SkillStep {
  order: number
  title: string
  points: string[]
  note: string
  illustration: string
}

export interface StepConfig {
  label: string
  component: string
}

export interface DailyTip {
  page: string
  message: string
  icon: string
}

export type SleepEventType =
  | 'coffee'
  | 'nap'
  | 'melatonin'
  | 'meditation'
  | 'screen'
  | 'shift'

export interface SleepSandboxEvent {
  id: string
  type: SleepEventType
  startHour: number
  endHour?: number
  durationMinutes?: number
  intensity?: 'low' | 'medium' | 'high'
  dose?: 'low' | 'medium' | 'high'
}

export interface SleepPredictionResult {
  baselineSleepTime: string
  predictedSleepTime: string
  sleepDelayMinutes: number
  riskLevel: 'low' | 'medium' | 'high'
  summary: string
  suggestion: string
}

export interface SleepMemoryState {
  enabled: boolean
  historicalEvents: SleepSandboxEvent[][]
  insights: string[]
}

export type Language = 'zh' | 'en'
