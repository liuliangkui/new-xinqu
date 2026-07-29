import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  id: number
  name: string
  avatar?: string
  deptId: number
  deptName: string
  roles: string[]
  permissions: string[]
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const token = ref<string | null>(localStorage.getItem('xinqu-token'))

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const roles = computed(() => user.value?.roles ?? [])
  const permissions = computed(() => user.value?.permissions ?? [])

  function hasRole(role: string): boolean {
    return roles.value.includes(role) || roles.value.includes('super_admin')
  }

  function hasAnyRole(roleList: string[]): boolean {
    if (roles.value.includes('super_admin')) return true
    return roleList.some((r) => roles.value.includes(r))
  }

  function hasPermission(perm: string): boolean {
    if (roles.value.includes('super_admin')) return true
    return permissions.value.includes(perm) || permissions.value.includes('*')
  }

  function hasAnyPermission(permList: string[]): boolean {
    if (roles.value.includes('super_admin')) return true
    if (permissions.value.includes('*')) return true
    return permList.some((p) => permissions.value.includes(p))
  }

  function login(newToken: string, userInfo: UserInfo): void {
    token.value = newToken
    user.value = userInfo
    localStorage.setItem('xinqu-token', newToken)
  }

  function logout(): void {
    token.value = null
    user.value = null
    localStorage.removeItem('xinqu-token')
  }

  return {
    user,
    token,
    isLoggedIn,
    roles,
    permissions,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    login,
    logout,
  }
})
