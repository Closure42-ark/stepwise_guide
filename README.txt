# 步步为引（StepWise Guide）

> 为运动入门者及规律锻炼意愿者提供记录、评估、规划、学习一体化的极简引导式健康管理网页。

## 项目简介

**步步为引**是一个面向久坐办公族和运动入门者的健康管理网页应用。系统通过简约、引导充分的交互设计，帮助用户逐步建立运动记录、健康评估、运动规划和技能学习的习惯。

本项目已从纯前端原型扩展为轻量级全栈系统，支持用户注册、登录、运动记录持久化、健康评估结果保存，以及基于账号的数据隔离。

应用主要帮助用户：

- 记录运动 — 追踪每日步数、运动时长、运动类型和消耗热量
- 查看趋势 — 通过本周 / 本月折线图观察步数变化
- 健康评估 — 基于 BMI、运动习惯和生活方式生成个性化建议
- 保存评估 — 将健康评估结果保存到数据库，并支持丢弃结果
- 方案规划 — 选择预设计划或生成个性化运动方案
- 技能学习 — 分步骤学习正确运动方法，降低受伤风险
- 用户系统 — 支持登录、注册、登出和用户资料面板

---

## 快速开始

本项目分为前端和后端两个部分，需要同时运行。

### 前置要求

- Node.js >= 18
- npm >= 9
- MongoDB Atlas 云端数据库
- 现代浏览器，例如 Chrome / Edge / Firefox / Safari

---

## 前端启动

进入前端项目目录：

```bash
cd stepwise-guide
```

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

前端应用将在以下地址运行：

```text
http://localhost:5173/
```

---

## 后端启动

进入后端项目目录：

```bash
cd stepwise-server
```

安装依赖：

```bash
npm install
```

启动后端服务器：

```bash
node server.js
```

后端服务将在以下地址运行：

```text
http://localhost:3000/
```

正常启动后，终端应显示：

```text
MongoDB connected
Server running at http://localhost:3000
```

---

## 运行方式总结

开发时需要同时打开两个终端：

```text
Terminal 1:
cd stepwise-server
node server.js
```

```text
Terminal 2:
cd stepwise-guide
npm run dev
```

---

## 项目架构

### 总体结构

```text
stepwise-guide/
├── stepwise-guide/                  # Vue 前端项目
│   ├── public/                      # 静态资源
│   ├── src/
│   │   ├── assets/                  # 图片、字体等资源
│   │   ├── components/              # Vue 组件
│   │   ├── views/                   # 页面视图
│   │   ├── router/                  # 路由配置
│   │   ├── stores/                  # Pinia 状态管理
│   │   ├── i18n/                    # 中英文翻译文件
│   │   ├── composables/             # Vue 组合式函数
│   │   ├── styles/                  # 全局样式系统
│   │   ├── types/                   # TypeScript 类型定义
│   │   ├── mock/                    # 静态模拟数据
│   │   ├── App.vue                  # 根组件
│   │   └── main.ts                  # 前端入口
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── stepwise-server/                 # Express 后端项目
    ├── server.js                    # 后端入口与 API 定义
    ├── package.json                 # 后端依赖管理
    └── node_modules/
```

---

## 前端目录结构

