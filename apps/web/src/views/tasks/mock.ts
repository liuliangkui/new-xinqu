/**
 * 任务管理 — Mock
 */
import type { Task, TaskForm, TaskListResult, TaskStats } from './types'
import { TaskType, TaskPriority, TaskStatus } from './types'

const customers = ['昆明市一院', '云南省一院', '大理州医院', '曲靖市一院', '玉溪市医院']
const owners = ['张三', '李四', '王五']
const participants = ['赵六', '孙七', '周八']
const types = Object.values(TaskType)
const priorities = Object.values(TaskPriority)
const statuses = Object.values(TaskStatus)

function makeTask(id: number): Task {
  const status = statuses[id % statuses.length]!
  return {
    taskId: id,
    taskCode: `TK${String(id).padStart(6, '0')}`,
    title: `${customers[id % customers.length]!}跟进-${['方案沟通', '设备巡检', '合同签署', '回访', '培训', '异议处理'][id % 6]}`,
    description: '需联系客户确认下周上门时间，并同步工程师排期。',
    taskType: types[id % types.length]!,
    priority: priorities[id % priorities.length]!,
    status,
    dueDate: new Date(2026, 6, 30 + (id % 10)).toISOString(),
    customerName: customers[id % customers.length]!,
    ownerName: owners[id % owners.length]!,
    ownerId: String((id % 3) + 1),
    participantNames: id % 2 === 0 ? [participants[id % participants.length]!] : undefined,
    participantIds: id % 2 === 0 ? [String((id % 3) + 4)] : undefined,
    createdAt: new Date(2026, 6, 28 - (id % 20)).toISOString(),
    updatedAt: new Date(2026, 6, 28 - (id % 10)).toISOString(),
  }
}

export const allTasks = Array.from({ length: 28 }, (_, i) => makeTask(i + 1))

function filterTasks(params: {
  keyword?: string
  taskType?: string
  priority?: string
  status?: string
  tabType?: string
}): Task[] {
  let filtered = [...allTasks]
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(kw) ||
        t.taskCode.toLowerCase().includes(kw) ||
        (t.customerName && t.customerName.toLowerCase().includes(kw)),
    )
  }
  if (params.taskType) filtered = filtered.filter((t) => t.taskType === params.taskType)
  if (params.priority) filtered = filtered.filter((t) => t.priority === params.priority)
  if (params.status) filtered = filtered.filter((t) => t.status === params.status)
  if (params.tabType === 'my') filtered = filtered.filter((t) => t.ownerName === '张三')
  if (params.tabType === 'team')
    filtered = filtered.filter((t) => ['张三', '李四'].includes(t.ownerName || ''))
  if (params.tabType === 'collaboration')
    filtered = filtered.filter((t) => t.participantNames && t.participantNames.length > 0)
  if (params.tabType === 'overdue')
    filtered = filtered.filter(
      (t) => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED,
    )
  return filtered
}

function buildStats(filtered: Task[]): TaskStats {
  return {
    totalCount: filtered.length,
    pendingCount: filtered.filter((t) => t.status === TaskStatus.PENDING).length,
    processingCount: filtered.filter((t) => t.status === TaskStatus.PROCESSING).length,
    completedCount: filtered.filter((t) => t.status === TaskStatus.COMPLETED).length,
    overdueCount: filtered.filter(
      (t) => t.status !== TaskStatus.COMPLETED && t.status !== TaskStatus.CANCELLED,
    ).length,
    urgentCount: filtered.filter((t) => t.priority === TaskPriority.URGENT).length,
  }
}

export function generateTaskList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  taskType?: string
  priority?: string
  status?: string
  tabType?: string
}): TaskListResult {
  const filtered = filterTasks(params)
  const total = filtered.length
  const start = (params.pageNum - 1) * params.pageSize
  return {
    list: filtered.slice(start, start + params.pageSize),
    total,
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    stats: buildStats(filtered),
  }
}

function nextTaskId(): number {
  return allTasks.length > 0 ? Math.max(...allTasks.map((t) => t.taskId)) + 1 : 1
}

export function createTaskInMock(data: Partial<TaskForm>): Task {
  const now = new Date().toISOString()
  const id = nextTaskId()
  const task: Task = {
    taskId: id,
    taskCode: `TK${String(id).padStart(6, '0')}`,
    title: data.title || '新建任务',
    description: data.description,
    taskType: data.taskType ?? TaskType.FOLLOW_UP,
    priority: data.priority ?? TaskPriority.MEDIUM,
    status: data.status ?? TaskStatus.PENDING,
    dueDate: data.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    customerName: data.customerName,
    ownerName: data.ownerName || '张三',
    ownerId: data.ownerId || '1',
    participantNames: data.participantNames,
    participantIds: data.participantIds,
    createdAt: now,
    updatedAt: now,
  }
  allTasks.unshift(task)
  return task
}

export function updateTaskInMock(taskId: number, data: Partial<TaskForm>): Task | null {
  const idx = allTasks.findIndex((t) => t.taskId === taskId)
  if (idx === -1) return null
  const existing = allTasks[idx]!
  const updated: Task = {
    ...existing,
    ...data,
    taskId: existing.taskId,
    taskCode: existing.taskCode,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  }
  allTasks[idx] = updated
  return updated
}

export function deleteTaskFromMock(taskId: number): boolean {
  const idx = allTasks.findIndex((t) => t.taskId === taskId)
  if (idx === -1) return false
  allTasks.splice(idx, 1)
  return true
}

export function mockGetTaskList(params: {
  pageNum: number
  pageSize: number
  keyword?: string
  taskType?: string
  priority?: string
  status?: string
  tabType?: string
}): Promise<TaskListResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateTaskList(params))
    }, 300)
  })
}
