import { useI18nStore } from '@/stores/i18n'
import type { Language } from '@/types'
import { storeToRefs } from 'pinia'

/**
 * i18n 组合式函数 - 组件中使用的翻译入口。
 * 封装 store 调用，提供简洁的 t() 函数供模板使用。
 *
 * 用法：
 *   const { t, currentLang, setLanguage } = useI18n()
 *   t('nav.record')          => "运动记录"
 *   t('plan.weekPlan', { n: 1 }) => "第一周"
 */
export function useI18n() {
  const store = useI18nStore()
  const { currentLang } = storeToRefs(store)

  function t(key: string, params?: Record<string, string | number>): string {
    return store.t(key, params)
  }

  function setLanguage(lang: Language) {
    store.setLanguage(lang)
  }

  function reloadWithLanguage(lang: Language) {
    store.reloadWithLanguage(lang)
  }

  return {
    t,
    currentLang,
    setLanguage,
    reloadWithLanguage,
  }
}
