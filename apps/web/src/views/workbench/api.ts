/**
 * 工作台 — API 层
 * 对接后端 /workbench 聚合接口；开发环境由 MSW 拦截并返回视图模型数据。
 */
import { get } from '@/api/request'
import type { WorkbenchData } from './types'

const BASE = '/workbench'

/** 获取工作台聚合数据 */
export function getWorkbenchData(): Promise<WorkbenchData> {
  return get<WorkbenchData>(BASE)
}
