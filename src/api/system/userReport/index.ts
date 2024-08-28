import request from '@/config/axios'
import { type } from '../../../types/auto-imports'

// 用户汇报 VO
export interface UserReportVO {
  id: number
  userId: number
  deptId: number
  deptName: string
  dateReport: Date
  commitTime: Date
  remark: string
  userNickName: string
  checkStatus: number
  type: number
  reportJobScheduleDOList: workProgress[]
  reportJobPlanDOList: workPlan[]
  reportObject: number[]
}

//工作进度
export interface workProgress {
  content: string
  situation: string
  connectId: number
}
//工作计划
export interface workPlan {
  content: string
  estimatedTime: string
  needSource: string
}
//工作
export interface reportAttention {
  userId: number
  userNickName
  reply: string
  type: number
  jobId: number
  connectContent: string
  deptId: string
  dateReport: string
  content: string
  transferRemark: string
  replyUserId: number
  replyUserNickName: string
  situation: string
  replyStatus: string
  jobScheduleId: number
  reportScheduleId: number
}

// 用户汇报 API
export const UserReportApi = {
  // 查询用户汇报分页
  getUserReportPage: async (params: any) => {
    return await request.get({ url: `/user-report/page`, params })
  },

  // 查询用户汇报详情
  getUserReport: async (id: number) => {
    return await request.get({ url: `/user-report/get?id=` + id })
  },

  // 新增用户汇报
  createUserReport: async (data: UserReportVO) => {
    return await request.post({ url: `/user-report/create`, data })
  },

  // 修改用户汇报
  updateUserReport: async (data: UserReportVO) => {
    return await request.put({ url: `/user-report/update`, data })
  },

  // 删除用户汇报
  deleteUserReport: async (id: number) => {
    return await request.delete({ url: `/user-report/delete?id=` + id })
  },

  // 导出用户汇报 Excel
  exportUserReport: async (params) => {
    return await request.download({ url: `/user-report/export-excel`, params })
  },

  getSummaryData: async (params: any) => {
    return request.get({ url: `/user-report/summary`, params })
  },

  //新增关注记录
  createReportAttention: async (data: reportAttention) => {
    return await request.post({ url: `/report-attention/create`, data })
  },

  //新增关注记录列表
  getReportAttentionPage: async (params: any) => {
    return await request.get({ url: `/report-attention/queryAttentionPage`, params })
  },

  //新增跟进记录列表
  getReportFollowPage: async (params: any) => {
    return await request.get({ url: `/report-attention/queryFollowPage`, params })
  }
}
