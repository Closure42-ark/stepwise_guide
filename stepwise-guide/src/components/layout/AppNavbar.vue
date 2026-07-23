<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavIcon from '@/components/layout/NavIcon.vue'
import { useI18n } from '@/composables/useI18n'
import { useLearnStore } from '@/stores/learn'
import { useTimerStore } from '@/stores/timer'
import { useUserStore } from '@/stores/user'
import type { Language } from '@/types'

type NavIconName = 'record' | 'assess' | 'plan' | 'learn' | 'basicInfo'
type PopoverName = 'user' | ''

interface NavItem {
  path: string
  key: string
  icon: NavIconName
  size?: 'main' | 'normal'
}

interface RectSnapshot {
  left: number
  top: number
  width: number
  height: number
}

interface PopoverPlacement {
  left: number
  top: number
  arrowLeft: number
}

interface SkillTimerPlacement {
  left: number
  top: number
  mode: 'left' | 'top'
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const timerStore = useTimerStore()
const learnStore = useLearnStore()
const { t, currentLang, setLanguage } = useI18n()

const activePopover = ref<PopoverName>('')
const lastDragAngle = ref<number | null>(null)
const isDraggingTimer = ref(false)

const timerButtonRef = ref<HTMLButtonElement | null>(null)
const userButtonRef = ref<HTMLButtonElement | null>(null)
const timerPopoverRef = ref<HTMLDivElement | null>(null)
const userPopoverRef = ref<HTMLDivElement | null>(null)
const skillTimerPopoverRef = ref<HTMLDivElement | null>(null)

const timerButtonRect = ref<RectSnapshot | null>(null)
const userButtonRect = ref<RectSnapshot | null>(null)
const skillPanelRect = ref<RectSnapshot | null>(null)

let positionSyncId: number | null = null

const ring = {
  size: 172,
  center: 86,
  radius: 62,
  circumference: 2 * Math.PI * 62,
}

const timerButtonRing = {
  size: 52,
  center: 26,
  radius: 23,
  circumference: 2 * Math.PI * 23,
}

const mainNavItems: NavItem[] = [
  { path: '/plan', key: 'nav.plan', icon: 'plan' },
  { path: '/learn', key: 'nav.learn', icon: 'learn' },
  { path: '/record', key: 'nav.record', icon: 'record', size: 'main' },
  { path: '/assess', key: 'nav.assess', icon: 'assess' },
  { path: '/basic-info', key: 'basicInfo', icon: 'basicInfo' },
]

const shouldShowNav = computed(() => route.path !== '/login')
const timerLabel = computed(() => currentLang.value === 'en' ? 'Timer Check-in' : t('nav.timer'))
const userLabel = computed(() => currentLang.value === 'en' ? 'User' : '用户')
const hasStartedTimer = computed(() => timerStore.hasStartedTimer)
const isSkillTimerDocked = computed(() => timerStore.source === 'skill-step' && learnStore.isSkillTutorialOpen)
const isTimerPopoverVisible = computed(() => isSkillTimerDocked.value || timerStore.isPanelOpen || timerStore.isPanelLocked)
const isInlineTimerPopoverVisible = computed(() => isTimerPopoverVisible.value && !isSkillTimerDocked.value)
const isDockedTimerPopoverVisible = computed(() => isTimerPopoverVisible.value && isSkillTimerDocked.value)
const canEditTimer = computed(() => timerStore.canEditTimer)
const visibleTimerSeconds = computed(() => hasStartedTimer.value ? timerStore.remainingSeconds : timerStore.totalSeconds)
const roundedVisibleTimerSeconds = computed(() => Math.round(timerStore.clampTimerSeconds(visibleTimerSeconds.value)))

const timerButtonProgress = computed(() => {
  const total = timerStore.clampTimerSeconds(timerStore.totalSeconds)

  if (!hasStartedTimer.value || total <= 0) {
    return 0
  }

  return timerStore.clampTimerSeconds(timerStore.remainingSeconds) / total
})

const timerButtonDashOffset = computed(() => timerButtonRing.circumference * (1 - timerButtonProgress.value))

const timerText = computed(() => {
  const minutes = Math.floor(roundedVisibleTimerSeconds.value / 60)
  const seconds = roundedVisibleTimerSeconds.value % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
})

const timerCurrentTurnSeconds = computed(() => timerStore.clampTimerSeconds(visibleTimerSeconds.value) % 60)
const timerRingProgress = computed(() => {
  if (visibleTimerSeconds.value > 0 && Math.abs(timerCurrentTurnSeconds.value) < 0.001) {
    return 1
  }

  return timerCurrentTurnSeconds.value / 60
})

const timerDashOffset = computed(() => ring.circumference * (1 - timerRingProgress.value))
const timerPointerAngle = computed(() => timerRingProgress.value * 360)
const timerPointer = computed(() => {
  const radians = (timerPointerAngle.value - 90) * Math.PI / 180

  return {
    x: ring.center + ring.radius * Math.cos(radians),
    y: ring.center + ring.radius * Math.sin(radians),
  }
})

const extraTurnCount = computed(() => Math.max(0, Math.ceil(visibleTimerSeconds.value / 60) - 1))

function snapshotRect(element: HTMLElement | null) {
  if (!element) {
    return null
  }

  const rect = element.getBoundingClientRect()

  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function getPopoverPlacement(anchorRect: RectSnapshot | null, width: number, height: number): PopoverPlacement | null {
  if (!anchorRect) {
    return null
  }

  const viewportPadding = 12
  const gap = 14
  const buttonCenterX = anchorRect.left + anchorRect.width / 2
  const unclampedLeft = buttonCenterX - width / 2
  const left = clamp(unclampedLeft, viewportPadding, window.innerWidth - width - viewportPadding)
  const top = Math.max(viewportPadding, anchorRect.top - height - gap)
  const arrowLeft = clamp(buttonCenterX - left, 16, width - 16)

  return { left, top, arrowLeft }
}

function getSkillTimerPlacement(width: number, height: number): SkillTimerPlacement | null {
  if (!skillPanelRect.value) {
    return null
  }

  const viewportPadding = 12
  const gap = 16
  const panel = skillPanelRect.value
  const leftDockX = panel.left - width - gap
  const canDockLeft = leftDockX >= viewportPadding

  if (canDockLeft) {
    return {
      left: leftDockX,
      top: clamp(panel.top + 18, viewportPadding, window.innerHeight - height - viewportPadding),
      mode: 'left',
    }
  }

  const centeredLeft = clamp(
    panel.left + panel.width / 2 - width / 2,
    viewportPadding,
    window.innerWidth - width - viewportPadding,
  )

  return {
    left: centeredLeft,
    top: Math.max(viewportPadding, panel.top - height - gap),
    mode: 'top',
  }
}

const timerPopoverPlacement = computed(() => {
  const width = timerPopoverRef.value?.offsetWidth ?? 248
  const height = timerPopoverRef.value?.offsetHeight ?? 312
  return getPopoverPlacement(timerButtonRect.value, width, height)
})

const userPopoverPlacement = computed(() => {
  const width = userPopoverRef.value?.offsetWidth ?? 216
  const height = userPopoverRef.value?.offsetHeight ?? 188
  return getPopoverPlacement(userButtonRect.value, width, height)
})

const skillTimerPlacement = computed(() => {
  const width = skillTimerPopoverRef.value?.offsetWidth ?? 248
  const height = skillTimerPopoverRef.value?.offsetHeight ?? 312
  return getSkillTimerPlacement(width, height)
})

const timerPopoverStyle = computed(() => {
  if (!timerPopoverPlacement.value) {
    return undefined
  }

  return {
    left: `${timerPopoverPlacement.value.left}px`,
    top: `${timerPopoverPlacement.value.top}px`,
    '--popover-arrow-left': `${timerPopoverPlacement.value.arrowLeft}px`,
  }
})

const userPopoverStyle = computed(() => {
  if (!userPopoverPlacement.value) {
    return undefined
  }

  return {
    left: `${userPopoverPlacement.value.left}px`,
    top: `${userPopoverPlacement.value.top}px`,
    '--popover-arrow-left': `${userPopoverPlacement.value.arrowLeft}px`,
  }
})

const skillTimerStyle = computed(() => {
  if (!skillTimerPlacement.value) {
    return undefined
  }

  return {
    left: `${skillTimerPlacement.value.left}px`,
    top: `${skillTimerPlacement.value.top}px`,
  }
})

function updateAnchorRects() {
  timerButtonRect.value = snapshotRect(timerButtonRef.value)
  userButtonRect.value = snapshotRect(userButtonRef.value)

  const anchor = document.querySelector('.learn-skill-modal-anchor') as HTMLElement | null
  const modalContent = anchor?.closest('.base-modal__content') as HTMLElement | null
  skillPanelRect.value = snapshotRect(modalContent)
}

function startPositionSync() {
  if (positionSyncId !== null) {
    return
  }

  positionSyncId = window.setInterval(updateAnchorRects, 120)
}

function stopPositionSync() {
  if (positionSyncId === null) {
    return
  }

  window.clearInterval(positionSyncId)
  positionSyncId = null
}

function getLabel(item: NavItem) {
  if (item.key === 'basicInfo') {
    return currentLang.value === 'en' ? 'Basic Info' : '个人基础信息'
  }

  if (item.key === 'nav.assess') {
    return currentLang.value === 'en' ? 'Sleep Sandbox' : '睡眠沙盒'
  }

  return t(item.key)
}

function isActive(path: string) {
  return route.path === path
}

function closeTimerPopoverIfAllowed() {
  if (isSkillTimerDocked.value) {
    timerStore.openPanel()
    return
  }

  timerStore.closePanel()
}

function closePopovers() {
  activePopover.value = ''
  closeTimerPopoverIfAllowed()
}

function toggleTimerPopover() {
  updateAnchorRects()

  if (isSkillTimerDocked.value) {
    timerStore.openPanel()
    activePopover.value = ''
    return
  }

  if (timerStore.isPanelLocked) {
    timerStore.openPanel()
    activePopover.value = ''
    return
  }

  timerStore.setPanelOpen(!timerStore.isPanelOpen)
  activePopover.value = ''
}

function toggleUserPopover() {
  updateAnchorRects()
  activePopover.value = activePopover.value === 'user' ? '' : 'user'
  closeTimerPopoverIfAllowed()
}

function toggleTimer() {
  timerStore.toggleManualRun()
}

function endTimer() {
  isDraggingTimer.value = false
  lastDragAngle.value = null

  if (timerStore.source === 'skill-step') {
    timerStore.clearSkillTimer(true)
    return
  }

  timerStore.stopTimer()
  timerStore.resetManualTimer()
}

function toggleTimerPanelLock() {
  if (isSkillTimerDocked.value) {
    return
  }

  timerStore.togglePanelLock()
}

function getPointerAngle(event: PointerEvent, target: SVGElement) {
  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left - rect.width / 2
  const y = event.clientY - rect.top - rect.height / 2
  const angle = Math.atan2(x, -y) * 180 / Math.PI

  return angle < 0 ? angle + 360 : angle
}

function handleTimerPointerDown(event: PointerEvent) {
  if (!canEditTimer.value) {
    return
  }

  event.preventDefault()
  isDraggingTimer.value = true
  lastDragAngle.value = getPointerAngle(event, event.currentTarget as SVGElement)
  ;(event.currentTarget as SVGElement).setPointerCapture(event.pointerId)
}

function handleTimerPointerMove(event: PointerEvent) {
  if (!isDraggingTimer.value || !canEditTimer.value || lastDragAngle.value === null) {
    return
  }

  const angle = getPointerAngle(event, event.currentTarget as SVGElement)
  let delta = angle - lastDragAngle.value

  if (delta > 180) {
    delta -= 360
  } else if (delta < -180) {
    delta += 360
  }

  lastDragAngle.value = angle
  timerStore.setManualSeconds(timerStore.totalSeconds + delta / 6, false)
}

function handleTimerPointerUp(event: PointerEvent) {
  if (!isDraggingTimer.value) {
    return
  }

  isDraggingTimer.value = false
  lastDragAngle.value = null
  timerStore.setManualSeconds(timerStore.totalSeconds)
  const target = event.currentTarget as SVGElement

  if (target.hasPointerCapture(event.pointerId)) {
    target.releasePointerCapture(event.pointerId)
  }
}

function switchLanguage(lang: Language) {
  setLanguage(lang)
  activePopover.value = timerStore.isPanelLocked || isSkillTimerDocked.value ? '' : 'user'
}

async function handleLogout() {
  closePopovers()
  await userStore.logout()
  router.push('/login')
}

function handleDocumentPointerDown() {
  activePopover.value = ''
  closeTimerPopoverIfAllowed()
}

function handleViewportChange() {
  updateAnchorRects()
}

watch(
  () => [isInlineTimerPopoverVisible.value, isDockedTimerPopoverVisible.value, activePopover.value, learnStore.isSkillTutorialOpen],
  ([inlineVisible, dockedVisible, openPopover, tutorialOpen]) => {
    if (inlineVisible || dockedVisible || openPopover === 'user' || tutorialOpen) {
      updateAnchorRects()
      startPositionSync()
      return
    }

    stopPositionSync()
  },
  { immediate: true },
)

watch(
  () => [timerStore.isPanelLocked, timerStore.isPanelOpen, timerStore.source],
  () => {
    updateAnchorRects()
  },
)

onMounted(() => {
  updateAnchorRects()
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  window.addEventListener('resize', handleViewportChange)
  window.addEventListener('scroll', handleViewportChange, true)
})

onBeforeUnmount(() => {
  stopPositionSync()
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', handleViewportChange, true)
})
</script>

<template>
  <nav
    v-if="shouldShowNav"
    class="bottom-nav"
    aria-label="Primary navigation"
    @pointerdown.stop
  >
    <div class="bottom-nav__side">
      <button
        ref="timerButtonRef"
        class="bottom-nav__side-btn"
        :class="{ 'bottom-nav__side-btn--open': isTimerPopoverVisible }"
        type="button"
        :aria-label="timerLabel"
        :aria-expanded="isTimerPopoverVisible"
        @click="toggleTimerPopover"
      >
        <svg
          v-if="hasStartedTimer"
          class="bottom-nav__side-ring"
          :viewBox="`0 0 ${timerButtonRing.size} ${timerButtonRing.size}`"
          aria-hidden="true"
        >
          <circle
            class="bottom-nav__side-ring-track"
            :cx="timerButtonRing.center"
            :cy="timerButtonRing.center"
            :r="timerButtonRing.radius"
          />
          <circle
            class="bottom-nav__side-ring-progress"
            :cx="timerButtonRing.center"
            :cy="timerButtonRing.center"
            :r="timerButtonRing.radius"
            :stroke-dasharray="timerButtonRing.circumference"
            :stroke-dashoffset="timerButtonDashOffset"
          />
        </svg>
        <NavIcon name="timer" />
        <span class="bottom-nav__tooltip">{{ timerLabel }}</span>
      </button>
    </div>

    <div class="bottom-nav__group" role="list">
      <router-link
        v-for="item in mainNavItems"
        :key="item.path"
        :to="item.path"
        class="bottom-nav__btn"
        :class="{
          'bottom-nav__btn--active': isActive(item.path),
          'bottom-nav__btn--main': item.size === 'main',
        }"
        :aria-label="getLabel(item)"
        :aria-current="isActive(item.path) ? 'page' : undefined"
        role="listitem"
        @click="closePopovers"
      >
        <NavIcon :name="item.icon" />
        <span class="bottom-nav__tooltip">{{ getLabel(item) }}</span>
      </router-link>
    </div>

