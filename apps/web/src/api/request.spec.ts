import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { get, post, put, del, request } from './request'

describe('request', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mockFetch(response: { ok: boolean; status: number; statusText?: string; data: unknown }) {
    vi.mocked(fetch).mockResolvedValue({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText || 'OK',
      json: async () => ({
        code: response.status,
        success: response.ok,
        message: response.statusText || 'success',
        data: response.data,
      }),
    } as unknown as Response)
  }

  it('should return data on success', async () => {
    mockFetch({
      ok: true,
      status: 200,
      data: { id: 1 },
    })

    const data = await get('/users')
    expect(data).toEqual({ id: 1 })
  })

  it('should throw error when success is false', async () => {
    mockFetch({
      ok: false,
      status: 400,
      statusText: '参数错误',
      data: null,
    })

    await expect(get('/users')).rejects.toThrow('参数错误')
  })

  it('should add Authorization header when token exists', async () => {
    localStorage.setItem('xqcop_token', 'test-token')
    mockFetch({
      ok: true,
      status: 200,
      data: {},
    })

    await get('/users')
    const call = vi.mocked(fetch).mock.calls[0]!
    expect(call).toBeDefined()
    const init = call[1] as RequestInit
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-token' })
  })

  it('should remove token on 401', async () => {
    localStorage.setItem('xqcop_token', 'test-token')
    mockFetch({
      ok: false,
      status: 401,
      statusText: '未授权',
      data: null,
    })

    await expect(get('/users')).rejects.toThrow('未授权')
    expect(localStorage.getItem('xqcop_token')).toBeNull()
  })
})
