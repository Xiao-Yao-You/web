import request from '@/config/axios'
import type { UploadFiles } from 'element-plus'

// 是否匿名
export enum Anonymous {
  Yes = '1',
  No = '2'
}

// 建议的采纳状态（从字典管理中获取，请注意更新）
export enum AdoptionStatus {
  Pending = 1, // 未审核（暂未用上）
  Resolve, // 已采纳
  Reject, // 不采纳
  Read, // 已读
  Unread // 未读
}

// 合理化建议 VO
export interface ReasonableSuggestionVO {
  id: number // 主键
  title: string // 建议主题
  suggestionType: number // 建议类型
  userId: number // 申报人id
  nickname: string // 申报人
  workNum: string // 申报人工号
  phoneNum: string // 手机号
  deptId: number // 申报部门_id
  deptName: string // 申报部门
  problemDescription: string // 问题描述
  solution: string // 解决方案
  effectEstimation: string // 效果预估
  status: number // 建议状态
  anonymous: number // 是否匿名
  filePath: string // 附件地址
  fileList: UploadFiles
}

// 合理化建议 API
export const ReasonableSuggestionApi = {
  // 查询合理化建议分页
  getPage: async (params: any) => {
    return await request.get({ url: `/reasonableSuggestion/page`, params })
  },

  // 查询合理化建议详情
  get: (id: number) => {
    return request.get({
      url: `/reasonableSuggestion/get?id=${id}`,
      headers: { 'X-Response-Handler': true }
    })
  },

  // 审核合理化建议详情
  examine: (params: { id: number; examineType: number; remark: string }) => {
    return request.post({
      url: '/reasonableSuggestion/examine',
      params: params
    })
  },

  // 新增合理化建议
  create: async (data: ReasonableSuggestionVO) => {
    return await request.post({ url: `/reasonableSuggestion/create`, data })
  },

  // 修改合理化建议
  update: async (data: ReasonableSuggestionVO) => {
    return await request.put({ url: `/reasonableSuggestion/update`, data })
  },

  // 删除合理化建议
  delete: async (id: number) => {
    return await request.delete({ url: `/reasonableSuggestion/delete?id=` + id })
  },

  // 导出合理化建议 Excel
  export: async (params) => {
    return await request.download({ url: `/reasonableSuggestion/export-excel`, params })
  },

  // 单条建议已读
  read: (id: number) => {
    return request.post({
      url: '/reasonableSuggestion/read',
      params: { id },
      headers: { 'X-Response-Handler': true }
    })
  },

  // 一键批量已读所有建议
  readAll: () => {
    return request.post({ url: '/reasonableSuggestion/allRead' })
  }
}