    <div class="bottom-nav__side">
      <button
        ref="userButtonRef"
        class="bottom-nav__side-btn"
        :class="{ 'bottom-nav__side-btn--open': activePopover === 'user' }"
        type="button"
        :aria-label="userStore.isLoggedIn ? userLabel : 'Login'"
        :aria-expanded="activePopover === 'user'"
        @click="toggleUserPopover"
      >
        <NavIcon :name="userStore.isLoggedIn ? 'user' : 'login'" />
        <span class="bottom-nav__tooltip">{{ userStore.isLoggedIn ? userLabel : 'Login' }}</span>
      </button>
    </div>

    <Teleport to="body">
      <Transition name="nav-popover">
        <div
          v-if="isInlineTimerPopoverVisible"
          ref="timerPopoverRef"
          class="bottom-nav__popover bottom-nav__popover--timer"
          :class="{ 'bottom-nav__popover--locked': timerStore.isPanelLocked }"
          :style="timerPopoverStyle"
          role="dialog"
          :aria-label="timerLabel"
          @pointerdown.stop
        >
          <div class="bottom-nav__popover-header">
            <strong class="bottom-nav__popover-title">{{ timerLabel }}</strong>
            <button
              class="bottom-nav__lock-btn"
              :class="{ 'bottom-nav__lock-btn--active': timerStore.isPanelLocked }"
              type="button"
              :aria-pressed="timerStore.isPanelLocked"
              :title="timerStore.isPanelLocked ? (currentLang === 'en' ? 'Unlock panel' : '解除锁定') : (currentLang === 'en' ? 'Lock panel' : '锁定面板')"
              @click="toggleTimerPanelLock"
            >
              <NavIcon :name="timerStore.isPanelLocked ? 'lock' : 'lockOpen'" />
            </button>
          </div>
          <div
            class="timer-ring"
            :class="{
              'timer-ring--dragging': isDraggingTimer,
              'timer-ring--locked': !canEditTimer,
            }"
          >
            <svg
              class="timer-ring__svg"
              :class="{ 'timer-ring__svg--editable': canEditTimer }"
              :viewBox="`0 0 ${ring.size} ${ring.size}`"
              :role="canEditTimer ? 'slider' : 'img'"
              :aria-label="timerLabel"
              aria-valuemin="0"
              aria-valuemax="3600"
              :aria-valuenow="roundedVisibleTimerSeconds"
              :tabindex="canEditTimer ? 0 : -1"
              @pointerdown="handleTimerPointerDown"
              @pointermove="handleTimerPointerMove"
              @pointerup="handleTimerPointerUp"
              @pointercancel="handleTimerPointerUp"
            >
              <circle
                v-if="canEditTimer"
                class="timer-ring__hit-area"
                :cx="ring.center"
                :cy="ring.center"
                :r="ring.radius"
              />
              <circle class="timer-ring__track" :cx="ring.center" :cy="ring.center" :r="ring.radius" />
              <circle
                v-if="extraTurnCount > 0"
                class="timer-ring__extra"
                :cx="ring.center"
                :cy="ring.center"
                :r="ring.radius + 9"
                :stroke-width="Math.min(10, 4 + extraTurnCount * 2)"
              />
              <circle
                class="timer-ring__progress"
                :cx="ring.center"
                :cy="ring.center"
                :r="ring.radius"
                :stroke-dasharray="ring.circumference"
                :stroke-dashoffset="timerDashOffset"
              />
              <circle class="timer-ring__handle" :cx="timerPointer.x" :cy="timerPointer.y" r="7" />
            </svg>
            <div class="timer-ring__center">
              <strong>{{ timerText }}</strong>
            </div>
          </div>
          <div class="bottom-nav__timer-controls" :class="{ 'bottom-nav__timer-controls--active': hasStartedTimer }">
            <button class="bottom-nav__timer-main" type="button" @click="toggleTimer">
              <NavIcon :name="timerStore.isRunning ? 'pause' : 'play'" />
            </button>
            <button v-if="hasStartedTimer" class="bottom-nav__timer-stop" type="button" @click="endTimer">
              <NavIcon name="stop" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="nav-popover">
        <div
          v-if="activePopover === 'user'"
          ref="userPopoverRef"
          class="bottom-nav__popover bottom-nav__popover--user"
          :style="userPopoverStyle"
          role="dialog"
          :aria-label="userLabel"
          @pointerdown.stop
        >
          <strong class="bottom-nav__popover-title">{{ userStore.isLoggedIn ? userLabel : 'Login' }}</strong>
          <span v-if="userStore.isLoggedIn" class="bottom-nav__user-name">
            {{ userStore.displayName || userStore.user?.username }}
          </span>
          <div class="bottom-nav__lang-switch">
            <div class="bottom-nav__lang-actions">
              <button
                type="button"
                class="bottom-nav__lang-btn"
                :class="{ 'bottom-nav__lang-btn--active': currentLang === 'en' }"
                @click="switchLanguage('en')"
              >
                EN
              </button>
              <button
                type="button"
                class="bottom-nav__lang-btn"
                :class="{ 'bottom-nav__lang-btn--active': currentLang === 'zh' }"
                @click="switchLanguage('zh')"
              >
                中文
              </button>
            </div>
          </div>
          <div class="bottom-nav__popover-menu">
            <button v-if="!userStore.isLoggedIn" type="button" @click="router.push('/login')">
              Login
            </button>
            <template v-else>
              <button type="button" class="bottom-nav__danger" @click="handleLogout">
                {{ currentLang === 'en' ? 'Log out' : '退出登录' }}
              </button>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="nav-popover">
        <div
          v-if="isDockedTimerPopoverVisible"
          ref="skillTimerPopoverRef"
          class="bottom-nav__popover bottom-nav__popover--skill-step"
          :class="{
            'bottom-nav__popover--skill-step-top': skillTimerPlacement?.mode === 'top',
          }"
          :style="skillTimerStyle"
          role="dialog"
          :aria-label="timerLabel"
          @pointerdown.stop
        >
          <div class="bottom-nav__popover-header">
            <strong class="bottom-nav__popover-title">{{ timerLabel }}</strong>
          </div>
          <div class="timer-ring timer-ring--locked">
            <svg
              class="timer-ring__svg"
              :viewBox="`0 0 ${ring.size} ${ring.size}`"
              role="img"
              :aria-label="timerLabel"
            >
              <circle class="timer-ring__track" :cx="ring.center" :cy="ring.center" :r="ring.radius" />
              <circle
                v-if="extraTurnCount > 0"
                class="timer-ring__extra"
                :cx="ring.center"
                :cy="ring.center"
                :r="ring.radius + 9"
                :stroke-width="Math.min(10, 4 + extraTurnCount * 2)"
              />
              <circle
                class="timer-ring__progress"
                :cx="ring.center"
                :cy="ring.center"
                :r="ring.radius"
                :stroke-dasharray="ring.circumference"
                :stroke-dashoffset="timerDashOffset"
              />
              <circle class="timer-ring__handle" :cx="timerPointer.x" :cy="timerPointer.y" r="7" />
            </svg>
            <div class="timer-ring__center">
              <strong>{{ timerText }}</strong>
            </div>
          </div>
          <div class="bottom-nav__timer-controls bottom-nav__timer-controls--active">
            <button class="bottom-nav__timer-main" type="button" @click="toggleTimer">
              <NavIcon :name="timerStore.isRunning ? 'pause' : 'play'" />
            </button>
            <button class="bottom-nav__timer-stop" type="button" @click="endTimer">
              <NavIcon name="stop" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  right: 50%;
  bottom: calc(var(--space-5) + env(safe-area-inset-bottom));
  z-index: 100;
  display: flex;
  align-items: center;
  gap: clamp(10px, 3vw, 28px);
  transform: translateX(50%);
  pointer-events: none;
}

