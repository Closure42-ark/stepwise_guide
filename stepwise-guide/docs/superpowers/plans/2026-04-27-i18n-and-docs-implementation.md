# 国际化 (i18n) + 文档完善 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为步步为引项目添加中英双语支持，完善 README 文档和代码注释

**Architecture:** 基于 Pinia store + JSON 翻译文件的自定义轻量 i18n 方案，无第三方依赖。各组件通过 composable `useI18n()` 获取 `t()` 函数替换硬编码文本。

**Tech Stack:** Vue 3 + TypeScript + Pinia (无新增依赖)

---

## 文件结构

### 新增文件
| 文件 | 职责 |
|---|---|
| `src/i18n/zh.json` | 中文翻译数据，按模块分层 |
| `src/i18n/en.json` | 英文翻译数据，与 zh.json 结构一致 |
| `src/i18n/index.ts` | `t()` 翻译函数 + `Language` 类型导出 |
| `src/stores/i18n.ts` | Pinia store：currentLang 管理 + localStorage 持久化 |
| `src/composables/useI18n.ts` | `useI18n()` composable 封装 |

### 需修改文件
| 文件 | 改动 |
|---|---|
| `src/main.ts` | 导入 i18n store 并初始化 |
| `src/App.vue` | 集成语言初始化逻辑 |
| `src/types/index.ts` | 添加 `Language` 类型 |
| `src/router/index.ts` | meta.title 改为通过翻译 key 动态获取 |
| `src/components/layout/AppNavbar.vue` | 右上角添加语言切换按钮 |
| `src/components/onboarding/OnboardingOverlay.vue` | 第一步添加语言选择界面 |
| `src/components/base/BaseModal.vue` | (无修改，已有确认框能力) |
| `src/views/RecordView.vue` | 替换硬编码文本 |
| `src/views/AssessView.vue` | 替换硬编码文本 |
| `src/views/PlanView.vue` | 替换硬编码文本 |
| `src/views/LearnView.vue` | 替换硬编码文本 |
| `src/components/record/*.vue` (5个) | 替换硬编码文本 |
| `src/components/assessment/*.vue` (7个) | 替换硬编码文本 |
| `src/components/plan/*.vue` (5个) | 替换硬编码文本 |
| `src/components/learn/*.vue` (3个) | 替换硬编码文本 |
| `src/components/layout/DailyTipBanner.vue` | 替换硬编码文本 |
| `src/mock/*.ts` (4个) | 数据中的中文文本改用 i18n key |
| `README.md` | 重写架构文档 + 开发指南 |

---

## 实施任务

### Task 1: 创建语言类型定义

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: 添加 Language 类型**

在 `src/types/index.ts` 末尾添加：

```typescript
export type Language = 'zh' | 'en'
```

---

### Task 2: 创建翻译数据文件

**Files:**
- Create: `src/i18n/zh.json`
- Create: `src/i18n/en.json`
- Create: `src/i18n/index.ts`

- [ ] **Step 1: 创建中文翻译文件 `src/i18n/zh.json`**

