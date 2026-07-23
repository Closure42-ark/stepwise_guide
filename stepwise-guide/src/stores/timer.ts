import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type TimerSource = 'manual' | 'skill-step' | null
export type HoldStatus = 'pending' | 'active' | 'done'

export interface HoldQueueItem {
  id: string
  seconds: number
  text: string
  pointIndex: number
  matchIndex: number
  status: HoldStatus
}

export const useTimerStore = defineStore('timer', () => {
  const isPanelOpen = ref(false)
  const isPanelLocked = ref(false)
  const totalSeconds = ref(60)
  const remainingSeconds = ref(60)
  const isRunning = ref(false)
  const source = ref<TimerSource>(null)
  const queue = ref<HoldQueueItem[]>([])
  const currentQueueIndex = ref(-1)
  let timerId: number | undefined

  const hasStartedTimer = computed(() => isRunning.value || remainingSeconds.value !== totalSeconds.value)
  const canEditTimer = computed(() => !isRunning.value && remainingSeconds.value === totalSeconds.value && source.value !== 'skill-step')

  function clampTimerSeconds(nextSeconds: number) {
    return Math.max(0, Math.min(3600, nextSeconds))
  }

  function setPanelOpen(next: boolean) {
    if (!next && isPanelLocked.value) {
      return
    }

    isPanelOpen.value = next
  }

  function openPanel() {
    isPanelOpen.value = true
  }

  function closePanel(force = false) {
    if (isPanelLocked.value && !force) {
      return
    }

    isPanelOpen.value = false
  }

  function stopInterval() {
    if (timerId) {
      window.clearInterval(timerId)
      timerId = undefined
    }
  }

  function startInterval() {
    if (timerId) {
      return
    }

    timerId = window.setInterval(() => {
      if (!isRunning.value) {
        return
      }

      if (remainingSeconds.value > 0) {
        remainingSeconds.value -= 1
        return
      }

      advanceQueue()
    }, 1000)
  }

  function syncCurrentQueueStatuses() {
    if (source.value !== 'skill-step') {
      return
    }

    queue.value = queue.value.map((item, index) => {
      if (index < currentQueueIndex.value) {
        return { ...item, status: 'done' }
      }

      if (index === currentQueueIndex.value) {
        return { ...item, status: isRunning.value ? 'active' : 'pending' }
      }

      return { ...item, status: 'pending' }
    })
  }

  function setManualSeconds(nextSeconds: number, shouldSnap = true) {
    const clampedSeconds = clampTimerSeconds(nextSeconds)
    const nextValue = shouldSnap ? Math.round(clampedSeconds) : clampedSeconds

    source.value = 'manual'
    totalSeconds.value = nextValue
    remainingSeconds.value = nextValue
    queue.value = []
    currentQueueIndex.value = -1
  }

  function toggleManualRun() {
    if (source.value === 'skill-step') {
      isRunning.value = !isRunning.value
      syncCurrentQueueStatuses()
      return
    }

    const nextTotalSeconds = Math.round(clampTimerSeconds(totalSeconds.value))

    if (nextTotalSeconds <= 0 && !hasStartedTimer.value) {
      return
    }

    source.value = 'manual'
    totalSeconds.value = nextTotalSeconds

    if (remainingSeconds.value <= 0) {
      remainingSeconds.value = nextTotalSeconds
    } else {
      remainingSeconds.value = Math.round(clampTimerSeconds(remainingSeconds.value))
    }

    isRunning.value = !isRunning.value
  }

  function stopTimer() {
    isRunning.value = false
    if (source.value === 'skill-step') {
      syncCurrentQueueStatuses()
    }
  }

  function resetManualTimer() {
    if (source.value === 'skill-step') {
      clearSkillTimer(true)
      return
    }

    source.value = 'manual'
    isRunning.value = false
    remainingSeconds.value = totalSeconds.value
  }

  function loadQueueItem(index: number, shouldRun = true) {
    const nextItem = queue.value[index]

    if (!nextItem) {
      isRunning.value = false
      return
    }

    currentQueueIndex.value = index
    totalSeconds.value = nextItem.seconds
    remainingSeconds.value = nextItem.seconds
    isRunning.value = shouldRun
    syncCurrentQueueStatuses()
  }

  function advanceQueue() {
    if (source.value !== 'skill-step') {
      isRunning.value = false
      remainingSeconds.value = 0
      return
    }

    const nextIndex = currentQueueIndex.value + 1

    if (queue.value[currentQueueIndex.value]) {
      queue.value[currentQueueIndex.value] = {
        ...queue.value[currentQueueIndex.value],
        status: 'done',
      }
    }

    if (nextIndex < queue.value.length) {
      loadQueueItem(nextIndex, true)
      return
    }

    isRunning.value = false
    remainingSeconds.value = 0
    totalSeconds.value = queue.value[queue.value.length - 1]?.seconds ?? totalSeconds.value
    currentQueueIndex.value = queue.value.length - 1
    syncCurrentQueueStatuses()
  }

  function configureSkillTimer(items: Omit<HoldQueueItem, 'status'>[], autoStart = true) {
    source.value = 'skill-step'
    queue.value = items.map(item => ({ ...item, status: 'pending' }))
    currentQueueIndex.value = 0
    openPanel()
    loadQueueItem(0, autoStart)
  }

  function clearSkillTimer(closePopover = true) {
    if (source.value !== 'skill-step') {
      return
    }

    isRunning.value = false
    queue.value = []
    currentQueueIndex.value = -1
    source.value = null
    totalSeconds.value = 60
    remainingSeconds.value = 60

    if (closePopover) {
      closePanel(true)
    }
  }

  function togglePanelLock() {
    isPanelLocked.value = !isPanelLocked.value

    if (isPanelLocked.value) {
      openPanel()
    }
  }

  function disposeTimer() {
    stopInterval()
  }

  startInterval()

  return {
    isPanelOpen,
    isPanelLocked,
    totalSeconds,
    remainingSeconds,
    isRunning,
    source,
    queue,
    currentQueueIndex,
    hasStartedTimer,
    canEditTimer,
    clampTimerSeconds,
    setPanelOpen,
    openPanel,
    closePanel,
    setManualSeconds,
    toggleManualRun,
    stopTimer,
    resetManualTimer,
    configureSkillTimer,
    clearSkillTimer,
    togglePanelLock,
    disposeTimer,
  }
})
