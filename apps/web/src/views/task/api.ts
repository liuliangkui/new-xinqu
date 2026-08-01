/**
 * 任务管理 — API 层
 * 对接后端 /tasks REST 接口；开发环境由 MSW 拦截并返回视图模型数据。
 */
import { get, post, put, del } from '@/api/request'
import type { Task, TaskForm, TaskListParams, TaskListResult } from './types'

const BASE = '/tasks'

/** 获取任务列表 */
export function getTaskList(params: TaskListParams): Promise<TaskListResult> {
  return get<TaskListResult>(BASE, {
    page: params.pageNum,
    size: params.pageSize,
    keyword: params.keyword,
    taskType: params.taskType,
    priority: params.priority,
    status: params.status,
    tabType: params.tabType,
  })
}

/** 获取任务详情 */
export function getTaskDetail(taskId: string | number): Promise<Task> {
  return get<Task>(`${BASE}/${taskId}`)
}

/** 创建任务 */
export function createTask(data: TaskForm): Promise<Task> {
  return post<Task>(BASE, data)
}

/** 更新任务 */
export function updateTask(taskId: string | number, data: Partial<TaskForm>): Promise<Task> {
  return put<Task>(`${BASE}/${taskId}`, data)
}

/** 删除任务 */
export function deleteTask(taskId: string | number): Promise<unknown> {
  return del<unknown>(`${BASE}/${taskId}`)
}
