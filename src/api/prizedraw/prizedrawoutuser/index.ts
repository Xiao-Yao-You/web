import request from '@/config/axios'

// 场外参与人员 VO
export interface PrizeDrawOutUserVO {
  id: number // 主键
  nickname: string // 姓名
  dept: string // 部门名称
  workNum: string // 工号
  mobile: string // 手机号
  status: number // 中奖状态
  prizeLevel: number // 奖品等级
}

// 场外参与人员 API
export const PrizeDrawOutUserApi = {
  // 查询场外参与人员分页
  getPrizeDrawOutUserPage: async (params: any) => {
    return await request.get({url: `/prize-draw-out-user/page`, params})
  },

  // 查询场外参与人员详情
  getPrizeDrawOutUser: async (id: number) => {
    return await request.get({url: `/prize-draw-out-user/get?id=` + id})
  },

  // 新增场外参与人员
  createPrizeDrawOutUser: async (data: PrizeDrawOutUserVO) => {
    return await request.post({url: `/prize-draw-out-user/create`, data})
  },

  // 修改场外参与人员
  updatePrizeDrawOutUser: async (data: PrizeDrawOutUserVO) => {
    return await request.put({url: `/prize-draw-out-user/update`, data})
  },

  // 删除场外参与人员
  deletePrizeDrawOutUser: async (id: number) => {
    return await request.delete({url: `/prize-draw-out-user/delete?id=` + id})
  },

  // 导出场外参与人员 Excel
  exportPrizeDrawOutUser: async (params) => {
    return await request.download({url: `/prize-draw-out-user/export-excel`, params})
  },

}
export const getPrizeDrawOutUserImportTemplate = async () => {
  return request.download({url: '/prize-draw-out-user/get-import-template'})
}