```json
{
  "nav": {
    "record": "运动记录",
    "assess": "健康评估",
    "plan": "方案规划",
    "learn": "运动技能"
  },
  "record": {
    "title": "运动记录",
    "today": "今日概览",
    "steps": "今日步数",
    "duration": "运动时长",
    "calories": "消耗热量",
    "streak": "连续达标",
    "days": "天",
    "stepUnit": "步",
    "minuteUnit": "分钟",
    "kcalUnit": "千卡",
    "quickRecord": "快速记录",
    "quickRecordHint": "快速记一笔今天的运动",
    "exerciseType": "运动类型",
    "walking": "步行",
    "running": "跑步",
    "cycling": "骑行",
    "yoga": "瑜伽",
    "strength": "力量训练",
    "other": "其他",
    "durationLabel": "运动时长（分钟）",
    "save": "保存",
    "viewHistory": "历史记录",
    "weekSummary": "本周汇总",
    "weeklyOverview": "本周运动概况",
    "totalDuration": "总时长",
    "totalCalories": "总消耗",
    "exerciseDays": "运动天数",
    "avgDaily": "日均",
    "table": "表格",
    "chart": "图表",
    "date": "日期",
    "type": "类型",
    "noRecords": "暂无记录",
    "startExercising": "开始运动吧！"
  },
  "assess": {
    "title": "健康评估",
    "subtitle": "完成评估获取个性化建议",
    "startAssess": "开始评估",
    "nextStep": "下一步",
    "prevStep": "上一步",
    "step": "第 {current} 步，共 {total} 步",
    "bmiTitle": "BMI 指数",
    "bmiDesc": "身体质量指数，衡量体型健康",
    "bmiValue": "{value}（{category}）",
    "bmiUnderweight": "偏瘦",
    "bmiNormal": "正常",
    "bmiOverweight": "超重",
    "bmiObese": "肥胖",
    "activityLevel": "活动等级",
    "activitySedentary": "久坐不动",
    "activityLight": "轻度活动",
    "activityModerate": "中度活动",
    "activityActive": "积极活动",
    "suggestions": "健康建议",
    "suggestionDesc": "基于您的评估结果，我们为您提供以下建议",
    "basicInfo": {
      "title": "基础信息",
      "height": "身高（cm）",
      "weight": "体重（kg）",
      "age": "年龄",
      "gender": "性别",
      "male": "男",
      "female": "女"
    },
    "exerciseHabit": {
      "title": "运动习惯",
      "frequency": "运动频率",
      "rarely": "几乎不运动",
      "sometimes": "偶尔（1-2次/周）",
      "often": "经常（3-4次/周）",
      "veryOften": "频繁（5次+/周）",
      "types": "喜欢的运动类型"
    },
    "lifestyle": {
      "title": "生活方式",
      "sitHours": "每日久坐时长",
      "lessThan4": "少于4小时",
      "hours4to8": "4-8小时",
      "moreThan8": "超过8小时",
      "sleepQuality": "睡眠质量",
      "poor": "较差",
      "fair": "一般",
      "good": "良好",
      "excellent": "优质"
    }
  },
  "plan": {
    "title": "方案规划",
    "subtitle": "选择适合您的运动方案",
    "recommended": "为您推荐",
    "allPlans": "全部方案",
    "adopted": "已采纳",
    "adoptPlan": "采纳方案",
    "viewDetails": "查看详情",
    "weekPlan": "第 {week} 周计划",
    "dayPlan": "第 {day} 天",
    "rest": "休息",
    "reminder": "提醒设置",
    "exerciseReminder": "运动提醒",
    "exerciseReminderDesc": "每天定时提醒您运动",
    "sitReminder": "久坐提醒",
    "sitReminderDesc": "长时间久坐时提醒您起身活动",
    "reminderTime": "提醒时间",
    "interval": "间隔（分钟）",
    "guidedWizard": "智能方案向导",
    "wizardStep1": "选择您的目标",
    "wizardStep2": "选择运动偏好",
    "wizardStep3": "确认方案",
    "loseWeight": "减脂瘦身",
    "buildMuscle": "增肌塑形",
    "improvePosture": "改善体态",
    "boostEndurance": "提升耐力",
    "indoor": "室内运动",
    "outdoor": "户外运动",
    "noPref": "无偏好",
    "generatePlan": "生成方案"
  },
  "learn": {
    "title": "运动技能库",
    "subtitle": "学习正确动作，避免运动损伤",
    "all": "全部",
    "neck": "颈部",
    "shoulder": "肩部",
    "leg": "腿部",
    "core": "核心",
    "fullBody": "全身",
    "steps": "共 {count} 个步骤",
    "startLearning": "开始学习",
    "step": "步骤 {current}/{total}",
    "prevStep": "上一步",
    "nextStep": "下一步",
    "complete": "完成学习",
    "relatedSkills": "相关技能"
  },
  "onboarding": {
    "welcome": "欢迎",
    "welcomeDesc": "步步为引，您的个性化运动伴侣",
    "selectLang": "选择语言",
    "zh": "中文",
    "en": "English",
    "step1Title": "记录每一次进步",
    "step1Desc": "轻松记录每日运动数据，追踪您的成长轨迹",
    "step2Title": "了解身体状况",
    "step2Desc": "科学评估健康指标，获取个性化运动建议",
    "step3Title": "规划专属方案",
    "step3Desc": "根据目标和偏好，定制最适合您的运动计划",
    "step4Title": "学习正确姿势",
    "step4Desc": "从基础开始，掌握科学运动方法",
    "getStarted": "开始使用"
  },
  "common": {
    "confirm": "确定",
    "cancel": "取消",
    "save": "保存",
    "close": "关闭",
    "loading": "加载中...",
    "switchLang": "切换语言",
    "langSwitchTitle": "切换语言",
    "langSwitchConfirm": "切换语言后需要重新加载页面。",
    "langSwitchHint": "确定要切换吗？"
  },
  "tip": {
    "record": "小贴士：每天走满 8000 步，有助于维持心血管健康。",
    "assess": "小贴士：建议每季度进行一次健康评估，跟踪身体状况变化。",
    "plan": "小贴士：循序渐进的运动计划比激进计划更容易坚持。",
    "learn": "小贴士：学习正确动作姿势，能有效预防运动损伤。"
  }
}
```

