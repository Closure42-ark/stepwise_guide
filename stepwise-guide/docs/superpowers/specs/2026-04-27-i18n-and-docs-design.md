# 国际化 (i18n) 支持 + 项目文档完善 — 设计文档

## 1. 概述

### 1.1 目标
- 为「步步为引 StepWise Guide」系统添加中英双语支持
- 完善 README 项目架构文档和开发指南
- 在关键代码段添加适当注释，方便后续接手开发者

### 1.2 范围
- **i18n**: 全部用户可见文本的中英双语翻译、首次访问语言选择、运行时语言切换
- **文档**: README 重写（架构说明 + 开发指南）
- **注释**: 关键模块（stores、composables、types、复杂组件）补充 JSDoc

---

## 2. 国际化 (i18n) 设计

### 2.1 技术选型：自定义轻量方案

不使用 `vue-i18n` 依赖，而是基于 Pinia store + JSON 翻译文件 + composable 的自定义方案。

**理由**：项目体量适中，自定义方案无额外依赖，且能满足所有需求（嵌套 key、参数插值、响应式）。

### 2.2 文件结构

```
src/i18n/
├── zh.json           # 中文翻译（按模块分层）
├── en.json           # 英文翻译（与 zh.json 结构完全一致）
└── index.ts          # 工具函数：t(key, params)、类型定义

src/stores/
└── i18n.ts           # Pinia store：currentLang、setLanguage()、持久化

src/composables/
└── useI18n.ts        # 组合式函数：导出 t()，供组件 <script setup> 使用
```

### 2.3 翻译 Key 设计

按功能模块分层嵌套，统一用英文点号分隔：

```
nav.record             → 运动记录 / Exercise Record
nav.assess             → 健康评估 / Health Assessment
nav.plan               → 方案规划 / Plan Planning
nav.learn              → 运动技能 / Exercise Skills

record.title           → 运动记录 / Exercise Record
record.today.steps     → 今日步数 / Today's Steps
record.today.duration  → 运动时长 / Exercise Duration
...

assess.title           → 健康评估 / Health Assessment
assess.bmi.label       → BMI 指数 / BMI Index
...

plan.title             → 方案规划 / Plan Planning
...

learn.title            → 运动技能库 / Exercise Skills
...

common.confirm         → 确定 / Confirm
common.cancel          → 取消 / Cancel
common.save            → 保存 / Save

onboarding.welcome     → 欢迎使用步步为引 / Welcome to StepWise Guide
onboarding.selectLang  → 选择语言 / Select Language
...

toast.langSwitch       → 切换语言后需要重新加载页面，确定要切换吗？
                       / Changing language will reload the page. Are you sure?
```

### 2.4 核心数据流

```
┌─────────────────────────────────────────────────────┐
│                     App.vue mount                     │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
         ┌───────────────────────────┐
         │  i18n store initialization │
         │  localStorage.getItem()    │
         └────────┬──────────────────┘
                  │
         ┌────────▼──────────┐
         │  语言偏好存在？      │
         └───┬──────────┬───┘
        No  │          │ Yes
            ▼          ▼
   OnboardingOverlay   跳过引导
   第一步: 语言选择    直接加载
            │          对应语言
            ▼
     用户选择语言
     写入 localStorage
            │
            ▼
     继续后续引导步骤
            │
            ▼
     进入应用，使用选定语言
            │
            ▼
   ┌───────────────────────┐
   │  用户点击 Navbar 语言   │
   │  切换按钮              │
   └───────┬───────────────┘
           ▼
   弹出 BaseModal 确认框
   "需要重新加载页面"
           │
      ┌────┴────┐
      │ 确定     │  取消
      └────┬────┘
           ▼
   写入新语言到 localStorage
   window.location.reload()
```

### 2.5 t() 函数规范

```typescript
type TranslateParams = Record<string, string | number>

function t(key: string, params?: TranslateParams): string
```

- 支持嵌套 key 查找：`t('nav.record')` → 逐层深入对象
- 参数插值：`t('record.duration', { minutes: 30 })` → "运动时长 30 分钟"
- 找不到 key 时：返回 key 本身（graceful fallback）
- 响应式：返回值随语言切换自动更新

### 2.6 语言持久化

- Key：`stepwise-lang`
- 值：`'zh'` 或 `'en'`
- 存储位置：localStorage
- 读取时机：i18n store 初始化时
- 无存储记录时：视为首次访问，通过 OnboardingOverlay 引导选择

---

## 3. 受影响文件清单

### 3.1 新增文件

| 文件 | 说明 |
|---|---|
| `src/i18n/zh.json` | 中文翻译，约 100+ key |
| `src/i18n/en.json` | 英文翻译，与 zh.json 结构一致 |
| `src/i18n/index.ts` | 翻译工具函数 + 类型 |
| `src/stores/i18n.ts` | 语言管理 Pinia store |
| `src/composables/useI18n.ts` | 组合式函数封装 |

### 3.2 需修改文件

| 文件 | 改动内容 |
|---|---|
| `src/main.ts` | 初始化 i18n store |
| `src/App.vue` | 集成语言初始化逻辑 |
| `src/types/index.ts` | 新增 `Language` 类型 |
| `src/components/layout/AppNavbar.vue` | 右上角添加语言切换按钮 |
| `src/components/onboarding/OnboardingOverlay.vue` | 第一步添加语言选择 |
| `src/components/base/BaseModal.vue` | 确保支持确认框（已有） |
| 所有 View 文件 (4个) | 替换硬编码文本为 t() |
| 所有 Component 文件 (约 20+) | 替换硬编码文本为 t() |
| `src/router/index.ts` | 路由 meta.title 改为 i18n key |
| `src/mock/*.ts` | mock 数据中的文本替换为 i18n key |

### 3.3 README 更新

| 部分 | 内容 |
|---|---|
| 项目简介 | 整体定位 + 技术栈 |
| 项目架构 | 完整目录树 + 各层职责 + 模块依赖图 |
| 核心功能 | 四大模块说明 |
| 开发指南 | 环境搭建、新增页面/组件、国际化使用、构建部署 |
| 设计规范 | CSS 变量体系、组件命名规范 |

### 3.4 代码注释

在以下位置添加 JSDoc / 行内注释：
- `src/stores/*.ts` — store 职责、state 说明、action 副作用
- `src/composables/*.ts` — 函数签名、返回值、使用示例
- `src/types/index.ts` — 接口字段说明
- `src/router/index.ts` — 路由守卫、meta 字段说明
- 复杂组件（OnboardingOverlay, GuidedPlanWizard）— 关键逻辑注释

---

## 4. 实施顺序

1. 创建 i18n 基础设施（JSON + store + composable + types）
2. 集成到 main.ts 和 App.vue
3. 改造 OnboardingOverlay（添加语言选择步骤）
4. 改造 AppNavbar（添加语言切换按钮 + 确认框）
5. 替换全项目硬编码文本为 t() 调用（按模块逐个文件进行）
6. 更新 README 文档
7. 补充代码注释
8. 验证：切换语言后页面正确显示对应文本

---

## 5. 设计约束

- 所有组件保持现有结构和样式，i18n 仅替换文本内容
- 不引入任何第三方 i18n 依赖
- 翻译 Key 必须与 zh.json / en.json 保持同步
- 新增文本时必须同时在两个语言文件中添加对应条目
- 切换语言刷新时，当前路由状态会丢失（可接受，符合用户需求）
