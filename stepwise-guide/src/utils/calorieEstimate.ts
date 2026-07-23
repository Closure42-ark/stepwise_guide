import type { BasicInfo } from '@/types'

export type CalorieGender = 'male' | 'female' | 'unknown'

export interface CalorieInput {
  steps: number
  durationMinutes: number
  heightCm: number
  weightKg: number
  age: number
  gender: CalorieGender
}

export interface CalorieEstimateResult {
  calories: number
  met: number
  speedKmh: number
  distanceKm: number
  isEstimate: true
}

export type CalorieEstimateState =
  | ({ status: 'estimated' } & CalorieEstimateResult)
  | { status: 'missing_basic_info' }
  | { status: 'no_activity'; calories: 0 }

const MAX_REASONABLE_SPEED_KMH = 12

export function hasCompleteBasicInfo(basicInfo: BasicInfo | null | undefined) {
  if (!basicInfo) {
    return false
  }

  return (
    basicInfo.height > 0 &&
    basicInfo.weight > 0 &&
    basicInfo.age > 0 &&
    (basicInfo.gender === 'male' || basicInfo.gender === 'female')
  )
}

export function normalizeGender(gender: BasicInfo['gender']): CalorieGender {
  return gender === 'male' || gender === 'female' ? gender : 'unknown'
}

export function estimateStrideLengthMeters(heightCm: number, gender: CalorieGender) {
  const factor = gender === 'male' ? 0.415 : gender === 'female' ? 0.413 : 0.414
  return (heightCm * factor) / 100
}

export function estimateWalkingMet(speedKmh: number) {
  if (speedKmh <= 0) return 1
  if (speedKmh < 3) return 2
  if (speedKmh < 4) return 2.8
  if (speedKmh < 5.5) return 3.5
  if (speedKmh < 6.5) return 4.3
  return 5
}

export function estimateWalkingCalories(input: CalorieInput): CalorieEstimateResult {
  const steps = Math.max(0, input.steps)
  const durationMinutes = Math.max(0, input.durationMinutes)
  const strideLengthMeters = estimateStrideLengthMeters(input.heightCm, input.gender)
  const distanceKm = Number(((steps * strideLengthMeters) / 1000).toFixed(2))
  const rawSpeedKmh = durationMinutes > 0 ? distanceKm / (durationMinutes / 60) : 0
  const speedKmh = Number(Math.min(Math.max(rawSpeedKmh, 0), MAX_REASONABLE_SPEED_KMH).toFixed(1))
  const met = estimateWalkingMet(speedKmh)
  const calories = Math.round((met * 3.5 * input.weightKg / 200) * durationMinutes)

  return {
    calories: Math.max(0, calories),
    met,
    speedKmh,
    distanceKm,
    isEstimate: true,
  }
}

export function getCalorieEstimateState(
  basicInfo: BasicInfo | null | undefined,
  steps: number,
  durationMinutes: number,
): CalorieEstimateState {
  if (steps <= 0 || durationMinutes <= 0) {
    return {
      status: 'no_activity',
      calories: 0,
    }
  }

  if (!hasCompleteBasicInfo(basicInfo)) {
    return { status: 'missing_basic_info' }
  }

  const completeBasicInfo = basicInfo!

  return {
    status: 'estimated',
    ...estimateWalkingCalories({
      steps,
      durationMinutes,
      heightCm: completeBasicInfo.height,
      weightKg: completeBasicInfo.weight,
      age: completeBasicInfo.age,
      gender: normalizeGender(completeBasicInfo.gender),
    }),
  }
}