- [ ] **Step 2: 创建英文翻译文件 `src/i18n/en.json`**

```json
{
  "nav": {
    "record": "Exercise Record",
    "assess": "Health Assessment",
    "plan": "Plan Planning",
    "learn": "Exercise Skills"
  },
  "record": {
    "title": "Exercise Record",
    "today": "Today's Overview",
    "steps": "Today's Steps",
    "duration": "Exercise Duration",
    "calories": "Calories Burned",
    "streak": "Streak",
    "days": "days",
    "stepUnit": "steps",
    "minuteUnit": "min",
    "kcalUnit": "kcal",
    "quickRecord": "Quick Record",
    "quickRecordHint": "Log today's exercise quickly",
    "exerciseType": "Exercise Type",
    "walking": "Walking",
    "running": "Running",
    "cycling": "Cycling",
    "yoga": "Yoga",
    "strength": "Strength Training",
    "other": "Other",
    "durationLabel": "Duration (min)",
    "save": "Save",
    "viewHistory": "History",
    "weekSummary": "Weekly Summary",
    "weeklyOverview": "This Week's Overview",
    "totalDuration": "Total Duration",
    "totalCalories": "Total Calories",
    "exerciseDays": "Active Days",
    "avgDaily": "Daily Avg",
    "table": "Table",
    "chart": "Chart",
    "date": "Date",
    "type": "Type",
    "noRecords": "No records yet",
    "startExercising": "Start exercising!"
  },
  "assess": {
    "title": "Health Assessment",
    "subtitle": "Complete assessment for personalized suggestions",
    "startAssess": "Start Assessment",
    "nextStep": "Next",
    "prevStep": "Previous",
    "step": "Step {current} of {total}",
    "bmiTitle": "BMI Index",
    "bmiDesc": "Body Mass Index, a measure of body health",
    "bmiValue": "{value}（{category}）",
    "bmiUnderweight": "Underweight",
    "bmiNormal": "Normal",
    "bmiOverweight": "Overweight",
    "bmiObese": "Obese",
    "activityLevel": "Activity Level",
    "activitySedentary": "Sedentary",
    "activityLight": "Lightly Active",
    "activityModerate": "Moderately Active",
    "activityActive": "Very Active",
    "suggestions": "Health Suggestions",
    "suggestionDesc": "Based on your assessment, we provide the following suggestions",
    "basicInfo": {
      "title": "Basic Info",
      "height": "Height (cm)",
      "weight": "Weight (kg)",
      "age": "Age",
      "gender": "Gender",
      "male": "Male",
      "female": "Female"
    },
    "exerciseHabit": {
      "title": "Exercise Habits",
      "frequency": "Exercise Frequency",
      "rarely": "Rarely",
      "sometimes": "Sometimes (1-2x/week)",
      "often": "Often (3-4x/week)",
      "veryOften": "Very Often (5x+/week)",
      "types": "Preferred Exercise Types"
    },
    "lifestyle": {
      "title": "Lifestyle",
      "sitHours": "Daily Sitting Hours",
      "lessThan4": "Less than 4 hours",
      "hours4to8": "4-8 hours",
      "moreThan8": "More than 8 hours",
      "sleepQuality": "Sleep Quality",
      "poor": "Poor",
      "fair": "Fair",
      "good": "Good",
      "excellent": "Excellent"
    }
  },
  "plan": {
    "title": "Plan Planning",
    "subtitle": "Choose a plan that suits you",
    "recommended": "Recommended",
    "allPlans": "All Plans",
    "adopted": "Adopted",
    "adoptPlan": "Adopt Plan",
    "viewDetails": "View Details",
    "weekPlan": "Week {week}",
    "dayPlan": "Day {day}",
    "rest": "Rest",
    "reminder": "Reminder Settings",
    "exerciseReminder": "Exercise Reminder",
    "exerciseReminderDesc": "Daily reminder to exercise",
    "sitReminder": "Sit Break Reminder",
    "sitReminderDesc": "Remind you to move when sitting too long",
    "reminderTime": "Reminder Time",
    "interval": "Interval (min)",
    "guidedWizard": "Smart Plan Wizard",
    "wizardStep1": "Choose Your Goal",
    "wizardStep2": "Choose Exercise Preference",
    "wizardStep3": "Confirm Plan",
    "loseWeight": "Lose Weight",
    "buildMuscle": "Build Muscle",
    "improvePosture": "Improve Posture",
    "boostEndurance": "Boost Endurance",
    "indoor": "Indoor",
    "outdoor": "Outdoor",
    "noPref": "No Preference",
    "generatePlan": "Generate Plan"
  },
  "learn": {
    "title": "Exercise Skills",
    "subtitle": "Learn correct techniques to prevent injuries",
    "all": "All",
    "neck": "Neck",
    "shoulder": "Shoulder",
    "leg": "Leg",
    "core": "Core",
    "fullBody": "Full Body",
    "steps": "{count} steps",
    "startLearning": "Start Learning",
    "step": "Step {current}/{total}",
    "prevStep": "Previous",
    "nextStep": "Next",
    "complete": "Complete",
    "relatedSkills": "Related Skills"
  },
  "onboarding": {
    "welcome": "Welcome",
    "welcomeDesc": "StepWise Guide, your personal exercise companion",
    "selectLang": "Select Language",
    "zh": "中文",
    "en": "English",
    "step1Title": "Track Every Step",
    "step1Desc": "Easily log daily exercise data and track your progress",
    "step2Title": "Know Your Body",
    "step2Desc": "Scientific health assessment with personalized recommendations",
    "step3Title": "Plan Your Journey",
    "step3Desc": "Customize the best exercise plan based on your goals",
    "step4Title": "Learn Proper Form",
    "step4Desc": "Master scientific exercise methods from the ground up",
    "getStarted": "Get Started"
  },
  "common": {
    "confirm": "Confirm",
    "cancel": "Cancel",
    "save": "Save",
    "close": "Close",
    "loading": "Loading...",
    "switchLang": "Switch Language",
    "langSwitchTitle": "Switch Language",
    "langSwitchConfirm": "Changing language will reload the page.",
    "langSwitchHint": "Are you sure you want to switch?"
  },
  "tip": {
    "record": "Tip: Walking 8000 steps daily helps maintain cardiovascular health.",
    "assess": "Tip: We recommend a health assessment every quarter to track changes.",
    "plan": "Tip: Gradual exercise plans are easier to maintain than aggressive ones.",
    "learn": "Tip: Learning proper form can effectively prevent exercise injuries."
  }
}
```

