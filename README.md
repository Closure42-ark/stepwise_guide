# 步步为引（StepWise Guide）

![Vue 3](https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-≥18-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

> 为运动入门者及规律锻炼意愿者提供记录、评估、规划、学习一体化的极简引导式健康管理网页。

## 🌿 项目简介

**步步为引**是一个面向久坐办公族和运动入门者的健康管理网页应用。系统通过简约、引导充分的交互设计，帮助用户逐步建立运动记录、健康评估、运动规划和技能学习的习惯。

本项目已从纯前端原型扩展为轻量级全栈系统，支持用户注册、登录、运动记录持久化、健康评估结果保存，以及基于账号的数据隔离。

## ✨ 核心功能

- ✅ **记录运动** — 追踪每日步数、运动时长、运动类型和消耗热量
- ✅ **查看趋势** — 通过本周 / 本月折线图观察步数变化
- ✅ **健康评估** — 基于 BMI、运动习惯和生活方式生成个性化建议
- ✅ **保存评估** — 将健康评估结果保存到数据库，并支持丢弃结果
- ✅ **方案规划** — 选择预设计划或生成个性化运动方案
- ✅ **技能学习** — 分步骤学习正确运动方法，降低受伤风险
- ✅ **用户系统** — 支持登录、注册、登出和用户资料面板

---

## 🚀 快速开始

本项目分为前端和后端两个部分，需要同时运行。

### 前置要求

- Node.js >= 18
- npm >= 9
- MongoDB Atlas 云端数据库
- 现代浏览器，例如 Chrome / Edge / Firefox / Safari

### 启动方式

开发时需要同时打开两个终端：

**Terminal 1 — 后端**
```bash
cd stepwise-server
node server.js
```

**Terminal 2 — 前端**
```bash
cd stepwise-guide
npm install
npm run dev
```

- 前端地址：`http://localhost:5173/`
- 后端地址：`http://localhost:3000/`

后端正常启动后终端应显示：
```
MongoDB connected
Server running at http://localhost:3000
```

---

## 🏗️ 项目架构

### 总体结构

```
stepwise-guide-v4/
├── stepwise-guide/                  # Vue 前端项目
│   ├── public/
│   └── src/
│       ├── assets/                  # 图片、字体等资源
│       ├── components/              # Vue 组件
│       ├── views/                   # 页面视图
│       ├── router/                  # 路由配置
│       ├── stores/                  # Pinia 状态管理
│       ├── i18n/                    # 中英文翻译文件
│       ├── composables/             # Vue 组合式函数
│       ├── styles/                  # 全局样式系统
│       ├── types/                   # TypeScript 类型定义
│       ├── mock/                    # 静态模拟数据
│       ├── App.vue
│       └── main.ts
│
└── stepwise-server/                 # Express 后端项目
    ├── server.js                    # 后端入口与 API 定义
    └── package.json
```

### 数据流

```
Vue Views → Pinia Stores → Express Backend → MongoDB Atlas
```

以运动记录为例：

```
QuickRecordForm (submit)
  → recordStore.saveTodayRecord()
  → POST /api/records
  → MongoDB records collection
```

---

## 🗂️ 前端目录结构

```
src/
├── components/
│   ├── base/                        # 基础通用组件（Button、Input、Modal）
│   ├── layout/                      # 全局布局组件（AppNavbar、DailyTipBanner）
│   ├── record/                      # 运动记录模块
│   │   ├── DataCard.vue
│   │   ├── QuickRecordForm.vue
│   │   ├── RecordTable.vue
│   │   ├── StepsLineChart.vue
│   │   ├── ViewToggle.vue
│   │   └── WeeklySummary.vue
│   ├── assessment/                  # 健康评估模块
│   ├── plan/                        # 方案规划模块
│   ├── learn/                       # 技能学习模块
│   ├── onboarding/                  # 首次使用引导浮层
│   └── user/                        # 用户资料面板
│
├── views/
│   ├── LoginView.vue
│   ├── RecordView.vue
│   ├── AssessView.vue
│   ├── PlanView.vue
│   └── LearnView.vue
│
├── stores/
│   ├── user.ts
│   ├── record.ts
│   ├── assessment.ts
│   ├── plan.ts
│   ├── onboarding.ts
│   └── i18n.ts
│
├── i18n/
│   ├── zh.json
│   ├── en.json
│   └── index.ts
│
└── styles/
    ├── variables.css
    ├── reset.css
    ├── typography.css
    ├── animations.css
    └── global.css
```

---

## 🛣️ 路由设计

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 自动重定向 | 默认跳转到 `/record` |
| `/login` | LoginView | 登录与注册 |
| `/record` | RecordView | 运动记录看板 |
| `/assess` | AssessView | 健康评估 |
| `/plan` | PlanView | 方案规划 |
| `/learn` | LearnView | 运动技能学习 |

---

## 📡 后端 API

后端技术栈：**Express + MongoDB Node.js Driver + express-session**

### 基础测试

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/` | 测试后端是否运行 |
| GET | `/api/test-db` | 测试数据库连接 |

### 用户认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册用户 |
| POST | `/api/auth/login` | 登录用户 |
| GET | `/api/auth/me` | 获取当前登录用户 |
| POST | `/api/auth/logout` | 登出用户 |

### 运动记录

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/records` | 获取当前用户的运动记录 |
| POST | `/api/records` | 保存一条运动记录 |

### 健康评估

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/assessments/latest` | 获取当前用户最新评估 |
| POST | `/api/assessments` | 保存健康评估 |
| DELETE | `/api/assessments/latest` | 删除最新评估 |

---

## 🗄️ 数据库设计

数据库名称：`stepwise`

```
stepwise
├── users          # 用户账号信息
├── records        # 运动记录
└── assessments    # 健康评估结果
```

### users

```js
{
  _id: ObjectId,
  username: string,
  password: string,
  createdAt: Date
}
```

### records

```js
{
  _id: ObjectId,
  userId: string,      // 用于隔离不同用户数据
  date: string,
  weekday: string,
  steps: number,
  exercise: string,
  duration: number,
  calories: number,
  createdAt: Date
}
```

### assessments

```js
{
  _id: ObjectId,
  userId: string,
  basicInfo: { height, weight, age, gender },
  exerciseHabit: { frequency, types },
  lifestyle: { sittingHours, sleepQuality },
  result: { bmi, bmiCategory, activityLevel, suggestions },
  createdAt: Date
}
```

---

## 🌐 国际化（i18n）

支持 **中文** 和 **English** 双语切换，翻译文件位于 `src/i18n/`。

```ts
const { t } = useI18n()
t('nav.record')       // 导航
t('record.colSteps')  // 运动记录
t('assess.saveResult') // 健康评估
```

---

## 🎨 样式系统

全局变量定义在 `src/styles/variables.css`：

| 分类 | 前缀 | 示例 |
|------|------|------|
| 颜色 | `--color-` | `--color-primary` |
| 间距 | `--space-` | `--space-4` |
| 字体大小 | `--font-size-` | `--font-size-body` |
| 圆角 | `--radius-` | `--radius-md` |
| 阴影 | `--shadow-` | `--shadow-card` |
| 过渡 | `--transition-` | `--transition-fast` |

设计风格：温暖森林绿主色 · 简洁卡片式布局 · 移动端优先 · 分步引导式体验

---

## 🧪 演示流程建议

1. 注册一个新用户
2. 登录后进入运动记录页面，展示新用户记录为空
3. 添加几条运动记录，观察今日概览、历史表格、折线图同步变化
4. 刷新页面，确认数据持久化
5. 登出并切换另一个用户，确认数据隔离
6. 进入健康评估，完成评估并保存结果
7. 刷新页面，确认评估结果保留
8. 点击 Discard Result，确认结果可删除

---

## 🔧 开发规范

**Vue 组件**
- 使用 `<script setup lang="ts">`
- Props 必须定义 TypeScript 类型
- 样式使用 `<style scoped>`
- 展示文本使用 `t()` 翻译函数

**Pinia Store**
- 全局共享状态放在 `src/stores/`
- 后端数据通过 store action 统一请求

**后端 API**
- 需要用户身份的接口必须校验登录状态
- 用户数据必须绑定 `userId`

---

## 📦 构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

构建产物输出到 `dist/`。

---

## 🌱 后续可扩展方向

- 密码加密存储
- 用户头像和显示名持久化
- 方案规划结果保存到数据库
- 技能学习进度保存
- 更完整的 Profile 页面
- 更丰富的数据可视化图表
- 响应式桌面端布局优化

---

## 📄 许可证

[MIT License](LICENSE)
