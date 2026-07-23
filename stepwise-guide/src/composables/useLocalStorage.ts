import { ref, watch } from 'vue'

/**
 * 带自动持久化的 localStorage 响应式数据组合式函数。
 * 数据变化时自动同步到 localStorage，支持深层监听。
 *
 * 用法：const count = useLocalStorage('my-key', 0)
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key)
  const data = ref<T>(stored ? JSON.parse(stored) : defaultValue)

  watch(data, (newVal) => {
    localStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })

  return data
}
