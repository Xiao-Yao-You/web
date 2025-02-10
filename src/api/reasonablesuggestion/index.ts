import request from '@/config/axios'
import type { UploadFiles } from 'element-plus'

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
  get: async (id: number) => {
    return await request.get({ url: `/reasonableSuggestion/get?id=` + id })
  },

  // 审核合理化建议详情
  examine: async (id: number, examineType: number) => {
    return await request.post({
      url: `/reasonableSuggestion/examine?id=` + id + `&examineType=` + examineType
    })
  },

  // 新增合理化建议
  create: async (data: VO) => {
    return await request.post({ url: `/reasonableSuggestion/create`, data })
  },

  // 修改合理化建议
  update: async (data: VO) => {
    return await request.put({ url: `/reasonableSuggestion/update`, data })
  },

  // 删除合理化建议
  delete: async (id: number) => {
    return await request.delete({ url: `/reasonableSuggestion/delete?id=` + id })
  },

  // 导出合理化建议 Excel
  export: async (params) => {
    return await request.download({ url: `/reasonableSuggestion/export-excel`, params })
  }
}
