import type { Language } from '@/types'

export type { Language }

type TranslationValue = string | Record<string, unknown>
export type TranslationMap = Record<string, TranslationValue>

/**
 * 通过点号分隔的键路径在嵌套 JSON 中查找对应的翻译文本。
 * 例如 resolveNestedKey({ a: { b: 'hello' } }, 'a.b') => 'hello'
 * 如果路径不存在，则原样返回 key 作为兜底。
 */
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

/**
 * 创建翻译函数 t() 的工厂。
 * @param translations - 语言包对象（如 zh.json / en.json）
 * @returns t(key, params?) - key 支持点号路径，params 用于插值替换 {key} 占位符
 */
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
