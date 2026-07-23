import { computed, type ComputedRef } from 'vue'
import type { BasicInfo, RecordItem } from '@/types'
import { hasCompleteBasicInfo } from '@/utils/calorieEstimate'

type AdviceTone = 'empty' | 'low' | 'steady' | 'improve' | 'good' | 'rest' | 'info-needed'

interface UserGoals {
  steps: number
  duration: number
  calories: number
}

export interface WeekAdviceAction {
  label: string
  to?: string
}

export interface WeekAdvice {
  tone: AdviceTone
  title: string
  message: string
  actions: WeekAdviceAction[]
}

interface UseWeekAdviceOptions {
  weekRecords: ComputedRef<RecordItem[]>
  goals: ComputedRef<UserGoals>
  basicInfo: ComputedRef<BasicInfo>
  currentLang: ComputedRef<'zh' | 'en'>
}

function createAdvice(
  lang: 'zh' | 'en',
  tone: AdviceTone,
  titleZh: string,
  titleEn: string,
  messageZh: string,
  messageEn: string,
  actionsZh: string[],
  actionsEn: string[],
  to?: string,
): WeekAdvice {
  return {
    tone,
    title: lang === 'en' ? titleEn : titleZh,
    message: lang === 'en' ? messageEn : messageZh,
    actions: (lang === 'en' ? actionsEn : actionsZh).map(label => ({ label, to })),
  }
}

function isStrictlyRising(records: RecordItem[]) {
  if (records.length < 3) return false
  return records[0].steps > records[1].steps && records[1].steps > records[2].steps
}

function isStrictlyFalling(records: RecordItem[]) {
  if (records.length < 3) return false
  return records[0].steps < records[1].steps && records[1].steps < records[2].steps
}

