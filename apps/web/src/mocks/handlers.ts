import { http, HttpResponse } from 'msw'
import dayjs from 'dayjs'
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
import {
  generateTicketList,
  createTicketInMock,
  updateTicketInMock,
  deleteTicketFromMock,
  allTickets,
} from '@/views/ticket/mock'
import type { TicketListResult, Ticket, TicketForm } from '@/views/ticket/types'
import {
  generateTaskList,
  createTaskInMock,
  updateTaskInMock,
  deleteTaskFromMock,
  allTasks,
} from '@/views/tasks/mock'
import type { TaskListResult, Task, TaskForm } from '@/views/tasks/types'
import {
  generateApprovalList,
  createApprovalInMock,
  updateApprovalInMock,
  deleteApprovalFromMock,
  allApprovals,
} from '@/views/approval/mock'
import type { ApprovalListResult, Approval, ApprovalForm } from '@/views/approval/types'
import {
  generateAppList,
  createAppInMock,
  updateAppInMock,
  deleteAppFromMock,
  toggleFavoriteInMock,
  allApps,
} from '@/views/apps/mock'
import type { AppListResult, AppItem, AppForm } from '@/views/apps/types'
import { generateWorkbenchData } from '@/views/workbench/mock'
import type { WorkbenchData } from '@/views/workbench/types'
import { generatePerformanceOverview, generatePerformanceList } from '@/views/performance/mock'
import type { PerformanceListResult, PerformanceOverview } from '@/views/performance/types'
import {
  generateCalendarEventList,
  generateCalendarMonthDots,
  generateCalendarStats,
  getCalendarEventById,
  createCalendarEventInMock,
  updateCalendarEventInMock,
  deleteCalendarEventFromMock,
  checkInCalendarEventInMock,
  completeCalendarEventInMock,
} from '@/views/calendar/mock'
import type { CalendarEvent, CalendarEventForm, CalendarEventListResult, CalendarMonthDotsResult, CalendarStatsResult } from '@/views/calendar/types'

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
        accessToken: 'mock-jwt-token',
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
        departmentId: '1',
        roleIds: ['admin'],
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

  http.get('/api/v1/tickets', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const size = Number(url.searchParams.get('size') ?? '20')
    const keyword = url.searchParams.get('keyword') ?? undefined
    const status = url.searchParams.get('status') ?? undefined
    const priority = url.searchParams.get('priority') ?? undefined
    const type = url.searchParams.get('type') ?? undefined
    const tabType = url.searchParams.get('tabType') ?? undefined

    const result = generateTicketList({
      pageNum: page,
      pageSize: size,
      keyword,
      status,
      priority,
      type,
      tabType,
    })
    return HttpResponse.json(ok<TicketListResult>(result))
  }),

  http.get('/api/v1/tickets/:id', ({ params }) => {
    const id = Number(params.id)
    const ticket = allTickets.find((t) => t.ticketId === id) || null
    if (!ticket) {
      return HttpResponse.json(
        { success: false, code: 404, message: '工单不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<Ticket>(ticket))
  }),

  http.post('/api/v1/tickets', async ({ request }) => {
    const body = (await request.json()) as Partial<TicketForm>
    const ticket = createTicketInMock(body)
    return HttpResponse.json(ok<Ticket>(ticket), { status: 201 })
  }),

  http.put('/api/v1/tickets/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const body = (await request.json()) as Partial<TicketForm>
    const ticket = updateTicketInMock(id, body)
    if (!ticket) {
      return HttpResponse.json(
        { success: false, code: 404, message: '工单不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<Ticket>(ticket))
  }),

  http.delete('/api/v1/tickets/:id', ({ params }) => {
    const id = Number(params.id)
    const success = deleteTicketFromMock(id)
    if (!success) {
      return HttpResponse.json(
        { success: false, code: 404, message: '工单不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok({ success: true }))
  }),

  http.get('/api/v1/tasks', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const size = Number(url.searchParams.get('size') ?? '20')
    const keyword = url.searchParams.get('keyword') ?? undefined
    const taskType = url.searchParams.get('taskType') ?? undefined
    const priority = url.searchParams.get('priority') ?? undefined
    const status = url.searchParams.get('status') ?? undefined
    const tabType = url.searchParams.get('tabType') ?? undefined

    const result = generateTaskList({
      pageNum: page,
      pageSize: size,
      keyword,
      taskType,
      priority,
      status,
      tabType,
    })
    return HttpResponse.json(ok<TaskListResult>(result))
  }),

  http.get('/api/v1/tasks/:id', ({ params }) => {
    const id = Number(params.id)
    const task = allTasks.find((t) => t.taskId === id) || null
    if (!task) {
      return HttpResponse.json(
        { success: false, code: 404, message: '任务不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<Task>(task))
  }),

  http.post('/api/v1/tasks', async ({ request }) => {
    const body = (await request.json()) as Partial<TaskForm>
    const task = createTaskInMock(body)
    return HttpResponse.json(ok<Task>(task), { status: 201 })
  }),

  http.put('/api/v1/tasks/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const body = (await request.json()) as Partial<TaskForm>
    const task = updateTaskInMock(id, body)
    if (!task) {
      return HttpResponse.json(
        { success: false, code: 404, message: '任务不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<Task>(task))
  }),

  http.delete('/api/v1/tasks/:id', ({ params }) => {
    const id = Number(params.id)
    const success = deleteTaskFromMock(id)
    if (!success) {
      return HttpResponse.json(
        { success: false, code: 404, message: '任务不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok({ success: true }))
  }),

  http.get('/api/v1/approvals', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const size = Number(url.searchParams.get('size') ?? '20')
    const keyword = url.searchParams.get('keyword') ?? undefined
    const module = url.searchParams.get('module') ?? undefined
    const status = url.searchParams.get('status') ?? undefined
    const tabType = url.searchParams.get('tabType') ?? undefined

    const result = generateApprovalList({
      pageNum: page,
      pageSize: size,
      keyword,
      module,
      status,
      tabType,
    })
    return HttpResponse.json(ok<ApprovalListResult>(result))
  }),

  http.get('/api/v1/approvals/:id', ({ params }) => {
    const id = String(params.id)
    const approval = allApprovals.find((a) => a.approvalId === id) || null
    if (!approval) {
      return HttpResponse.json(
        { success: false, code: 404, message: '审批不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<Approval>(approval))
  }),

  http.post('/api/v1/approvals', async ({ request }) => {
    const body = (await request.json()) as Partial<ApprovalForm>
    const approval = createApprovalInMock(body)
    return HttpResponse.json(ok<Approval>(approval), { status: 201 })
  }),

  http.put('/api/v1/approvals/:id', async ({ request, params }) => {
    const id = String(params.id)
    const body = (await request.json()) as Partial<ApprovalForm>
    const approval = updateApprovalInMock(id, body)
    if (!approval) {
      return HttpResponse.json(
        { success: false, code: 404, message: '审批不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<Approval>(approval))
  }),

  http.delete('/api/v1/approvals/:id', ({ params }) => {
    const id = String(params.id)
    const success = deleteApprovalFromMock(id)
    if (!success) {
      return HttpResponse.json(
        { success: false, code: 404, message: '审批不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok({ success: true }))
  }),

  http.get('/api/v1/apps', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? '1')
    const size = Number(url.searchParams.get('size') ?? '100')
    const keyword = url.searchParams.get('keyword') ?? undefined
    const category = url.searchParams.get('category') ?? undefined
    const status = url.searchParams.get('status') ?? undefined

    const result = generateAppList({
      pageNum: page,
      pageSize: size,
      keyword,
      category,
      status,
    })
    return HttpResponse.json(ok<AppListResult>(result))
  }),

  http.get('/api/v1/apps/:id', ({ params }) => {
    const id = String(params.id)
    const app = allApps.find((a) => a.appId === id) || null
    if (!app) {
      return HttpResponse.json(
        { success: false, code: 404, message: '应用不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<AppItem>(app))
  }),

  http.post('/api/v1/apps', async ({ request }) => {
    const body = (await request.json()) as Partial<AppForm>
    const app = createAppInMock(body)
    return HttpResponse.json(ok<AppItem>(app), { status: 201 })
  }),

  http.put('/api/v1/apps/:id', async ({ request, params }) => {
    const id = String(params.id)
    const body = (await request.json()) as Partial<AppForm>
    const app = updateAppInMock(id, body)
    if (!app) {
      return HttpResponse.json(
        { success: false, code: 404, message: '应用不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<AppItem>(app))
  }),

  http.delete('/api/v1/apps/:id', ({ params }) => {
    const id = String(params.id)
    const success = deleteAppFromMock(id)
    if (!success) {
      return HttpResponse.json(
        { success: false, code: 404, message: '应用不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok({ success: true }))
  }),

  http.post('/api/v1/apps/:id/favorite', async ({ request, params }) => {
    const id = String(params.id)
    const body = (await request.json()) as { isFavorite?: boolean }
    toggleFavoriteInMock(id, body.isFavorite ?? true)
    return HttpResponse.json(ok({ success: true }))
  }),

  http.get('/api/v1/workbench', () => {
    const result = generateWorkbenchData()
    return HttpResponse.json(ok<WorkbenchData>(result))
  }),

  http.get('/api/v1/performance/overview', ({ request }) => {
    const url = new URL(request.url)
    const period = url.searchParams.get('period') ?? 'month'
    const indicator = url.searchParams.get('indicator') ?? 'revenue'
    const result = generatePerformanceOverview(period, indicator)
    return HttpResponse.json(ok<PerformanceOverview>(result))
  }),

  http.get('/api/v1/performance/list', ({ request }) => {
    const url = new URL(request.url)
    const tabType = url.searchParams.get('tabType') ?? 'team'
    const period = url.searchParams.get('period') ?? 'month'
    const indicator = url.searchParams.get('indicator') ?? 'revenue'
    const keyword = url.searchParams.get('keyword') ?? undefined
    const result = generatePerformanceList(tabType, period, indicator, keyword)
    return HttpResponse.json(ok<PerformanceListResult>(result))
  }),

  http.post('/api/v1/calendar/event/list', async ({ request }) => {
    const body = (await request.json()) as { queryDate?: string }
    const result = generateCalendarEventList(body.queryDate || dayjs().format('YYYY-MM-DD'))
    return HttpResponse.json(ok<CalendarEventListResult>(result))
  }),

  http.post('/api/v1/calendar/event/month-dots', async ({ request }) => {
    const body = (await request.json()) as { yearMonth?: string }
    const result = generateCalendarMonthDots(body.yearMonth || dayjs().format('YYYY-MM'))
    return HttpResponse.json(ok<CalendarMonthDotsResult>(result))
  }),

  http.post('/api/v1/calendar/event/save', async ({ request }) => {
    const body = (await request.json()) as Partial<CalendarEventForm>
    const event = body.id
      ? updateCalendarEventInMock(body.id, body)
      : createCalendarEventInMock(body)
    if (!event) {
      return HttpResponse.json(
        { success: false, code: 404, message: '日程不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<{ id: string; eventCode: string }>({ id: event.id, eventCode: event.eventCode }))
  }),

  http.post('/api/v1/calendar/event/delete/:id', ({ params }) => {
    const id = String(params.id)
    const success = deleteCalendarEventFromMock(id)
    if (!success) {
      return HttpResponse.json(
        { success: false, code: 404, message: '日程不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok({ success: true }))
  }),

  http.get('/api/v1/calendar/event/detail/:id', ({ params }) => {
    const id = String(params.id)
    const event = getCalendarEventById(id)
    if (!event) {
      return HttpResponse.json(
        { success: false, code: 404, message: '日程不存在', data: null },
        { status: 404 },
      )
    }
    return HttpResponse.json(ok<CalendarEvent>(event))
  }),

  http.post('/api/v1/calendar/event/check-in/:id', ({ params }) => {
    const id = String(params.id)
    const result = checkInCalendarEventInMock(id)
    return HttpResponse.json(ok(result))
  }),

  http.post('/api/v1/calendar/event/complete/:id', ({ params }) => {
    const id = String(params.id)
    const result = completeCalendarEventInMock(id)
    return HttpResponse.json(ok(result))
  }),

  http.get('/api/v1/calendar/stats', ({ request }) => {
    const url = new URL(request.url)
    const queryDate = url.searchParams.get('queryDate') || dayjs().format('YYYY-MM-DD')
    const result = generateCalendarStats(queryDate)
    return HttpResponse.json(ok<CalendarStatsResult>(result))
  }),
]
