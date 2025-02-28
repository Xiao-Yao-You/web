import request from '@/config/axios'
import { RequsetTypeEnum } from './constant'

export interface IssuesAllParams {
  name?: string // 问题类型
}

export interface RepairIssuesPage extends PageParam, IssuesAllParams {}

export type RepairIssue = {
  id: number
  name: string
  parentId?: number
  type: RequsetTypeEnum
  deviceTypeId: number
  deviceTypeName?: string
  description: string
  solution: string
}

export type IssuePayload = {
  name: string
  parentId?: number
  type: RequsetTypeEnum
  deviceTypeId: number
  description?: string
  solution?: string
}

// 获取问题分页
export const getRepairIssuesPage = (params: RepairIssuesPage) => {
  return request.get<{ list: RepairIssue[]; total: number }>({
    url: '/operation-question-type/page',
    params
  })
}

// 获取全量问题
export const getRepairIssuesAll = (params?: IssuesAllParams) => {
  return request.get<RepairIssue[]>({
    url: '/operation-question-type/getAll',
    params
  })
}

// 删除问题
export const deleteIssue = (id: number) => {
  return request.delete({ url: `/operation-question-type/delete?id=${id}` })
}

// 创建问题
export const createIssue = (data: IssuePayload) => {
  return request.post({ url: '/operation-question-type/create', data })
}

// 获取问题详情
export const getIssueDetail = (id: number) => {
  return request.get<RepairIssue>({ url: `/operation-question-type/get?id=${id}` })
}

// 编辑问题
export const updateIssue = (data: RepairIssue) => {
  return request.put({ url: '/operation-question-type/update', data })
}
