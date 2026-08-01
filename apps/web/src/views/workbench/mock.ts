/**
 * 工作台 — Mock
 */
import type { WorkbenchData, WorkbenchSchedule, WorkbenchFavorite, WorkbenchTodo } from './types'

const favorites: WorkbenchFavorite[] = [
  { id: '1', appId: '1', name: '工作台', route: '/', icon: 'home' },
  { id: '2', appId: '3', name: '任务', route: '/tasks', icon: 'task' },
  { id: '3', appId: '8', name: '客户 360°', route: '/customer', icon: 'customer' },
  { id: '4', appId: '14', name: '审批中心', route: '/approval', icon: 'approval' },
  { id: '5', appId: '15', name: '售后工单', route: '/ticket', icon: 'ticket' },
]

const schedules: WorkbenchSchedule[] = [
  {
    scheduleId: '1',
    title: '云南省一院方案汇报',
    startTime: '2026-08-02T09:30:00.000Z',
    endTime: '2026-08-02T11:00:00.000Z',
    location: '客户现场',
  },
  {
    scheduleId: '2',
    title: '大理州医院设备巡检',
    startTime: '2026-08-02T14:00:00.000Z',
    endTime: '2026-08-02T16:00:00.000Z',
    location: '大理州医院',
  },
  {
    scheduleId: '3',
    title: '周例会',
    startTime: '2026-08-02T17:00:00.000Z',
    endTime: '2026-08-02T18:00:00.000Z',
  },
]

const todos: WorkbenchTodo[] = [
  {
    todoId: '1',
    title: '跟进昆明市一院合同签署',
    type: 'task',
    description: '预计金额 120 万，需本周内确认',
    time: '2026-08-02T08:00:00.000Z',
  },
  {
    todoId: '2',
    title: '审批大理州医院折扣申请',
    type: 'approval',
    description: '折扣比例 8%，申请人：李四',
    time: '2026-08-02T08:30:00.000Z',
  },
  {
    todoId: '3',
    title: '曲靖市一院设备故障待处理',
    type: 'task',
    description: '优先级：紧急',
    time: '2026-08-02T09:00:00.000Z',
  },
  {
    todoId: '4',
    title: '系统消息：新的线索分配',
    type: 'message',
    description: '代理商推荐线索 3 条',
    time: '2026-08-02T09:15:00.000Z',
  },
]

export function generateWorkbenchData(): WorkbenchData {
  return {
    stats: {
      pendingTaskCount: 7,
      pendingApprovalCount: 4,
      unreadMessageCount: 12,
      todayScheduleCount: schedules.length,
    },
    schedules,
    favorites,
    todos,
  }
}

export function mockGetWorkbenchData(): Promise<WorkbenchData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateWorkbenchData())
    }, 300)
  })
}
