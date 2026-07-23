import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Language } from '@/types'
import zh from '@/i18n/zh.json'
import en from '@/i18n/en.json'
import { createT, type TranslationMap } from '@/i18n'

// localStorage 中存储语言偏好的键名
const STORAGE_KEY = 'stepwise-lang'

// 语言包映射表：新增语言时在此处添加 import 和条目即可
const translations: Record<Language, TranslationMap> = { zh, en }

// 语言状态管理 Store
export const useI18nStore = defineStore('i18n', () => {
  // 从 localStorage 恢复语言设置，若无则默认中文
  const savedLang = localStorage.getItem(STORAGE_KEY) as Language | null
  const currentLang = ref<Language>(savedLang || 'zh')

  // 根据当前语言动态生成翻译函数（computed 保证语言切换时自动更新）
  const t = computed(() => createT(translations[currentLang.value]))

  // 切换语言并持久化到 localStorage
  function setLanguage(lang: Language) {
    currentLang.value = lang
    localStorage.setItem(STORAGE_KEY, lang)
  }

  // 切换语言后重新加载页面，确保所有组件重新渲染
  function reloadWithLanguage(lang: Language) {
    setLanguage(lang)
    window.location.reload()
  }

  return { currentLang, t, setLanguage, reloadWithLanguage }
})
