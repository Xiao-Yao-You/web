import request from '@/config/axios'

// 用户汇报 VO
export interface UserReportVO {
  id: number // 主键
  userId: number // 用户id
  deptId: number // 部门id
  dateReport: Date // 汇报日期
  commitTime: Date // 提交时间
  remark: string // 备注
  userNikeName: string // 用户昵称
  checkSatus: string // 领导查看状态(00:未查看,01已查看)
  type: string // 类型(00:正常,01:补交,02:缺)
}

// 用户汇报 API
export const UserReportApi = {
  // 查询用户汇报分页
  getUserReportPage: async (params: any) => {
    return await request.get({ url: `/hk/user-report/page`, params })
  },

  // 查询用户汇报详情
  getUserReport: async (id: number) => {
    return await request.get({ url: `/hk/user-report/get?id=` + id })
  },

  // 新增用户汇报
  createUserReport: async (data: UserReportVO) => {
    return await request.post({ url: `/hk/user-report/create`, data })
  },

  // 修改用户汇报
  updateUserReport: async (data: UserReportVO) => {
    return await request.put({ url: `/hk/user-report/update`, data })
  },

  // 删除用户汇报
  deleteUserReport: async (id: number) => {
    return await request.delete({ url: `/hk/user-report/delete?id=` + id })
  },

  // 导出用户汇报 Excel
  exportUserReport: async (params) => {
    return await request.download({ url: `/hk/user-report/export-excel`, params })
  },
}