```text
src/
├── components/
│   ├── base/                        # 基础通用组件，如 Button、Input、Modal
│   ├── layout/                      # 全局布局组件，如 AppNavbar、DailyTipBanner
│   ├── record/                      # 运动记录模块组件
│   │   ├── DataCard.vue             # 今日概览数据卡片
│   │   ├── QuickRecordForm.vue      # 快速记录表单
│   │   ├── ViewToggle.vue           # 周 / 月视图切换
│   │   ├── RecordTable.vue          # 历史记录表格
│   │   ├── WeeklySummary.vue        # 周总结
│   │   └── StepsLineChart.vue       # 步数趋势折线图
│   │
│   ├── assessment/                  # 健康评估模块组件
│   ├── plan/                        # 方案规划模块组件
│   ├── learn/                       # 技能学习模块组件
│   ├── onboarding/                  # 首次使用引导浮层
│   └── user/                        # 用户资料面板
│
├── views/
│   ├── LoginView.vue                # 登录 / 注册页面
│   ├── RecordView.vue               # 运动记录页面
│   ├── AssessView.vue               # 健康评估页面
│   ├── PlanView.vue                 # 方案规划页面
│   └── LearnView.vue                # 技能学习页面
│
├── stores/
│   ├── user.ts                      # 用户登录状态与资料状态
│   ├── record.ts                    # 运动记录状态与数据库读写
│   ├── assessment.ts                # 健康评估状态与数据库读写
│   ├── plan.ts                      # 方案规划状态
│   ├── onboarding.ts                # 首次使用引导状态
│   └── i18n.ts                      # 国际化状态
│
├── router/
│   └── index.ts                     # 路由配置
│
├── i18n/
│   ├── zh.json                      # 中文翻译
│   ├── en.json                      # 英文翻译
│   └── index.ts                     # 翻译函数工厂
│
├── styles/
│   ├── variables.css                # 颜色、间距、字体、圆角等变量
│   ├── reset.css
│   ├── typography.css
│   ├── animations.css
│   └── global.css
│
├── types/
│   └── index.ts                     # 全局 TypeScript 类型
│
└── mock/
    ├── tips.ts
    ├── plans.ts
    ├── plans-en.ts
    ├── skills.ts
    └── skills-en.ts
```

---

## 后端架构

后端使用：

```text
Express + MongoDB Node.js Driver + express-session
```

主要职责：

- 处理用户注册和登录
- 维护 session 登录状态
- 连接 MongoDB Atlas
- 保存和读取运动记录
- 保存、读取和删除健康评估结果
- 实现基于 userId 的数据隔离

---

## 后端 API

### 基础测试

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 测试后端是否运行 |
| GET | `/api/test-db` | 测试数据库连接 |

---

### 用户认证 API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册用户 |
| POST | `/api/auth/login` | 登录用户 |
| GET | `/api/auth/me` | 获取当前登录用户 |
| POST | `/api/auth/logout` | 登出用户 |

---

### 运动记录 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/records` | 获取当前用户的运动记录 |
| POST | `/api/records` | 保存当前用户的一条运动记录 |

每条运动记录都会绑定当前登录用户：

```js
{
  userId: "current-user-id",
  date: "2026-05-07",
  weekday: "Thu",
  steps: 8000,
  exercise: "walk",
  duration: 30,
  calories: 180,
  createdAt: Date
}
```

---

### 健康评估 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/assessments/latest` | 获取当前用户最新健康评估 |
| POST | `/api/assessments` | 保存当前用户健康评估 |
| DELETE | `/api/assessments/latest` | 删除当前用户最新健康评估 |

健康评估数据结构示例：

```js
{
  userId: "current-user-id",
  basicInfo: {
    height: 170,
    weight: 65,
    age: 20,
    gender: "male"
  },
  exerciseHabit: {
    frequency: "weekly1_2",
    types: ["walk", "stretch"]
  },
  lifestyle: {
    sittingHours: 8,
    sleepQuality: "fair"
  },
  result: {
    bmi: 22.5,
    bmiCategory: "正常范围",
    activityLevel: "中度活动",
    activityDescription: "运动习惯正在养成，建议保持并适当增加频率",
    suggestions: [
      "每天饮水1500-2000毫升，运动前后注意补水",
      "运动前做5分钟热身，运动后做5分钟拉伸"
    ]
  },
  createdAt: Date
}
```

---

## MongoDB 数据库设计

数据库名称：

```text
stepwise
```

当前主要 collections：

```text
stepwise
├── users
├── records
└── assessments
```

---

### users

用于保存用户账号信息。

```js
{
  _id: ObjectId,
  username: string,
  password: string,
  createdAt: Date
}
```

说明：

- `username` 用于登录
- `password` 当前为课程原型级别的轻量实现
- `createdAt` 记录注册时间

---

### records

用于保存用户运动记录。

```js
{
  _id: ObjectId,
  userId: string,
  date: string,
  weekday: string,
  steps: number,
  exercise: string,
  duration: number,
  calories: number,
  createdAt: Date
}
```

