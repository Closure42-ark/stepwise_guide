<script setup lang="ts">
defineProps<{
  skillId: string
}>()
</script>

<template>
  <svg
    class="skill-card-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="skillId === 'neck-stretch'">
      <path d="M12 4v6" />
      <path d="M12 10c-2.8 0-4.5 1.8-4.5 4.4V18" />
      <path d="M12 10c2.8 0 4.5 1.8 4.5 4.4V18" />
      <path d="M8 6c1-.9 2.4-1.4 4-1.4S15 5.1 16 6" />
    </template>
    <template v-else-if="skillId === 'shoulder-circle'">
      <path d="M7 10a5 5 0 0 1 10 0" />
      <path d="M17 14a5 5 0 0 1-10 0" />
      <path d="M7 10H4" />
      <path d="M17 14h3" />
    </template>
    <template v-else-if="skillId === 'bodyweight-squat'">
      <path d="M9 5h6" />
      <path d="M10 9l-2 4" />
      <path d="M14 9l2 4" />
      <path d="M8 13h8" />
      <path d="M9 17l-2 2" />
      <path d="M15 17l2 2" />
    </template>
    <template v-else-if="skillId === 'running-posture'">
      <circle cx="15.5" cy="5.5" r="1.5" />
      <path d="M13 9l2.5 2 2-1" />
      <path d="M12 19l2-4-3-2-2 3" />
      <path d="M14 11l-4 2" />
      <path d="M18 18l-3-3" />
    </template>
    <template v-else-if="skillId === 'cat-cow'">
      <path d="M5 15c2.2 0 2.8-4 5.5-4s3.2 3 5.5 3 2-.8 3-2" />
      <path d="M5 15c1.5 2 3.8 3 7 3 3.2 0 5.2-.8 7-3" />
      <path d="M7 10c.8-1.8 2-3 4-3s3.2 1.2 4 3" />
    </template>
    <template v-else>
      <path d="M8 6h8" />
      <path d="M7 10v5" />
      <path d="M17 10v5" />
      <path d="M7 15c1.2 2.7 3 4 5 4s3.8-1.3 5-4" />
    </template>
  </svg>
</template>

<style scoped>
.skill-card-icon {
  width: 28px;
  height: 28px;
}
</style>
