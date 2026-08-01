import { http, HttpResponse } from 'msw'
import type { ApiResponse } from '@/types/common'
import {
  generateCustomerList,
  generateCustomerDetail,
  createCustomerInMock,
  updateCustomerInMock,
  deleteCustomerFromMock,
} from '@/views/customer/mock'
import type {
  CustomerListResult,
  CustomerDetail,
  Customer,
  CustomerForm,
} from '@/views/customer/types'
import {
  generateLeadList,
  createLeadInMock,
  updateLeadInMock,
  deleteLeadFromMock,
  allLeads,
} from '@/views/lead/mock'
import type { LeadListResult, Lead, LeadForm } from '@/views/lead/types'
import {
  generateIntentionList,
  createIntentionInMock,
  updateIntentionInMock,
  deleteIntentionFromMock,
  allIntentions,
} from '@/views/intention/mock'
import type { IntentionListResult, Intention, IntentionForm } from '@/views/intention/types'
import {
  generateEquipmentList,
  createEquipmentInMock,
  updateEquipmentInMock,
  deleteEquipmentFromMock,
  allEquipments,
} from '@/views/equipment/mock'
import type { EquipmentListResult, Equipment, EquipmentForm } from '@/views/equipment/types'

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

  http.post('/api/v1/customers', async ({ request }) => {
    const body = (await request.json()) as Partial<CustomerForm>
    const customer = createCustomerInMock(body)
    return HttpResponse.json(ok<Customer>(customer), { status: 201 })
  }),

  http.put('/api/v1/customers/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const body = (await request.json()) as Partial<CustomerForm>
    const customer = updateCustomerInMock(id, body)
    if (!customer) {
      return HttpResponse.json(
        { success: false, code: 404, message: '客户不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<Customer>(customer))
  }),

  http.delete('/api/v1/customers/:id', ({ params }) => {
    const id = Number(params.id)
    const success = deleteCustomerFromMock(id)
    if (!success) {
      return HttpResponse.json(
        { success: false, code: 404, message: '客户不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok({ success: true }))
  }),

  http.get('/api/v1/leads', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const size = Number(url.searchParams.get('size') ?? '20')
    const keyword = url.searchParams.get('keyword') ?? undefined
    const sourceType = url.searchParams.get('sourceType')
      ? Number(url.searchParams.get('sourceType'))
      : undefined
    const status = url.searchParams.get('status') ?? undefined
    const tabType = url.searchParams.get('tabType') ?? undefined

    const result = generateLeadList({
      pageNum: page,
      pageSize: size,
      keyword,
      sourceType,
      status,
      tabType,
    })
    return HttpResponse.json(ok<LeadListResult>(result))
  }),

  http.get('/api/v1/leads/:id', ({ params }) => {
    const id = Number(params.id)
    const lead = allLeads.find((l) => l.leadId === id) || null
    if (!lead) {
      return HttpResponse.json(
        { success: false, code: 404, message: '线索不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<Lead>(lead))
  }),

  http.post('/api/v1/leads', async ({ request }) => {
    const body = (await request.json()) as Partial<LeadForm>
    const lead = createLeadInMock(body)
    return HttpResponse.json(ok<Lead>(lead), { status: 201 })
  }),

  http.put('/api/v1/leads/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const body = (await request.json()) as Partial<LeadForm>
    const lead = updateLeadInMock(id, body)
    if (!lead) {
      return HttpResponse.json(
        { success: false, code: 404, message: '线索不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<Lead>(lead))
  }),

  http.delete('/api/v1/leads/:id', ({ params }) => {
    const id = Number(params.id)
    const success = deleteLeadFromMock(id)
    if (!success) {
      return HttpResponse.json(
        { success: false, code: 404, message: '线索不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok({ success: true }))
  }),

  http.get('/api/v1/intentions', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const size = Number(url.searchParams.get('size') ?? '20')
    const keyword = url.searchParams.get('keyword') ?? undefined
    const businessType = url.searchParams.get('businessType')
      ? Number(url.searchParams.get('businessType'))
      : undefined
    const status = url.searchParams.get('status') ?? undefined
    const tabType = url.searchParams.get('tabType') ?? undefined

    const result = generateIntentionList({
      pageNum: page,
      pageSize: size,
      keyword,
      businessType,
      status,
      tabType,
    })
    return HttpResponse.json(ok<IntentionListResult>(result))
  }),

  http.get('/api/v1/intentions/:id', ({ params }) => {
    const id = Number(params.id)
    const intention = allIntentions.find((i) => i.intentionId === id) || null
    if (!intention) {
      return HttpResponse.json(
        { success: false, code: 404, message: '意向不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<Intention>(intention))
  }),

  http.post('/api/v1/intentions', async ({ request }) => {
    const body = (await request.json()) as Partial<IntentionForm>
    const intention = createIntentionInMock(body)
    return HttpResponse.json(ok<Intention>(intention), { status: 201 })
  }),

  http.put('/api/v1/intentions/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const body = (await request.json()) as Partial<IntentionForm>
    const intention = updateIntentionInMock(id, body)
    if (!intention) {
      return HttpResponse.json(
        { success: false, code: 404, message: '意向不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<Intention>(intention))
  }),

  http.delete('/api/v1/intentions/:id', ({ params }) => {
    const id = Number(params.id)
    const success = deleteIntentionFromMock(id)
    if (!success) {
      return HttpResponse.json(
        { success: false, code: 404, message: '意向不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok({ success: true }))
  }),

  http.get('/api/v1/equipment', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const size = Number(url.searchParams.get('size') ?? '20')
    const keyword = url.searchParams.get('keyword') ?? undefined
    const status = url.searchParams.get('status') ?? undefined
    const tabType = url.searchParams.get('tabType') ?? undefined

    const result = generateEquipmentList({
      pageNum: page,
      pageSize: size,
      keyword,
      status,
      tabType,
    })
    return HttpResponse.json(ok<EquipmentListResult>(result))
  }),

  http.get('/api/v1/equipment/:id', ({ params }) => {
    const id = Number(params.id)
    const equipment = allEquipments.find((e) => e.equipmentId === id) || null
    if (!equipment) {
      return HttpResponse.json(
        { success: false, code: 404, message: '设备不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<Equipment>(equipment))
  }),

  http.post('/api/v1/equipment', async ({ request }) => {
    const body = (await request.json()) as Partial<EquipmentForm>
    const equipment = createEquipmentInMock(body)
    return HttpResponse.json(ok<Equipment>(equipment), { status: 201 })
  }),

  http.put('/api/v1/equipment/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const body = (await request.json()) as Partial<EquipmentForm>
    const equipment = updateEquipmentInMock(id, body)
    if (!equipment) {
      return HttpResponse.json(
        { success: false, code: 404, message: '设备不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<Equipment>(equipment))
  }),

  http.delete('/api/v1/equipment/:id', ({ params }) => {
    const id = Number(params.id)
    const success = deleteEquipmentFromMock(id)
    if (!success) {
      return HttpResponse.json(
        { success: false, code: 404, message: '设备不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok({ success: true }))
  }),
]