.bottom-nav__side {
  position: relative;
  pointer-events: auto;
}

.bottom-nav__group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border: 1px solid rgba(97, 160, 111, 0.16);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: var(--shadow-modal);
  backdrop-filter: blur(12px);
  pointer-events: auto;
}

.bottom-nav__btn,
.bottom-nav__side-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  text-decoration: none;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(97, 160, 111, 0.12);
  transition:
    transform var(--transition-fast),
    background var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.bottom-nav__side-btn {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(97, 160, 111, 0.16);
  box-shadow: var(--shadow-card-hover);
}

.bottom-nav__side-ring {
  position: absolute;
  inset: -4px;
  width: calc(100% + 8px);
  height: calc(100% + 8px);
  overflow: visible;
  pointer-events: none;
}

.bottom-nav__side-ring-track,
.bottom-nav__side-ring-progress {
  fill: none;
  transform: rotate(-90deg);
  transform-origin: center;
}

.bottom-nav__side-ring-track {
  stroke: rgba(74, 158, 111, 0.16);
  stroke-width: 3;
}

.bottom-nav__side-ring-progress {
  stroke: var(--color-primary);
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dashoffset var(--transition-fast);
}

.bottom-nav__btn--main {
  width: 58px;
  height: 58px;
  margin: 0 var(--space-1);
}