- [ ] **Step 3: 创建翻译工具函数 `src/i18n/index.ts`**

```typescript
import type { Language } from '@/types'

export type { Language }

type TranslationValue = string | Record<string, unknown>
type TranslationMap = Record<string, TranslationValue>

function resolveNestedKey(obj: TranslationMap, key: string): string {
  const keys = key.split('.')
  let current: TranslationValue = obj
  for (const k of keys) {
    if (typeof current === 'object' && current !== null && k in current) {
      current = (current as TranslationMap)[k]
    } else {
      return key
    }
  }
  return typeof current === 'string' ? current : key
}

export function createT(translations: TranslationMap) {
  return (key: string, params?: Record<string, string | number>): string => {
    let text = resolveNestedKey(translations, key)
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v))
      }
    }
    return text
  }
}
```

---

### Task 3: 创建 i18n Pinia store

**Files:**
- Create: `src/stores/i18n.ts`

- [ ] **Step 1: 创建 store**

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Language } from '@/types'
import zh from '@/i18n/zh.json'
import en from '@/i18n/en.json'
import { createT } from '@/i18n'

const STORAGE_KEY = 'stepwise-lang'
const translations: Record<Language, Record<string, unknown>> = { zh, en }

export const useI18nStore = defineStore('i18n', () => {
  const savedLang = localStorage.getItem(STORAGE_KEY) as Language | null
  const currentLang = ref<Language>(savedLang || 'zh')

  const t = computed(() => createT(translations[currentLang.value]))

  function setLanguage(lang: Language) {
    currentLang.value = lang
    localStorage.setItem(STORAGE_KEY, lang)
  }

  function reloadWithLanguage(lang: Language) {
    setLanguage(lang)
    window.location.reload()
  }

  return { currentLang, t, setLanguage, reloadWithLanguage }
})
```

---

### Task 4: 创建 useI18n composable

**Files:**
- Create: `src/composables/useI18n.ts`

- [ ] **Step 1: 创建 composable**

```typescript
import { useI18nStore } from '@/stores/i18n'
import type { Language } from '@/types'

