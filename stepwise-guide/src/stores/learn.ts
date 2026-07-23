import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLearnStore = defineStore('learn', () => {
  const isSkillTutorialOpen = ref(false)

  function setSkillTutorialOpen(next: boolean) {
    isSkillTutorialOpen.value = next
  }

  return {
    isSkillTutorialOpen,
    setSkillTutorialOpen,
  }
})
