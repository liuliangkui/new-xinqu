/**
 * 工单看板 — API 层
 */
import { get } from '@/api/request'
import type { KanbanListResult, KanbanStats } from './types'

const BASE = '/kanban'

/** 获取看板数据 */
export function getKanbanData(): Promise<KanbanListResult> {
  return get<KanbanListResult>(BASE)
}

/** 获取看板统计 */
export function getKanbanStats(): Promise<KanbanStats> {
  return get<KanbanStats>(`${BASE}/stats`)
}