export function useI18n() {
  const store = useI18nStore()

  function t(key: string, params?: Record<string, string | number>): string {
    return store.t.value(key, params)
  }

  function setLanguage(lang: Language) {
    store.setLanguage(lang)
  }

  function reloadWithLanguage(lang: Language) {
    store.reloadWithLanguage(lang)
  }

  return {
    t,
    currentLang: store.currentLang,
    setLanguage,
    reloadWithLanguage,
  }
}
```

---

### Task 5: 集成 i18n 到 main.ts 和 App.vue

**Files:**
- Modify: `src/main.ts`
- Modify: `src/App.vue`

- [ ] **Step 1: 修改 `src/main.ts`** — 导入 i18n store（确保 store 注册即可）

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/global.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')
```

(main.ts 实际上不需要额外改动，Pinia store 会在组件使用时自动注册)

- [ ] **Step 2: 修改 `src/App.vue`**

```vue
<script setup lang="ts">
import { useOnboardingStore } from '@/stores/onboarding'
import { useI18n } from '@/composables/useI18n'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import OnboardingOverlay from '@/components/onboarding/OnboardingOverlay.vue'

const { t } = useI18n()
const onboarding = useOnboardingStore()
if (onboarding.isFirstVisit) {
  onboarding.showOnboarding = true
}
</script>

<template>
  <div class="app" :lang="useI18n().currentLang.value === 'zh' ? 'zh-CN' : 'en'">
    <AppNavbar />
    <main class="app__main">
      <router-view v-slot="{ Component }">
        <Transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
    <OnboardingOverlay />
  </div>
</template>
```

---

### Task 6: 改造 OnboardingOverlay — 添加语言选择步骤

**Files:**
- Modify: `src/components/onboarding/OnboardingOverlay.vue`

