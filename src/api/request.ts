import type { ApiResponse, PageParams, PageResult } from '@/types/common'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

interface RequestOptions extends RequestInit {
  params?: Record<string, unknown>
}

function buildUrl(path: string, params?: Record<string, unknown>): string {
  const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value))
      }
    })
  }
  return url.toString()
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...rest } = options
  const url = buildUrl(path, params)

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...((rest.headers as Record<string, string>) || {}),
    },
    ...rest,
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const data = (await response.json()) as ApiResponse<T>
  if (!data.success) {
    throw new Error(data.message || 'Request failed')
  }

  return data.data
}

export function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  return request<T>(path, { method: 'GET', params })
}

export function post<T>(path: string, body?: unknown, params?: Record<string, unknown>): Promise<T> {
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

export function del<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  return request<T>(path, { method: 'DELETE', params })
}

export function getPage<T>(path: string, params?: PageParams): Promise<PageResult<T>> {
  return get<PageResult<T>>(path, params as Record<string, unknown>)
}

export { request }