说明：

- `userId` 用于区分不同用户的数据
- 不同账号只能读取自己的运动记录
- 页面刷新后运动记录仍然保留

---

### assessments

用于保存健康评估结果。

```js
{
  _id: ObjectId,
  userId: string,
  basicInfo: object,
  exerciseHabit: object,
  lifestyle: object,
  result: object,
  createdAt: Date
}
```

说明：

- 每个用户可以保存自己的健康评估结果
- 页面刷新后会恢复最新一次评估
- 用户可以通过 Discard Result 删除最新评估

---

## 组件层级关系

```text
App.vue
├── AppNavbar
│   └── UserProfilePanel
├── OnboardingOverlay
└── <router-view>
    ├── LoginView
    │
    ├── RecordView
    │   ├── DailyTipBanner
    │   ├── DataCard × 3
    │   ├── QuickRecordForm
    │   ├── ViewToggle
    │   ├── RecordTable
    │   ├── StepsLineChart
    │   └── WeeklySummary
    │
    ├── AssessView
    │   ├── DailyTipBanner
    │   ├── StepIndicator
    │   ├── BasicInfoStep
    │   ├── ExerciseHabitStep
    │   ├── LifestyleStep
    │   ├── BmiCard
    │   ├── ActivityLevelCard
    │   └── SuggestionList
    │
    ├── PlanView
    │   ├── DailyTipBanner
    │   ├── PlanModeToggle
    │   ├── PlanCard
    │   ├── WeekBreakdown
    │   ├── GuidedPlanWizard
    │   └── ReminderSection
    │
    └── LearnView
        ├── DailyTipBanner
        ├── CategoryFilter
        ├── SkillCard
        └── SkillTutorial
```

---

## 数据流架构

```text
Vue Views
   ↓
Pinia Stores
   ↓
Frontend API request
   ↓
Express Backend
   ↓
MongoDB Atlas
```

以运动记录为例：

```text
QuickRecordForm
   ↓ submit
RecordView.handleQuickRecord()
   ↓
recordStore.updateToday()
recordStore.saveTodayRecord()
   ↓
POST /api/records
   ↓
MongoDB records collection
```

读取数据时：

```text
RecordView mounted
   ↓
recordStore.fetchRecords()
   ↓
GET /api/records
   ↓
MongoDB records collection
   ↓
更新 RecordTable / StepsLineChart / WeeklySummary
```

---

## 路由设计

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 自动重定向到 `/record` | 默认首页 |
| `/login` | LoginView | 登录与注册 |
| `/record` | RecordView | 运动记录看板 |
| `/assess` | AssessView | 健康评估 |
| `/plan` | PlanView | 方案规划 |
| `/learn` | LearnView | 运动技能学习 |

---

## 用户系统

当前用户系统包括：

- 注册账号
- 登录账号
- session 状态保持
- 刷新页面后恢复当前用户
- Navbar 显示默认用户头像
- 点击头像打开用户资料面板
- 用户资料面板内支持语言设置
- 支持登出

当前版本中，账号数据已保存到 MongoDB。用户资料面板中的部分展示状态可继续扩展为数据库持久化，例如：

```js
{
  displayName: "User Name",
  avatar: "avatar-1"
}
```

---

## 运动记录模块

运动记录模块包括：

- 今日步数
- 今日运动时长
- 今日热量消耗
- 快速记录表单
- 历史记录表格
- 周 / 月视图切换
- 本周 / 本月步数趋势折线图
- 周总结统计

### 数据保存

运动记录会保存到 MongoDB 的 `records` collection 中。

不同用户的数据通过 `userId` 区分，因此账号之间互不影响。

### 趋势图

`StepsLineChart.vue` 使用 SVG 绘制折线和数据点，并通过鼠标悬停显示单点步数。

图表会根据视图自动切换：

```text
Week View  → 最近 7 条记录
Month View → 当前用户全部记录
```

---

## 健康评估模块

健康评估模块采用分步式流程：

```text
Basic Info
→ Exercise Habit
→ Lifestyle
→ Result
```

评估内容包括：

