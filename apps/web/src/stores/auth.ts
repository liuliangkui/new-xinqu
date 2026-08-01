import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login, getProfile, type LoginResult, type ProfileResult } from '@/api/auth'

export interface UserInfo {
  id: string
  name: string
  avatar?: string
  deptId?: string
  deptName?: string
  roles: string[]
  permissions: string[]
}

const TOKEN_KEY = 'xqcop_token'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const roles = computed(() => user.value?.roles ?? [])
  const permissions = computed(() => user.value?.permissions ?? [])

  function setToken(newToken: string | null) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  function setUser(profile: ProfileResult) {
    user.value = {
      id: profile.id,
      name: profile.name,
      deptId: profile.departmentId,
      roles: profile.roleIds || [],
      permissions: profile.permissions || [],
    }
  }

  async function loginByCredentials(username: string, password: string) {
    const res = await login(username, password)
    setToken(res.accessToken)
    const profile = await getProfile()
    setUser(profile)
  }

  async function init() {
    if (!token.value) return
    try {
      const profile = await getProfile()
      setUser(profile)
    } catch {
      setToken(null)
      user.value = null
    }
  }

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

  function logout(): void {
    setToken(null)
    user.value = null
  }

  return {
    user,
    token,
    isLoggedIn,
    roles,
    permissions,
    loginByCredentials,
    init,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    logout,
  }
})
