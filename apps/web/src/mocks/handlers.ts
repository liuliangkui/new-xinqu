import { http, HttpResponse } from 'msw'
import type { ApiResponse, PageResult } from '@/types/common'

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

  http.get('/api/v1/customers', () =>
    HttpResponse.json(
      ok<PageResult<Record<string, unknown>>>({
        list: [
          {
            id: 'c1',
            name: '北京协和医院',
            type: '综合医院',
            level: 'STRATEGIC',
            region: '华北',
            status: 'COOPERATING',
            ownerId: '1',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'c2',
            name: '上海瑞金医院',
            type: '综合医院',
            level: 'NORMAL',
            region: '华东',
            status: 'POTENTIAL',
            ownerId: '1',
            createdAt: new Date().toISOString(),
          },
        ],
        total: 2,
        page: 1,
        size: 20,
        pages: 1,
      }),
    ),
  ),

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