- 身高
- 体重
- 年龄
- 性别
- 运动频率
- 运动类型
- 久坐时长
- 睡眠质量

系统会根据输入生成：

- BMI
- BMI 分类
- 活动水平
- 活动描述
- 个性化建议

### 数据保存

用户点击 `Save Result` 后，评估结果会保存到 MongoDB 的 `assessments` collection。

再次进入页面时，系统会自动读取当前用户最新保存的评估结果。

用户也可以点击 `Discard Result` 删除最新保存的评估，并重新开始评估流程。

---

## 国际化（i18n）系统

系统支持：

```text
中文
English
```

翻译文件位于：

```text
src/i18n/zh.json
src/i18n/en.json
```

使用方式：

```ts
const { t } = useI18n()

表述示例：
t('nav.record')
t('record.colSteps')
t('assess.saveResult')
```

翻译键采用点分结构：

```text
nav.record
record.today
record.weekStepsTrend
assess.saveResult
plan.weekPlan
learn.categoryTitle
```

如果添加新文本，应同时更新：

```text
zh.json
en.json
```

---

## 样式系统

全局样式变量定义在：

```text
src/styles/variables.css
```

主要包括：

| 分类 | 前缀 | 示例 |
|------|------|------|
| 颜色 | `--color-` | `--color-primary` |
| 间距 | `--space-` | `--space-4` |
| 字体大小 | `--font-size-` | `--font-size-body` |
| 圆角 | `--radius-` | `--radius-md` |
| 阴影 | `--shadow-` | `--shadow-card` |
| 过渡 | `--transition-` | `--transition-fast` |
| 内容宽度 | `--content-max-width` | 移动端优先布局 |

设计风格：

- 温暖森林绿主色
- 简洁卡片式布局
- 移动端优先
- 轻量交互反馈
- 分步引导式体验

---

## 开发规范

### Vue 组件

- 使用 `<script setup lang="ts">`
- Props 必须定义 TypeScript 类型
- 样式使用 `<style scoped>`
- 组件名使用 PascalCase
- 目录名使用 kebab-case
- 展示文本应优先使用 `t()` 翻译函数

---

### Pinia Store

- 全局共享状态放在 `src/stores/`
- 页面局部状态放在组件内部
- 后端数据通过 store action 统一请求
- 避免组件直接分散请求 API

---

### 后端 API

- API 路由集中在 `server.js`
- 需要用户身份的数据必须检查登录状态
- 用户数据必须绑定 `userId`
- MongoDB collection 通过 helper 函数获取

---

## 构建生产版本

进入前端目录：

```bash
npm run build
```

构建产物输出到：

```text
dist/
```

预览构建版本：

```bash
npm run preview
```

---

## 演示流程建议

建议按照以下顺序演示：

1. 注册一个新用户
2. 登录后进入运动记录页面
3. 展示新用户历史记录为空
4. 添加几条运动记录
5. 展示今日概览、历史记录、折线图和周总结同步变化
6. 刷新页面，展示数据仍然存在
7. 登出并切换另一个用户
8. 展示不同用户的数据互不影响
9. 进入健康评估页面
10. 完成评估并保存结果
11. 刷新页面，展示评估结果仍然保留
12. 点击 Discard Result，展示结果被清除

---

## 当前已实现功能

- Vue 3 + TypeScript 前端
- Pinia 状态管理
- Vue Router 页面导航
- 中英文国际化
- 登录 / 注册系统
- session 登录状态保持
- MongoDB Atlas 云数据库
- 运动记录保存与读取
- 多用户运动数据隔离
- 健康评估保存与读取
- 健康评估结果丢弃
- 本周 / 本月步数趋势图
- 用户资料侧边面板
- 首次使用引导浮层
- 方案规划与技能学习模块

---

## 后续可扩展方向

- 密码加密存储
- 用户头像和显示名持久化
- 方案规划结果保存到数据库
- 技能学习进度保存
- 更完整的 Profile 页面
- 更丰富的数据可视化图表
- 响应式桌面端布局优化

---

## 浏览器支持

- Chrome / Edge 最新版
- Firefox 最新版
- Safari 最新版

---

## 许可证

MIT License