.bottom-nav__btn--active {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 12px 26px rgba(97, 160, 111, 0.28);
}

.bottom-nav__side-btn--open {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 12px 26px rgba(97, 160, 111, 0.24);
}

.bottom-nav__btn:hover,
.bottom-nav__side-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-modal);
}

.bottom-nav__btn:active,
.bottom-nav__side-btn:active {
  transform: scale(0.96);
}

.bottom-nav__btn:focus-visible,
.bottom-nav__side-btn:focus-visible,
.bottom-nav__lock-btn:focus-visible,
.bottom-nav__timer-main:focus-visible,
.bottom-nav__timer-stop:focus-visible,
.bottom-nav__lang-btn:focus-visible,
.bottom-nav__popover-menu button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

.bottom-nav__tooltip {
  position: absolute;
  bottom: calc(100% + var(--space-2));
  left: 50%;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--color-text-primary);
  color: var(--color-surface);
  font-size: var(--font-size-caption);
  line-height: 1.2;
  white-space: nowrap;
  opacity: 0;
  transform: translate(-50%, 4px);
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
  pointer-events: none;
}

.bottom-nav__btn:hover .bottom-nav__tooltip,
.bottom-nav__btn:focus-visible .bottom-nav__tooltip,
.bottom-nav__side-btn:hover .bottom-nav__tooltip,
.bottom-nav__side-btn:focus-visible .bottom-nav__tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
}

