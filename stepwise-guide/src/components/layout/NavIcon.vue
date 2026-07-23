<script setup lang="ts">
defineProps<{
  name: 'record' | 'assess' | 'plan' | 'learn' | 'timer' | 'basicInfo' | 'user' | 'login' | 'play' | 'pause' | 'stop' | 'lock' | 'lockOpen'
}>()
</script>

<template>
  <svg
    class="nav-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'record'">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-3" />
    </template>
    <template v-else-if="name === 'assess'">
      <path d="M19 12.5A7.5 7.5 0 1 1 11.5 5a6 6 0 0 0 7.5 7.5Z" />
      <path d="m16.8 4.5.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5.5-1.2Z" />
    </template>
    <template v-else-if="name === 'plan'">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M4 10h16" />
      <path d="M9 15l2 2 4-4" />
    </template>
    <template v-else-if="name === 'learn'">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
      <path d="M8 6h8" />
      <path d="M8 10h6" />
    </template>
    <template v-else-if="name === 'timer'">
      <circle cx="12" cy="13" r="7" />
      <path d="M9 2h6" />
      <path d="M12 6V3" />
      <path d="M12 13l3-2" />
    </template>
    <template v-else-if="name === 'basicInfo'">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="10" cy="11" r="2" />
      <path d="M7 16c.7-1.4 1.7-2 3-2s2.3.6 3 2" />
      <path d="M14.5 10h2.5" />
      <path d="M14.5 14h2.5" />
    </template>
    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </template>
    <template v-else-if="name === 'play'">
      <path d="M8 5v14l11-7z" />
    </template>
    <template v-else-if="name === 'pause'">
      <path d="M8 5v14" />
      <path d="M16 5v14" />
    </template>
    <template v-else-if="name === 'stop'">
      <rect x="7" y="7" width="10" height="10" rx="1" />
    </template>
    <template v-else-if="name === 'lock'">
      <rect x="6" y="11" width="12" height="9" rx="2" />
      <path d="M9 11V8a3 3 0 0 1 6 0v3" />
    </template>
    <template v-else-if="name === 'lockOpen'">
      <rect x="6" y="11" width="12" height="9" rx="2" />
      <path d="M15 11V8a3 3 0 1 0-6 0" />
    </template>
    <template v-else>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </template>
  </svg>
</template>

<style scoped>
.nav-icon {
  width: 22px;
  height: 22px;
}
</style>
