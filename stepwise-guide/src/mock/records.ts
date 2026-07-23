import type { RecordItem } from '@/types'

export const mockRecords: RecordItem[] = [
  { date: '4/20', weekday: '周日', steps: 5200, exercise: '快走', duration: 35, calories: 180 },
  { date: '4/19', weekday: '周六', steps: 8100, exercise: '慢跑', duration: 45, calories: 320 },
  { date: '4/18', weekday: '周五', steps: 3400, exercise: '快走', duration: null, calories: 95 },
  { date: '4/17', weekday: '周四', steps: 4800, exercise: '快走', duration: 30, calories: 165 },
  { date: '4/16', weekday: '周三', steps: 6200, exercise: '骑行', duration: 40, calories: 240 },
  { date: '4/15', weekday: '周二', steps: 3900, exercise: '拉伸', duration: 15, calories: 45 },
  { date: '4/14', weekday: '周一', steps: 4500, exercise: '快走', duration: 25, calories: 155 },
  { date: '4/13', weekday: '周日', steps: 7300, exercise: '慢跑', duration: 40, calories: 280 },
  { date: '4/12', weekday: '周六', steps: 5600, exercise: '快走', duration: 35, calories: 195 },
  { date: '4/11', weekday: '周五', steps: 2800, exercise: '快走', duration: null, calories: 78 },
  { date: '4/10', weekday: '周四', steps: 4100, exercise: '拉伸', duration: 20, calories: 60 },
  { date: '4/9', weekday: '周三', steps: 5500, exercise: '快走', duration: 30, calories: 190 },
  { date: '4/8', weekday: '周二', steps: 3200, exercise: '快走', duration: null, calories: 90 },
  { date: '4/7', weekday: '周一', steps: 4700, exercise: '骑行', duration: 35, calories: 210 },
]

export const todayData = {
  steps: 3200,
  stepsGoal: 5000,
  duration: 25,
  durationGoal: 30,
  calories: 120,
  caloriesGoal: 200,
}