export function useWeekAdvice(options: UseWeekAdviceOptions) {
  return computed<WeekAdvice>(() => {
    const lang = options.currentLang.value
    const weekRecords = options.weekRecords.value
    const goals = options.goals.value
    const basicInfo = options.basicInfo.value
    const activeDays = weekRecords.length
    const totalSteps = weekRecords.reduce((sum, record) => sum + record.steps, 0)
    const totalDuration = weekRecords.reduce((sum, record) => sum + (record.duration ?? 0), 0)
    const averageStepsPerActiveDay = activeDays > 0 ? totalSteps / activeDays : 0
    const averageDurationPerActiveDay = activeDays > 0 ? totalDuration / activeDays : 0
    const stepsCompletion = goals.steps > 0 ? totalSteps / (goals.steps * 7) : 0
    const durationCompletion = goals.duration > 0 ? totalDuration / (goals.duration * 7) : 0
    const latestThreeRecords = weekRecords.slice(0, 3)
    const missingBasicInfo = activeDays > 0 && !hasCompleteBasicInfo(basicInfo)

    if (activeDays === 0) {
      return createAdvice(
        lang,
        'empty',
        '先开始记录',
        'Start This Week',
        '本周还没有记录，先完成一次轻量活动就够了。',
        'No record yet this week. Start with one light session.',
        ['10 min', '1000 步'],
        ['10 min', '1000 steps'],
      )
    }

    if (activeDays === 1) {
      return createAdvice(
        lang,
        'steady',
        '先保持连续',
        'Keep It Going',
        '本周已经有一次记录，明天再补一次就能建立节奏。',
        'You already logged once this week. Add one more tomorrow to build momentum.',
        ['再记录 1 天', '20 min'],
        ['1 more day', '20 min'],
      )
    }

    if (stepsCompletion >= 1.5 || durationCompletion >= 1.5) {
      return createAdvice(
        lang,
        'rest',
        '注意恢复',
        'Add Recovery',
        '本周运动量偏高，明天安排轻量活动会更稳。',
        'This week is already heavy. A lighter day tomorrow will help you recover.',
        ['轻松走', '少量拉伸'],
        ['Easy walk', 'Light stretch'],
      )
    }

    if (missingBasicInfo) {
      return createAdvice(
        lang,
        'info-needed',
        '完善资料',
        'Fill Basic Info',
        '补全基础信息后，热量估算会更准确。',
        'Fill in your basic info to improve calorie estimates.',
        ['去填写', '先看步数'],
        ['Fill in', 'Check steps'],
        '/basic-info',
      )
    }

    if (activeDays <= 2 && averageStepsPerActiveDay >= goals.steps * 0.8) {
      return createAdvice(
        lang,
        'improve',
        '增加频率',
        'Add Frequency',
        '单次表现不错，本周重点是多记录几天。',
        'Your single-session performance is solid. Focus on logging more days this week.',
        ['再加 2 天', '保持步数'],
        ['2 more days', 'Keep steps'],
      )
    }

    if (isStrictlyFalling(latestThreeRecords)) {
      return createAdvice(
        lang,
        'low',
        '趋势放缓',
        'Trend Is Slowing',
        '最近步数在下降，先回到上一次的水平即可。',
        'Your recent steps are trending down. First get back to your previous level.',
        ['回到上次', '+10 min'],
        ['Back to last', '+10 min'],
      )
    }

    if (isStrictlyRising(latestThreeRecords) && stepsCompletion < 1.5) {
      return createAdvice(
        lang,
        'good',
        '趋势不错',
        'Trend Looks Good',
        '最近几次在变好，保持这个节奏就行。',
        'Your last few sessions are improving. Keep this pace steady.',
        ['继续保持', '别加太快'],
        ['Keep going', 'Do not rush'],
      )
    }

    if (stepsCompletion >= 1 && durationCompletion >= 1) {
      return createAdvice(
        lang,
        'good',
        '保持节奏',
        'Keep the Rhythm',
        '本周步数和时长都不错，继续保持即可。',
        'Your steps and duration both look good this week. Keep the same rhythm.',
        ['维持目标', '轻量恢复'],
        ['Hold target', 'Light recovery'],
      )
    }

    if (stepsCompletion >= 1 && durationCompletion < 0.7) {
      return createAdvice(
        lang,
        'steady',
        '步数不错',
        'Steps Are Solid',
        '步数已经达标，后面可以补一点稳定活动时长。',
        'Your steps already hit target. Add a bit more steady duration next.',
        ['拉长 10 min', '保持节奏'],
        ['+10 min', 'Keep pace'],
      )
    }

    if (durationCompletion >= 0.8 && stepsCompletion < 0.7) {
      return createAdvice(
        lang,
        'improve',
        '提升步频',
        'Lift Step Pace',
        '活动时间够了，可以稍微提高走动密度。',
        'You already spend enough time moving. Slightly increase your walking density.',
        ['快走 10 min', '+1500 步'],
        ['Brisk 10 min', '+1500 steps'],
      )
    }

    if (stepsCompletion >= 0.7 && stepsCompletion < 1) {
      return createAdvice(
        lang,
        'improve',
        '接近目标',
        'Close to Goal',
        '本周已经接近目标，再补一点就够了。',
        'You are already close to your weekly goal. A small top-up is enough.',
        ['+1000 步', '保持 30 min'],
        ['+1000 steps', 'Keep 30 min'],
      )
    }

    if (activeDays >= 2 && averageStepsPerActiveDay < goals.steps * 0.5) {
      return createAdvice(
        lang,
        'low',
        '步数偏少',
        'Steps Are Low',
        '先把每天步数提高一点，不必一次加太多。',
        'Raise your daily steps a bit first. No need for a big jump at once.',
        ['+1000 步', '饭后散步'],
        ['+1000 steps', 'Walk after meals'],
      )
    }

    if (activeDays >= 2 && averageDurationPerActiveDay < goals.duration * 0.5) {
      return createAdvice(
        lang,
        'steady',
        '时长偏短',
        'Duration Is Short',
        '步数已有基础，可以把活动时间再拉长一点。',
        'Your step base is there. Try stretching activity time a bit longer.',
        ['+10 min', '慢走即可'],
        ['+10 min', 'Easy walk'],
      )
    }

    return createAdvice(
      lang,
      'steady',
      '稳定推进',
      'Steady Progress',
      '本周状态平稳，继续保持规律记录。',
      'This week looks steady. Keep logging consistently.',
      ['保持记录', '适度增加'],
      ['Keep logging', 'Add a little'],
    )
  })
}
