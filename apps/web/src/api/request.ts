import type { ApiResponse, PageParams, PageResult } from '@/types/common'
import { handleHttpError } from '@/utils/http-error'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT || 30000)

interface RequestOptions extends RequestInit {
  params?: Record<string, unknown>
  timeout?: number
  silent?: boolean
}

function getToken(): string | null {
  return localStorage.getItem('xqcop_token')
}

function buildUrl(path: string, params?: Record<string, unknown>): string {
  const base = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const url = new URL(base, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => url.searchParams.append(key, String(v)))
        } else {
          url.searchParams.append(key, String(value))
        }
      }
    })
  }
  return url.toString()
}

function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit & { timeout?: number },
): Promise<Response> {
  const { timeout = TIMEOUT, ...rest } = init
  return new Promise((resolve, reject) => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      controller.abort()
      reject(new Error('请求超时'))
    }, timeout)

    fetch(input, { ...rest, signal: controller.signal })
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer))
  })
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, timeout, silent, ...rest } = options
  const url = buildUrl(path, params)
  const token = getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(rest.headers as Record<string, string>),
  }

  try {
    const response = await fetchWithTimeout(url, {
      ...rest,
      headers,
      timeout,
    })

    let data: ApiResponse<T>
    try {
      data = (await response.json()) as ApiResponse<T>
    } catch {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    // 认证失败，清理 token 并抛出错误
    if (data.code === 401) {
      localStorage.removeItem('xqcop_token')
      window.location.href = '/login'
    }

    if (!data.success) {
      throw new Error(data.message || '请求失败')
    }

    return data.data
  } catch (error) {
    if (!silent) {
      handleHttpError(error)
    }
    throw error
  }
}

export function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  return request<T>(path, { method: 'GET', params })
}

export function post<T>(
  path: string,
  body?: unknown,
  params?: Record<string, unknown>,
): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    params,
  })
}

export function put<T>(path: string, body?: unknown, params?: Record<string, unknown>): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    params,
  })
}

export function patch<T>(
  path: string,
  body?: unknown,
  params?: Record<string, unknown>,
): Promise<T> {
  return request<T>(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    params,
  })
}

export function del<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  return request<T>(path, { method: 'DELETE', params })
}

export function getPage<T>(path: string, params?: PageParams): Promise<PageResult<T>> {
  return get<PageResult<T>>(path, params as Record<string, unknown>)
}

export { request }