.bottom-nav__popover {
  position: fixed;
  z-index: 130;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  width: 216px;
  padding: var(--space-4);
  border: 1px solid rgba(97, 160, 111, 0.14);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow-modal);
  color: var(--color-text-primary);
  backdrop-filter: blur(12px);
}

.bottom-nav__popover::after {
  content: '';
  position: absolute;
  left: var(--popover-arrow-left, 50%);
  bottom: -6px;
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.96);
  border-right: 1px solid rgba(97, 160, 111, 0.14);
  border-bottom: 1px solid rgba(97, 160, 111, 0.14);
  transform: translateX(-50%) rotate(45deg);
}

.bottom-nav__popover--timer {
  width: 248px;
  transform-origin: bottom center;
}

.bottom-nav__popover--locked {
  border-color: rgba(74, 158, 111, 0.28);
  box-shadow: 0 14px 36px rgba(45, 52, 54, 0.16);
}

.bottom-nav__popover--user {
  transform-origin: bottom center;
}

.bottom-nav__popover--skill-step {
  z-index: 211;
  width: 248px;
  border-color: rgba(74, 158, 111, 0.2);
  box-shadow: 0 16px 40px rgba(45, 52, 54, 0.16);
  transform-origin: center right;
}

.bottom-nav__popover--skill-step::after,
.bottom-nav__popover--skill-step-top::after {
  display: none;
}

