import { computed } from 'vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import type {
  Language,
  SleepMemoryState,
  SleepPredictionResult,
  SleepSandboxEvent,
  SleepEventType,
} from '@/types'

interface SleepSandboxInsight {
  title: string
  body: string
}

interface EventEffect {
  peakShiftMinutes: number
  uncertaintyMinutes: number
}

const DEFAULT_BASELINE_SLEEP_HOUR = 23.5
const NORMAL_SLEEP_MIN = 21
const NORMAL_SLEEP_MAX = 28
const SHIFT_RECOVERY_OFFSET_HOURS = 0.75

const EVENT_DEFAULTS: Record<SleepEventType, Partial<SleepSandboxEvent>> = {
  coffee: { dose: 'medium', startHour: 15 },
  nap: { durationMinutes: 20, startHour: 14 },
  melatonin: { dose: 'low', startHour: 21 },
  meditation: { durationMinutes: 10, startHour: 21.5 },
  screen: { durationMinutes: 60, startHour: 21.5 },
  shift: { startHour: 20, endHour: 32 },
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function cloneEvents(events: SleepSandboxEvent[]) {
  return events.map(event => ({ ...event }))
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function normalizeHour(hour: number) {
  return clamp(Number(hour.toFixed(2)), 8, 36)
}

function snapHour(hour: number, step = 0.25) {
  return normalizeHour(Math.round(hour / step) * step)
}

function formatHour(hour: number, lang: Language) {
  const normalized = ((Math.round(hour * 4) / 4) % 24 + 24) % 24
  const hourPart = Math.floor(normalized)
  const minutePart = Math.round((normalized - hourPart) * 60)
  const label = `${String(hourPart).padStart(2, '0')}:${String(minutePart).padStart(2, '0')}`

  if (lang === 'en') {
    return hour >= 24 ? `Next ${label}` : label
  }

  return hour >= 24 ? `次日 ${label}` : label
}

function eventLabel(type: SleepEventType, lang: Language) {
  const labels: Record<SleepEventType, [string, string]> = {
    coffee: ['咖啡', 'Coffee'],
    nap: ['小睡', 'Nap'],
    melatonin: ['褪黑素', 'Melatonin'],
    meditation: ['冥想', 'Meditation'],
    screen: ['屏幕', 'Screen'],
    shift: ['夜班', 'Shift'],
  }

  return lang === 'en' ? labels[type][1] : labels[type][0]
}

function timeBucket(hour: number) {
  if (hour < 12) return 'morning'
  if (hour < 15) return 'earlyAfternoon'
  if (hour < 18) return 'lateAfternoon'
  if (hour < 21) return 'evening'
  return 'night'
}

function nightDistanceFromBaseline(hour: number, baselineHour: number) {
  return Math.abs(hour - baselineHour)
}

function estimateCoffeeEffect(event: SleepSandboxEvent): EventEffect {
  const dose = event.dose ?? 'medium'
  const bucket = timeBucket(event.startHour)
  const shiftMap = {
    morning: { low: 10, medium: 20, high: 40 },
    earlyAfternoon: { low: 20, medium: 45, high: 75 },
    lateAfternoon: { low: 45, medium: 90, high: 150 },
    evening: { low: 75, medium: 150, high: 240 },
    night: { low: 75, medium: 150, high: 240 },
  }
  const uncertaintyMap = { low: 8, medium: 14, high: 22 }

  return {
    peakShiftMinutes: shiftMap[bucket][dose],
    uncertaintyMinutes: uncertaintyMap[dose],
  }
}

function estimateNapEffect(event: SleepSandboxEvent, shiftEvent?: SleepSandboxEvent): EventEffect {
  const duration = event.durationMinutes ?? 20
  const bucket = timeBucket(event.startHour)
  const shiftMap = {
    morning: { 20: 5, 60: 15, 90: 30 },
    earlyAfternoon: { 20: 10, 60: 30, 90: 60 },
    lateAfternoon: { 20: 20, 60: 60, 90: 120 },
    evening: { 20: 45, 60: 120, 90: 180 },
    night: { 20: 45, 60: 120, 90: 180 },
  }
  const uncertaintyMap = { 20: 6, 60: 12, 90: 20 }

  if (shiftEvent && event.startHour < shiftEvent.startHour) {
    return {
      peakShiftMinutes: duration >= 90 ? 20 : duration >= 60 ? 10 : 5,
      uncertaintyMinutes: duration >= 90 ? -12 : -8,
    }
  }

  const key = duration >= 90 ? 90 : duration >= 60 ? 60 : 20
  return {
    peakShiftMinutes: shiftMap[bucket][key],
    uncertaintyMinutes: uncertaintyMap[key],
  }
}

function estimateScreenEffect(event: SleepSandboxEvent): EventEffect {
  const duration = event.durationMinutes ?? 60
  const bucket = timeBucket(event.startHour)
  const longKey = duration >= 120 ? 120 : duration >= 60 ? 60 : 30
  const shiftMap = {
    morning: { 30: 5, 60: 10, 120: 15 },
    earlyAfternoon: { 30: 5, 60: 10, 120: 15 },
    lateAfternoon: { 30: 15, 60: 30, 120: 60 },
    evening: { 30: 15, 60: 30, 120: 60 },
    night: { 30: 30, 60: 60, 120: 100 },
  }
  const uncertaintyMap = { 30: 8, 60: 14, 120: 20 }

  return {
    peakShiftMinutes: shiftMap[bucket][longKey],
    uncertaintyMinutes: uncertaintyMap[longKey],
  }
}

function estimateMelatoninEffect(event: SleepSandboxEvent): EventEffect {
  const dose = event.dose ?? 'low'
  const bucket = event.startHour < 20.5 ? 'early' : event.startHour <= 22.5 ? 'ideal' : 'late'
  const shiftMap = {
    early: { low: -10, medium: -20, high: -20 },
    ideal: { low: -25, medium: -45, high: -45 },
    late: { low: -10, medium: -15, high: -15 },
  }

  return {
    peakShiftMinutes: shiftMap[bucket][dose],
    uncertaintyMinutes: dose === 'medium' ? -10 : -6,
  }
}

function estimateMeditationEffect(event: SleepSandboxEvent): EventEffect {
  const duration = event.durationMinutes ?? 10
  const distance = nightDistanceFromBaseline(event.startHour, DEFAULT_BASELINE_SLEEP_HOUR)
  const nearBed = distance <= 2

  if (nearBed) {
    if (duration >= 20) return { peakShiftMinutes: -20, uncertaintyMinutes: -15 }
    if (duration >= 10) return { peakShiftMinutes: -10, uncertaintyMinutes: -10 }
    return { peakShiftMinutes: -5, uncertaintyMinutes: -6 }
  }

  if (duration >= 20) return { peakShiftMinutes: -10, uncertaintyMinutes: -8 }
  if (duration >= 10) return { peakShiftMinutes: -5, uncertaintyMinutes: -5 }
  return { peakShiftMinutes: 0, uncertaintyMinutes: -3 }
}

function estimateShiftEffect(event: SleepSandboxEvent): EventEffect {
  const shiftEnd = event.endHour ?? event.startHour + 12
  const shiftLength = shiftEnd - event.startHour

  return {
    peakShiftMinutes: shiftLength >= 10 ? 35 : 20,
    uncertaintyMinutes: 25,
  }
}

function estimateEventEffect(event: SleepSandboxEvent, shiftEvent?: SleepSandboxEvent): EventEffect {
  if (event.type === 'coffee') return estimateCoffeeEffect(event)
  if (event.type === 'nap') return estimateNapEffect(event, shiftEvent)
  if (event.type === 'screen') return estimateScreenEffect(event)
  if (event.type === 'melatonin') return estimateMelatoninEffect(event)
  if (event.type === 'meditation') return estimateMeditationEffect(event)
  return estimateShiftEffect(event)
}

function applyDiminishingReturns(events: SleepSandboxEvent[], shiftEvent?: SleepSandboxEvent) {
  const counts: Partial<Record<SleepEventType, number>> = {}

  return events.reduce(
    (accumulator, event) => {
      const count = (counts[event.type] ?? 0) + 1
      counts[event.type] = count

      const decay = count === 1 ? 1 : count === 2 ? 0.7 : 0.5
      const effect = estimateEventEffect(event, shiftEvent)
      accumulator.peakShiftMinutes += effect.peakShiftMinutes * decay
      accumulator.uncertaintyMinutes += effect.uncertaintyMinutes * decay
      return accumulator
    },
    { peakShiftMinutes: 0, uncertaintyMinutes: 0 },
  )
}

function estimatePrediction(events: SleepSandboxEvent[]) {
  const shiftEvent = events.find(event => event.type === 'shift')
  const baselineSleepHour = shiftEvent
    ? snapHour((shiftEvent.endHour ?? shiftEvent.startHour + 12) + SHIFT_RECOVERY_OFFSET_HOURS)
    : DEFAULT_BASELINE_SLEEP_HOUR
  const sortedEvents = [...events].sort((a, b) => a.startHour - b.startHour)
  const combined = applyDiminishingReturns(sortedEvents, shiftEvent)
  const rawPredictionHour = baselineSleepHour + combined.peakShiftMinutes / 60

  if (shiftEvent) {
    const shiftEnd = shiftEvent.endHour ?? shiftEvent.startHour + 12
    return {
      baselineSleepHour,
      predictedSleepHour: snapHour(clamp(rawPredictionHour, shiftEnd + 0.25, shiftEnd + 3)),
      uncertaintyHours: clamp((55 + combined.uncertaintyMinutes) / 60, 0.75, 2.8),
    }
  }

  return {
    baselineSleepHour,
    predictedSleepHour: snapHour(clamp(rawPredictionHour, NORMAL_SLEEP_MIN, NORMAL_SLEEP_MAX)),
    uncertaintyHours: clamp((55 + combined.uncertaintyMinutes) / 60, 0.75, 2.8),
  }
}

function summarizeScenario(
  lang: Language,
  events: SleepSandboxEvent[],
  predictedSleepHour: number,
  deltaMinutes: number,
  riskLevel: 'low' | 'medium' | 'high',
) {
  const shift = events.find(event => event.type === 'shift')
  const lateCoffee = events.find(event => event.type === 'coffee' && event.startHour >= 18)
  const lateNap = events.find(event => event.type === 'nap' && event.startHour >= 18)
  const lateScreen = events.find(event => event.type === 'screen' && event.startHour >= 21)
  const melatonin = events.find(event => event.type === 'melatonin')
  const meditation = events.find(event => event.type === 'meditation')

  if (shift) {
    return {
      summary: lang === 'en'
        ? `Recovery sleep is now anchored after your shift ends.`
        : '预测入睡窗口已经切换到下班后的恢复睡眠。',
      suggestion: lang === 'en'
        ? `Plan the wind-down around ${formatHour(predictedSleepHour, lang)}.`
        : `可以把放松和补觉安排在 ${formatHour(predictedSleepHour, lang)} 左右。`,
    }
  }

  if (lateNap) {
    return {
      summary: lang === 'en'
        ? `This late nap is taking a clear bite out of tonight's sleep pressure.`
        : '这次偏晚的小睡明显削弱了今晚的睡眠压力。',
      suggestion: lang === 'en'
        ? `Shorten it or move it earlier if you want an earlier bedtime.`
        : '如果想更早入睡，优先把它缩短或前移。',
    }
  }

  if (lateCoffee || lateScreen) {
    return {
      summary: lang === 'en'
        ? `Your latest stimulating event is pushing the peak later.`
        : '最近的一次刺激性事件正在把入睡峰值往后推。',
      suggestion: lang === 'en'
        ? `Reduce the dose, shorten the duration, or move it earlier.`
        : '优先减少剂量、缩短时长，或者把时间再提前一些。',
    }
  }

  if (melatonin && deltaMinutes < 0) {
    return {
      summary: lang === 'en'
        ? `This timing may help pull sleep slightly earlier.`
        : '这组安排有机会把入睡时间轻微提前。',
      suggestion: lang === 'en'
        ? `Keep it close to your target bedtime rather than taking it too early.`
        : '把它放在目标入睡前 1 到 2 小时通常更合适。',
    }
  }

  if (meditation && riskLevel === 'low') {
    return {
      summary: lang === 'en'
        ? `The wind-down looks steadier and a bit less noisy.`
        : '这组安排让入睡过程更平稳，不确定性也更低。',
      suggestion: lang === 'en'
        ? `Use it as a light stabilizer rather than your main timing lever.`
        : '更适合把它当作稳定器，而不是主要的时间调节手段。',
    }
  }

  if (riskLevel === 'high') {
    return {
      summary: lang === 'en'
        ? `Your current setup is pulling bedtime far away from baseline.`
        : '当前组合已经把入睡时间明显拉离了基线。',
      suggestion: lang === 'en'
        ? `Try removing the latest strong event first for the fastest improvement.`
        : '想最快看到改善，先移除最晚的强影响事件。',
    }
  }

  return {
    summary: lang === 'en'
      ? `This scenario stays close to your baseline sleep timing.`
      : '这组安排整体仍然接近你的基线入睡时间。',
    suggestion: lang === 'en'
      ? `Change one event at a time if you want cleaner feedback.`
      : '如果想更清楚地看影响，建议一次只改一个事件。',
  }
}

function buildInsight(lang: Language, history: SleepSandboxEvent[][]) {
  if (history.length === 0) {
    return []
  }

  const lateCoffeeCount = history.filter(scenario =>
    scenario.some(event => event.type === 'coffee' && event.startHour >= 18),
  ).length
  const lateNapCount = history.filter(scenario =>
    scenario.some(event => event.type === 'nap' && event.startHour >= 18),
  ).length

  const insights: string[] = []

  if (lateCoffeeCount >= 2) {
    insights.push(
      lang === 'en'
        ? 'In your saved scenarios, coffee after 18:00 repeatedly delays the predicted sleep point.'
        : '你保存过的场景里，18:00 之后的咖啡会反复把预测入睡点往后推。',
    )
  }

  if (lateNapCount >= 2) {
    insights.push(
      lang === 'en'
        ? 'Your later naps are consistently shifting nighttime sleep later.'
        : '你偏晚的小睡会比较稳定地把夜间入睡时间往后推。',
    )
  }

  if (insights.length === 0) {
    insights.push(
      lang === 'en'
        ? 'Save a few more scenarios to surface stronger personal patterns.'
        : '再保存几组场景后，这里会逐渐出现更稳定的个人规律。',
    )
  }

  return insights
}

export function useSleepSandbox(currentLang: () => Language) {
  const events = useLocalStorage<SleepSandboxEvent[]>('stepwise-sleep-sandbox-events', [])
  const memory = useLocalStorage<SleepMemoryState>('stepwise-sleep-memory', {
    enabled: false,
    historicalEvents: [],
    insights: [],
  })

  const prediction = computed(() => estimatePrediction(events.value))
  const baselineSleepHour = computed(() => prediction.value.baselineSleepHour)
  const predictedSleepHour = computed(() => prediction.value.predictedSleepHour)
  const uncertaintyHours = computed(() => prediction.value.uncertaintyHours)
  const deltaMinutes = computed(() => Math.round((predictedSleepHour.value - baselineSleepHour.value) * 60))
  const riskLevel = computed<'low' | 'medium' | 'high'>(() => {
    const absoluteShift = Math.abs(deltaMinutes.value)

    if (events.value.some(event => event.type === 'shift')) {
      if (uncertaintyHours.value >= 2) return 'high'
      if (uncertaintyHours.value >= 1.4) return 'medium'
      return 'low'
    }

    if (absoluteShift >= 150 || uncertaintyHours.value >= 2.2) return 'high'
    if (absoluteShift >= 60 || uncertaintyHours.value >= 1.5) return 'medium'
    return 'low'
  })
  const result = computed<SleepPredictionResult>(() => {
    const lang = currentLang()
    const summary = summarizeScenario(
      lang,
      events.value,
      predictedSleepHour.value,
      deltaMinutes.value,
      riskLevel.value,
    )

    return {
      baselineSleepTime: formatHour(baselineSleepHour.value, lang),
      predictedSleepTime: formatHour(predictedSleepHour.value, lang),
      sleepDelayMinutes: deltaMinutes.value,
      riskLevel: riskLevel.value,
      summary: summary.summary,
      suggestion: summary.suggestion,
    }
  })
  const insight = computed<SleepSandboxInsight | null>(() => {
    if (!memory.value.enabled) {
      return null
    }

    const insights = buildInsight(currentLang(), memory.value.historicalEvents)
    memory.value.insights = insights

    if (insights.length === 0) {
      return null
    }

    return {
      title: currentLang() === 'en' ? 'Historical Insight' : '历史洞察',
      body: insights[0],
    }
  })

  function addEvent(type: SleepEventType) {
    const defaults = EVENT_DEFAULTS[type]
    events.value = [
      ...events.value,
      {
        id: generateId(),
        type,
        startHour: snapHour(defaults.startHour ?? 20),
        endHour: defaults.endHour !== undefined ? snapHour(defaults.endHour) : undefined,
        durationMinutes: defaults.durationMinutes,
        intensity: defaults.intensity ?? 'medium',
        dose: defaults.dose,
      },
    ]
  }

  function updateEvent(id: string, patch: Partial<SleepSandboxEvent>) {
    events.value = events.value.map(event => {
      if (event.id !== id) {
        return event
      }

      const nextEvent = {
        ...event,
        ...patch,
      }

      nextEvent.startHour = snapHour(nextEvent.startHour)

      if (nextEvent.type === 'shift') {
        nextEvent.endHour = snapHour(Math.max(nextEvent.endHour ?? nextEvent.startHour + 8, nextEvent.startHour + 1))
      }

      return nextEvent
    })
  }

  function removeEvent(id: string) {
    events.value = events.value.filter(event => event.id !== id)
  }

  function clearEvents() {
    events.value = []
  }

  function toggleMemory() {
    memory.value.enabled = !memory.value.enabled
  }

  function saveCurrentScenario() {
    if (events.value.length === 0) {
      return
    }

    memory.value.historicalEvents = [
      ...memory.value.historicalEvents.slice(-7),
      cloneEvents(events.value),
    ]
    memory.value.insights = buildInsight(currentLang(), memory.value.historicalEvents)
  }

  function deleteMemory() {
    memory.value.historicalEvents = []
    memory.value.insights = []
  }

  return {
    events,
    memory,
    result,
    baselineSleepHour,
    predictedSleepHour,
    uncertaintyHours,
    insight,
    addEvent,
    updateEvent,
    removeEvent,
    clearEvents,
    toggleMemory,
    saveCurrentScenario,
    deleteMemory,
    eventLabel,
    formatHour,
    snapHour,
  }
}