- [ ] **Step 1: 重写 OnboardingOverlay.vue**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOnboardingStore } from '@/stores/onboarding'
import { useI18n } from '@/composables/useI18n'
import type { Language } from '@/types'
import BaseButton from '@/components/base/BaseButton.vue'

const onboarding = useOnboardingStore()
const { t, reloadWithLanguage, currentLang } = useI18n()

const steps = computed(() => [
  {
    title: t.value('onboarding.welcome'),
    desc: t.value('onboarding.welcomeDesc'),
  },
  {
    title: t.value('onboarding.step1Title'),
    desc: t.value('onboarding.step1Desc'),
    icon: '📝',
  },
  {
    title: t.value('onboarding.step2Title'),
    desc: t.value('onboarding.step2Desc'),
    icon: '📊',
  },
  {
    title: t.value('onboarding.step3Title'),
    desc: t.value('onboarding.step3Desc'),
    icon: '🎯',
  },
  {
    title: t.value('onboarding.step4Title'),
    desc: t.value('onboarding.step4Desc'),
    icon: '📖',
  },
])

const currentStep = ref(0)
const isLanguageStep = computed(() => currentStep.value === 0)

function selectLanguage(lang: Language) {
  reloadWithLanguage(lang)
}

function nextStep() {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
  }
}

