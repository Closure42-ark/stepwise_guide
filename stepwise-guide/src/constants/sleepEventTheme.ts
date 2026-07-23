import type { SleepEventType } from '@/types'

export interface SleepEventTheme {
  color: string
  tint: string
  border: string
}

export const sleepEventTheme: Record<SleepEventType, SleepEventTheme> = {
  coffee: {
    color: '#C7783D',
    tint: 'rgba(199, 120, 61, 0.14)',
    border: 'rgba(199, 120, 61, 0.30)',
  },
  nap: {
    color: '#6D6EEA',
    tint: 'rgba(109, 110, 234, 0.14)',
    border: 'rgba(109, 110, 234, 0.30)',
  },
  screen: {
    color: '#3B82F6',
    tint: 'rgba(59, 130, 246, 0.14)',
    border: 'rgba(59, 130, 246, 0.30)',
  },
  melatonin: {
    color: '#8B5CF6',
    tint: 'rgba(139, 92, 246, 0.14)',
    border: 'rgba(139, 92, 246, 0.30)',
  },
  meditation: {
    color: '#22A06B',
    tint: 'rgba(34, 160, 107, 0.14)',
    border: 'rgba(34, 160, 107, 0.30)',
  },
  shift: {
    color: '#52637A',
    tint: 'rgba(82, 99, 122, 0.14)',
    border: 'rgba(82, 99, 122, 0.30)',
  },
}
