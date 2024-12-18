import request from '@/config/axios'

// 巡检项目指标 VO
export interface InspectionProjectVO {
  id: number // 主键
  inspectionProject: string // 巡检项目
  inspectionIndicators: string // 项目指标
  status: number // 状态：0可用，1禁用
  remark: string // 备注
}

// 巡检项目指标 API
export const InspectionProjectApi = {
  // 查询巡检项目指标分页
  getInspectionProjectPage: async (params: any) => {
    return await request.get({ url: `/inspection-project/page`, params })
  },

  // 查询巡检项目指标详情
  getInspectionProject: async (id: number) => {
    return await request.get({ url: `/inspection-project/get?id=` + id })
  },

  // 新增巡检项目指标
  createInspectionProject: async (data: InspectionProjectVO) => {
    return await request.post({ url: `/inspection-project/create`, data })
  },

  // 修改巡检项目指标
  updateInspectionProject: async (data: InspectionProjectVO) => {
    return await request.put({ url: `/inspection-project/update`, data })
  },

  // 删除巡检项目指标
  deleteInspectionProject: async (id: number) => {
    return await request.delete({ url: `/inspection-project/delete?id=` + id })
  },

  // 导出巡检项目指标 Excel
  exportInspectionProject: async (params) => {
    return await request.download({ url: `/inspection-project/export-excel`, params })
  },
}