function finish() {
  onboarding.completeOnboarding()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="onboarding">
      <div v-if="onboarding.showOnboarding" class="onboarding">
        <div class="onboarding__card">
          <template v-if="isLanguageStep">
            <div class="onboarding__lang">
              <h2 class="onboarding__title">{{ t('onboarding.welcome') }}</h2>
              <p class="onboarding__desc">{{ t('onboarding.welcomeDesc') }}</p>
              <p class="onboarding__label">{{ t('onboarding.selectLang') }}</p>
              <div class="onboarding__lang-options">
                <button
                  class="onboarding__lang-btn"
                  :class="{ 'onboarding__lang-btn--active': currentLang === 'zh' }"
                  @click="selectLanguage('zh')"
                >
                  🇨🇳 {{ t('onboarding.zh') }}
                </button>
                <button
                  class="onboarding__lang-btn"
                  :class="{ 'onboarding__lang-btn--active': currentLang === 'en' }"
                  @click="selectLanguage('en')"
                >
                  🇺🇸 {{ t('onboarding.en') }}
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="onboarding__icon">{{ steps[currentStep].icon }}</div>
            <h2 class="onboarding__title">{{ steps[currentStep].title }}</h2>
            <p class="onboarding__desc">{{ steps[currentStep].desc }}</p>
            <div class="onboarding__dots">
              <span
                v-for="(_, index) in steps.slice(1)"
                :key="index"
                class="onboarding__dot"
                :class="{ 'onboarding__dot--active': currentStep === index + 1 }"
              />
            </div>
            <div class="onboarding__actions">
              <BaseButton
                v-if="currentStep < steps.length - 1"
                variant="primary"
                @click="nextStep"
              >
                {{ t('common.confirm') }}
              </BaseButton>
              <BaseButton
                v-else
                variant="primary"
                @click="finish"
              >
                {{ t('onboarding.getStarted') }}
              </BaseButton>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.onboarding {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
.onboarding__card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: 48px 40px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: var(--shadow-xl);
}
.onboarding__icon {
  font-size: 64px;
  margin-bottom: 24px;
  line-height: 1;
}
.onboarding__title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 12px;
}
.onboarding__desc {
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 32px;
}
.onboarding__label {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 16px;
}
.onboarding__lang-options {
  display: flex;
  gap: 16px;
  justify-content: center;
}
.onboarding__lang-btn {
  padding: 12px 32px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  font-size: 16px;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text);
}
.onboarding__lang-btn:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}
.onboarding__lang-btn--active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}
.onboarding__dots {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 32px;
}
.onboarding__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
  transition: all var(--transition-fast);
}
.onboarding__dot--active {
  background: var(--color-primary);
  width: 24px;
  border-radius: 4px;
}
.onboarding__actions {
  display: flex;
  justify-content: center;
}
.onboarding-enter-active,
.onboarding-leave-active {
  transition: opacity 0.3s ease;
}
.onboarding-enter-from,
.onboarding-leave-to {
  opacity: 0;
}
</style>
```

---

### Task 7: 改造 AppNavbar — 添加语言切换按钮

**Files:**
- Modify: `src/components/layout/AppNavbar.vue`

- [ ] **Step 1: 重写 AppNavbar.vue**

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import type { Language } from '@/types'
import BaseModal from '@/components/base/BaseModal.vue'
import { ref } from 'vue'

const route = useRoute()
const { t, currentLang, reloadWithLanguage } = useI18n()
const showLangModal = ref(false)
const pendingLang = ref<Language>('zh')

function openLangSwitch(lang: Language) {
  pendingLang.value = lang
  showLangModal.value = true
}

function confirmLangSwitch() {
  reloadWithLanguage(pendingLang.value)
}
</script>

<template>
  <nav class="navbar">
    <div class="navbar__inner">
      <div class="navbar__brand">
        <span class="navbar__logo">🚶</span>
        <span class="navbar__title">StepWise Guide</span>
      </div>
      <div class="navbar__right">
        <div class="navbar__lang">
          <button
            class="navbar__lang-btn"
            :class="{ 'navbar__lang-btn--active': currentLang === 'zh' }"
            @click="openLangSwitch('zh')"
          >
            中文
          </button>
          <span class="navbar__lang-divider">|</span>
          <button
            class="navbar__lang-btn"
            :class="{ 'navbar__lang-btn--active': currentLang === 'en' }"
            @click="openLangSwitch('en')"
          >
            EN
          </button>
        </div>
      </div>
    </div>
    <BaseModal
      :visible="showLangModal"
      :title="t('common.langSwitchTitle')"
      @close="showLangModal = false"
    >
      <p style="margin-bottom: 8px;">{{ t('common.langSwitchConfirm') }}</p>
      <p style="margin-bottom: 24px; color: var(--color-text-secondary); font-size: 14px;">{{ t('common.langSwitchHint') }}</p>
      <template #footer>
        <button class="btn btn--secondary" @click="showLangModal = false">{{ t('common.cancel') }}</button>
        <button class="btn btn--primary" @click="confirmLangSwitch">{{ t('common.confirm') }}</button>
      </template>
    </BaseModal>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  z-index: 100;
  backdrop-filter: blur(12px);
}
.navbar__inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}
.navbar__brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.navbar__logo {
  font-size: 24px;
}
.navbar__title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text);
}
.navbar__right {
  display: flex;
  align-items: center;
  gap: 16px;
}
.navbar__lang {
  display: flex;
  align-items: center;
  gap: 4px;
}
.navbar__lang-btn {
  padding: 4px 10px;
  border: none;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}
.navbar__lang-btn:hover {
  color: var(--color-text);
  background: var(--color-bg-secondary);
}
.navbar__lang-btn--active {
  color: var(--color-primary);
  font-weight: 600;
}
.navbar__lang-divider {
  color: var(--color-border);
  font-size: 13px;
}
</style>
```

---

### Task 8: 替换各 View 页面中的硬编码文本

> 以下每个子任务结构相同：找到 View 文件中的中文文本，替换为 t() 调用。每个文件独立进行。

**Files:**
- Modify: `src/views/RecordView.vue`
- Modify: `src/views/AssessView.vue`
- Modify: `src/views/PlanView.vue`
- Modify: `src/views/LearnView.vue`

- [ ] **Step 1: 替换 RecordView.vue 中的硬编码文本**

导入 `useI18n`：
```typescript
import { useI18n } from '@/composables/useI18n'
const { t } = useI18n()
```

