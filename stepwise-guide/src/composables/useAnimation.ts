import { ref, onMounted } from 'vue'

/**
 * 数字滚动动画组合式函数。
 * 使用 ease-out cubic 缓动函数，在指定时长内从当前值平滑过渡到目标值。
 *
 * @param target - 目标数值
 * @param duration - 动画时长（毫秒，默认 600）
 * @returns current - 当前动画值（响应式），animate() - 重新触发动画
 */
export function useAnimatedNumber(target: number, duration = 600) {
  const current = ref(0)
  const isAnimating = ref(false)

  function animate() {
    isAnimating.value = true
    const start = current.value
    const diff = target - start
    const startTime = performance.now()

    function step(timestamp: number) {
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic：1 - (1 - t)³，使动画先快后慢
      const eased = 1 - Math.pow(1 - progress, 3)
      current.value = Math.round(start + diff * eased)

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        isAnimating.value = false
      }
    }

    requestAnimationFrame(step)
  }

  onMounted(() => {
    animate()
  })

  return { current, isAnimating, animate }
}
