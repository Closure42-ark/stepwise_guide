<script setup lang="ts">
import type { SleepEventType } from '@/types'

defineProps<{
  type: SleepEventType
}>()
</script>

<template>
  <svg
    class="sleep-tool-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="type === 'coffee'">
      <path d="M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
      <path d="M16 10h2a2 2 0 0 1 0 4h-2" />
      <path d="M7 4v2" />
      <path d="M11 4v2" />
    </template>
    <template v-else-if="type === 'nap'">
      <path d="M4 13a6 6 0 0 0 11.5 2H20" />
      <path d="M6 10h.01" />
      <path d="M9 8h.01" />
      <path d="M12 6h.01" />
    </template>
    <template v-else-if="type === 'melatonin'">
      <path d="M20 15.5A8.5 8.5 0 1 1 8.5 4A6.5 6.5 0 0 0 20 15.5z" />
    </template>
    <template v-else-if="type === 'meditation'">
      <circle cx="12" cy="6.5" r="2.5" />
      <path d="M8 21c.8-2.6 2.1-4 4-4s3.2 1.4 4 4" />
      <path d="M7.5 13c1.3.7 2.8 1 4.5 1s3.2-.3 4.5-1" />
    </template>
    <template v-else-if="type === 'screen'">
      <rect x="4" y="5" width="16" height="11" rx="2" />
      <path d="M10 19h4" />
      <path d="M12 16v3" />
    </template>
    <template v-else>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M8 4v4" />
      <path d="M16 4v4" />
      <path d="M4 11h16" />
    </template>
  </svg>
</template>

<style scoped>
.sleep-tool-icon {
  width: 18px;
  height: 18px;
}
</style>