.bottom-nav__popover--skill-step-top {
  transform-origin: bottom center;
}

.nav-popover-enter-active,
.nav-popover-leave-active {
  transition:
    opacity 0.18s ease-out,
    transform 0.18s ease-out;
}

.nav-popover-enter-from,
.nav-popover-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.94);
}

.nav-popover-enter-to,
.nav-popover-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.bottom-nav__popover-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
}

.bottom-nav__popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.timer-ring {
  position: relative;
  display: grid;
  place-items: center;
  width: 172px;
  height: 172px;
  margin: 0 auto;
}

.timer-ring__svg {
  width: 172px;
  height: 172px;
  overflow: visible;
}

.timer-ring__svg--editable {
  cursor: grab;
  touch-action: none;
}

.timer-ring--locked .timer-ring__svg {
  cursor: default;
  pointer-events: none;
}

.timer-ring__hit-area {
  fill: none;
  stroke: rgba(0, 0, 0, 0.001);
  stroke-width: 34;
  pointer-events: stroke;
}

.timer-ring__track,
.timer-ring__extra,
.timer-ring__progress {
  fill: none;
  transform: rotate(-90deg);
  transform-origin: center;
}

.timer-ring__track {
  stroke: var(--color-primary-light);
  stroke-width: 12;
}

