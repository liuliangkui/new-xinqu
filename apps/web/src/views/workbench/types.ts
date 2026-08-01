/**
 * 工作台模块 — 类型定义
 */

export interface WorkbenchStats {
  pendingTaskCount: number
  pendingApprovalCount: number
  unreadMessageCount: number
  todayScheduleCount: number
}

export interface WorkbenchSchedule {
  scheduleId: string
  title: string
  startTime: string
  endTime?: string
  allDay?: boolean
  location?: string
}

export interface WorkbenchFavorite {
  id: string
  appId: string
  name: string
  route?: string
  icon?: string
}

export interface WorkbenchTodo {
  todoId: string
  title: string
  type: 'task' | 'approval' | 'message'
  description?: string
  time: string
  status?: string
}

export interface WorkbenchData {
  stats: WorkbenchStats
  schedules: WorkbenchSchedule[]
  favorites: WorkbenchFavorite[]
  todos: WorkbenchTodo[]
}
