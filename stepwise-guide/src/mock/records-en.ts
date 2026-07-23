import type { RecordItem } from '@/types'

export const mockRecordsEn: RecordItem[] = [
  { date: '4/20', weekday: 'Sun', steps: 5200, exercise: 'Brisk Walk', duration: 35, calories: 180 },
  { date: '4/19', weekday: 'Sat', steps: 8100, exercise: 'Jogging', duration: 45, calories: 320 },
  { date: '4/18', weekday: 'Fri', steps: 3400, exercise: 'Brisk Walk', duration: null, calories: 95 },
  { date: '4/17', weekday: 'Thu', steps: 4800, exercise: 'Brisk Walk', duration: 30, calories: 165 },
  { date: '4/16', weekday: 'Wed', steps: 6200, exercise: 'Cycling', duration: 40, calories: 240 },
  { date: '4/15', weekday: 'Tue', steps: 3900, exercise: 'Stretching', duration: 15, calories: 45 },
  { date: '4/14', weekday: 'Mon', steps: 4500, exercise: 'Brisk Walk', duration: 25, calories: 155 },
  { date: '4/13', weekday: 'Sun', steps: 7300, exercise: 'Jogging', duration: 40, calories: 280 },
  { date: '4/12', weekday: 'Sat', steps: 5600, exercise: 'Brisk Walk', duration: 35, calories: 195 },
  { date: '4/11', weekday: 'Fri', steps: 2800, exercise: 'Brisk Walk', duration: null, calories: 78 },
  { date: '4/10', weekday: 'Thu', steps: 4100, exercise: 'Stretching', duration: 20, calories: 60 },
  { date: '4/9', weekday: 'Wed', steps: 5500, exercise: 'Brisk Walk', duration: 30, calories: 190 },
  { date: '4/8', weekday: 'Tue', steps: 3200, exercise: 'Brisk Walk', duration: null, calories: 90 },
  { date: '4/7', weekday: 'Mon', steps: 4700, exercise: 'Cycling', duration: 35, calories: 210 },
]

export const todayDataEn = {
  steps: 3200,
  stepsGoal: 5000,
  duration: 25,
  durationGoal: 30,
  calories: 120,
  caloriesGoal: 200,
}