.timer-ring__extra {
  stroke: var(--color-primary);
  opacity: 0.16;
}

.timer-ring__progress {
  stroke: var(--color-primary);
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset var(--transition-fast);
}

.timer-ring--dragging .timer-ring__progress {
  transition: none;
}

.timer-ring__handle {
  fill: var(--color-surface);
  stroke: var(--color-primary);
  stroke-width: 4;
  filter: drop-shadow(0 4px 8px rgba(97, 160, 111, 0.28));
}

.timer-ring--locked .timer-ring__handle {
  opacity: 0.72;
  filter: drop-shadow(0 2px 6px rgba(97, 160, 111, 0.16));
}

.timer-ring__center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.timer-ring__center strong {
  font-family: 'DM Sans', sans-serif;
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
}

.bottom-nav__timer-controls {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
}

.bottom-nav__timer-main,
.bottom-nav__timer-stop {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.bottom-nav__timer-main {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 10px 22px rgba(97, 160, 111, 0.24);
}

.bottom-nav__timer-controls--active .bottom-nav__timer-main {
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-primary-lighter);
}

.bottom-nav__timer-stop {
  background: var(--color-danger, #ef4444);
  color: #fff;
  box-shadow: 0 10px 22px rgba(255, 59, 48, 0.2);
}

.bottom-nav__timer-main:hover,
.bottom-nav__timer-stop:hover,
.bottom-nav__lock-btn:hover {
  transform: translateY(-1px);
}

.bottom-nav__lock-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid rgba(97, 160, 111, 0.14);
  border-radius: var(--radius-full);
  background: rgba(74, 158, 111, 0.08);
  color: var(--color-primary);
  cursor: pointer;
  transition: background var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}