替换以下硬编码（具体位置参考实际文件）：
- `运动记录` → `{{ t('record.title') }}`
- `今日概览` → `{{ t('record.today') }}`
- `快速记录` → `{{ t('record.quickRecord') }}`
- `历史记录` → `{{ t('record.viewHistory') }}`
- `本周汇总` → `{{ t('record.weekSummary') }}`

- [ ] **Step 2: 替换 AssessView.vue 中的硬编码文本**

导入 `useI18n` 并替换：
- `健康评估` → `{{ t('assess.title') }}`
- `完成评估获取个性化建议` → `{{ t('assess.subtitle') }}`
- `开始评估` → `{{ t('assess.startAssess') }}`

- [ ] **Step 3: 替换 PlanView.vue 中的硬编码文本**

导入 `useI18n` 并替换：
- `方案规划` → `{{ t('plan.title') }}`
- 其他文本对应 plan 命名空间

- [ ] **Step 4: 替换 LearnView.vue 中的硬编码文本**

导入 `useI18n` 并替换：
- `运动技能库` → `{{ t('learn.title') }}`
- 其他文本对应 learn 命名空间

---

### Task 9: 替换各组件的硬编码文本

> 每个组件文件需要：1) 导入 useI18n 2) 替换所有硬编码字符串为 t() 调用

**Files to modify (batch by module):**

- [ ] **Step 1: record 模块组件** — DataCard.vue, QuickRecordForm.vue, ViewToggle.vue, RecordTable.vue, WeeklySummary.vue
- [ ] **Step 2: assessment 模块组件** — StepIndicator.vue, BasicInfoStep.vue, ExerciseHabitStep.vue, LifestyleStep.vue, BmiCard.vue, ActivityLevelCard.vue, SuggestionList.vue
- [ ] **Step 3: plan 模块组件** — PlanModeToggle.vue, PlanCard.vue, WeekBreakdown.vue, ReminderSection.vue, GuidedPlanWizard.vue
- [ ] **Step 4: learn 模块组件** — CategoryFilter.vue, SkillCard.vue, SkillTutorial.vue
- [ ] **Step 5: layout 模块** — DailyTipBanner.vue

---

### Task 10: 更新 README 文档

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 重写 README.md**

包含以下章节：
1. **项目简介** — 项目定位、目标用户、核心功能概述
2. **技术栈** — Vue 3 + TypeScript + Vite + Pinia + Vue Router
3. **快速开始** — 安装、开发、构建命令
4. **项目架构**（详细）：
   - 完整目录树及各目录职责
   - 组件分层体系（base → 业务组件 → 页面）
   - 数据流架构（Pinia store → composable → 组件）
   - 路由设计
   - 样式体系（CSS Variables 设计令牌）
5. **核心功能模块说明** — 四大模块各自包含的组件和交互流程
6. **开发指南**：
   - 环境要求
   - 新增页面步骤
   - 新增组件规范
   - 国际化使用说明（如何添加翻译、如何使用 t()）
   - 样式开发规范
   - 构建与部署
7. **国际化开发说明** — 翻译文件结构、Key 命名规范、新增翻译注意事项
8. **目录结构速查表**

---

### Task 11: 补充代码注释

**Files:**

- [ ] **Step 1: stores/*.ts** — 为每个 store 添加 JSDoc 注释说明职责和关键方法
- [ ] **Step 2: composables/*.ts** — 添加函数签名和返回值说明
- [ ] **Step 3: types/index.ts** — 为每个接口的字段添加注释
- [ ] **Step 4: router/index.ts** — 添加路由结构和 meta 字段说明

---

## 验证

- [ ] **Step 1: 构建验证** — 运行 `npm run build`，确保无 TypeScript 错误
- [ ] **Step 2: 功能验证** — 启动 dev server，检查：
  - 首次访问时看到语言选择界面
  - 选择中文/英文后页面刷新并正确显示对应语言
  - 右上角语言切换按钮可打开确认弹窗
  - 切换语言后页面刷新并切换到对应语言
  - 所有页面的文本均正确显示对应语言
