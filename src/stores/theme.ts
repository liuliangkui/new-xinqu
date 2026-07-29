import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getSavedTheme, getSystemTheme, setTheme } from '@/utils/theme'

export type Theme = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const current = ref<Theme>(getSavedTheme() || getSystemTheme())

  const isDark = computed(() => current.value === 'dark')

  function set(value: Theme): void {
    current.value = value
    setTheme(value)
  }

  function toggle(): void {
    set(isDark.value ? 'light' : 'dark')
  }

  function init(): void {
    set(current.value)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', (e) => {
      if (!getSavedTheme()) {
        set(e.matches ? 'dark' : 'light')
      }
    })
  }

  return { current, isDark, set, toggle, init }
})