.bottom-nav__lock-btn--active {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 8px 18px rgba(97, 160, 111, 0.18);
}

.bottom-nav__user-name {
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.bottom-nav__lang-switch {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.bottom-nav__lang-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
}

.bottom-nav__lang-btn {
  min-height: 34px;
  border: 1px solid rgba(97, 160, 111, 0.16);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text-primary);
  text-align: center;
}

.bottom-nav__lang-btn--active {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 8px 18px rgba(97, 160, 111, 0.16);
}

.bottom-nav__popover-menu {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.bottom-nav__popover-menu button {
  width: 100%;
  min-height: 34px;
  padding: 0 var(--space-3);
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-size: var(--font-size-caption);
  font-weight: var(--font-weight-medium);
  text-align: left;
  cursor: pointer;
}

.bottom-nav__popover-menu button:hover {
  filter: brightness(0.98);
}

.bottom-nav__popover-menu .bottom-nav__danger {
  color: var(--color-danger, #ef4444);
}

@media (prefers-reduced-motion: reduce) {
  .nav-popover-enter-active,
  .nav-popover-leave-active,
  .bottom-nav__btn,
  .bottom-nav__side-btn {
    transition-duration: 0.01ms;
  }
}

@media (max-width: 640px) {
  .bottom-nav {
    bottom: calc(var(--space-3) + env(safe-area-inset-bottom));
    gap: var(--space-2);
    width: min(100% - 16px, 560px);
    justify-content: center;
  }

  .bottom-nav__group {
    gap: 3px;
    padding: 6px;
  }

  .bottom-nav__btn,
  .bottom-nav__side-btn {
    width: 38px;
    height: 38px;
  }

  .bottom-nav__btn--main {
    width: 50px;
    height: 50px;
    margin: 0;
  }

  .bottom-nav__popover {
    width: min(214px, calc(100vw - 20px));
  }

  .bottom-nav__popover--timer,
  .bottom-nav__popover--skill-step {
    width: min(224px, calc(100vw - 20px));
  }
}

@media (max-width: 390px) {
  .bottom-nav {
    gap: 6px;
  }

  .bottom-nav__group {
    gap: 2px;
    padding: 5px;
  }

  .bottom-nav__btn,
  .bottom-nav__side-btn {
    width: 34px;
    height: 34px;
  }

  .bottom-nav__btn--main {
    width: 46px;
    height: 46px;
  }
}
</style>
