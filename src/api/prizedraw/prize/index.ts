import request from '@/config/axios'

// 奖品信息 VO
export interface PrizeVO {
  id: number // 主键
  activityId: number // 活动Id
  prizeName: string // 奖品名称
  prizeQuantity: number // 奖品总数量
  prizeUrl: string // 奖品图片地址
  remainingQuantity: string // 奖品剩余数量
}

// 奖品信息 API
export const PrizeApi = {
  // 查询奖品信息分页
  getPrizePage: async (params: any) => {
    return await request.get({ url: `/prize/page`, params })
  },

  // 查询奖品信息详情
  getPrize: async (id: number) => {
    return await request.get({ url: `/prize/get?id=` + id })
  },

  // 新增奖品信息
  createPrize: async (data: PrizeVO) => {
    return await request.post({ url: `/prize/create`, data })
  },

  // 修改奖品信息
  updatePrize: async (data: PrizeVO) => {
    return await request.put({ url: `/prize/update`, data })
  },

  // 删除奖品信息
  deletePrize: async (id: number) => {
    return await request.delete({ url: `/prize/delete?id=` + id })
  },

  // 导出奖品信息 Excel
  exportPrize: async (params) => {
    return await request.download({ url: `/prize/export-excel`, params })
  },
}
