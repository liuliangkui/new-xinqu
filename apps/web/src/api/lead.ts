import { get, post, put, del, getPage } from './request'
import type { PageParams } from '@/types/common'

export interface LeadItem {
  id: string
  name: string
  source: string
  sourceDetail?: string
  status: string
  poolType: string
  ownerId?: string
  region?: string
  contactName?: string
  contactPhone?: string
  companyName?: string
  demand?: string
  estimatedAmount?: number
  intentionLevel?: string
  followCount: number
  lastFollowAt?: string
  convertedCustomerId?: string
  createdAt: string
  updatedAt: string
}

export interface LeadForm {
  name: string
  source: string
  sourceDetail?: string
  status?: string
  poolType?: string
  ownerId?: string
  region?: string
  contactName?: string
  contactPhone?: string
  companyName?: string
  demand?: string
  estimatedAmount?: number
  intentionLevel?: string
}

export function getLeadList(params?: PageParams & { keyword?: string; status?: string; poolType?: string }) {
  return getPage<LeadItem>('/leads', params)
}

export function getLeadDetail(id: string) {
  return get<LeadItem>(`/leads/${id}`)
}

export function createLead(data: LeadForm) {
  return post<LeadItem>('/leads', data)
}

export function updateLead(id: string, data: Partial<LeadForm>) {
  return put<LeadItem>(`/leads/${id}`, data)
}

export function deleteLead(id: string) {
  return del<unknown>(`/leads/${id}`)
}
