import { http, HttpResponse } from 'msw'
import type { ApiResponse, PageResult } from '@/types/common'
import { generateCustomerList, generateCustomerDetail } from '@/views/customer/mock'
import type { CustomerListResult, CustomerDetail } from '@/views/customer/types'

const ok = <T>(data: T): ApiResponse<T> => ({
  success: true,
  code: 200,
  message: 'ok',
  data,
})

export const handlers = [
  http.post('/api/v1/auth/login', async () =>
    HttpResponse.json(
      ok({
        token: 'mock-jwt-token',
        user: {
          id: '1',
          name: '管理员',
          username: 'admin',
          deptId: '1',
          deptName: '销售部',
          roles: ['admin'],
          permissions: ['*'],
        },
      }),
    ),
  ),

  http.get('/api/v1/auth/profile', () =>
    HttpResponse.json(
      ok({
        id: '1',
        name: '管理员',
        username: 'admin',
        deptId: '1',
        deptName: '销售部',
        roles: ['admin'],
        permissions: ['*'],
      }),
    ),
  ),

  http.get('/api/v1/customers', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const size = Number(url.searchParams.get('size') ?? '20')
    const keyword = url.searchParams.get('keyword') ?? undefined
    const regionCode = url.searchParams.get('regionCode') ?? undefined
    const customerLevel = url.searchParams.get('customerLevel')
      ? Number(url.searchParams.get('customerLevel'))
      : undefined
    const healthLevel = url.searchParams.get('healthLevel') ?? undefined
    const ownerId = url.searchParams.get('ownerId')
      ? Number(url.searchParams.get('ownerId'))
      : undefined
    const tabType = url.searchParams.get('tabType') ?? undefined

    const result = generateCustomerList({
      pageNum: page,
      pageSize: size,
      keyword,
      regionCode,
      customerLevel,
      healthLevel,
      ownerId,
      tabType,
    })
    return HttpResponse.json(ok<CustomerListResult>(result))
  }),

  http.get('/api/v1/customers/:id', ({ params }) => {
    const id = Number(params.id)
    const detail = generateCustomerDetail(id)
    if (!detail) {
      return HttpResponse.json(
        { success: false, code: 404, message: '客户不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<CustomerDetail>(detail))
  }),

  http.get('/api/v1/leads', () =>
    HttpResponse.json(
      ok<PageResult<Record<string, unknown>>>({
        list: [
          {
            id: 'l1',
            name: '某三甲设备采购',
            source: '展会',
            status: 'FOLLOWING',
            poolType: 'PUBLIC',
            region: '华北',
            createdAt: new Date().toISOString(),
          },
        ],
        total: 1,
        page: 1,
        size: 20,
        pages: 1,
      }),
    ),
  ),
]
