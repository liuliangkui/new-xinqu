import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SidebarState {
  collapsed: boolean
  mobileOpen: boolean
}

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const sidebarMobileOpen = ref(false)
  const isMobile = ref(false)
  const pageTitle = ref('')

  function toggleSidebar(): void {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function setMobile(val: boolean): void {
    isMobile.value = val
    if (!val) {
      sidebarMobileOpen.value = false
    }
  }

  function openMobileSidebar(): void {
    sidebarMobileOpen.value = true
  }

  function closeMobileSidebar(): void {
    sidebarMobileOpen.value = false
  }

  function setPageTitle(title: string): void {
    pageTitle.value = title
    document.title = title ? `${title} · 鑫渠 CRM` : '鑫渠 CRM'
  }

  return {
    sidebarCollapsed,
    sidebarMobileOpen,
    isMobile,
    pageTitle,
    toggleSidebar,
    setMobile,
    openMobileSidebar,
    closeMobileSidebar,
    setPageTitle,
  }
})
