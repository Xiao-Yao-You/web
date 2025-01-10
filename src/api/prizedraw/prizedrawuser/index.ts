import request from '@/config/axios'

// 抽奖用户 VO
export interface PrizeDrawUserVO {
  id: number // 主键
  nickname: string // 昵称
  headimgurl: string // 用户头像地址
  openid: string // openid
  activityBacth: number // 活动批次
  winningRate: number // 中奖率
}

// 抽奖用户 API
export const PrizeDrawUserApi = {
  // 查询抽奖用户分页
  getPrizeDrawUserPage: async (params: any) => {
    return await request.get({ url: `/prize-draw-user/page`, params })
  },

  // 查询抽奖用户详情
  getPrizeDrawUser: async (id: number) => {
    return await request.get({ url: `/prize-draw-user/get?id=` + id })
  },

  // 新增抽奖用户
  createPrizeDrawUser: async (data: PrizeDrawUserVO) => {
    return await request.post({ url: `/prize-draw-user/create`, data })
  },

  // 修改抽奖用户
  updatePrizeDrawUser: async (data: PrizeDrawUserVO) => {
    return await request.put({ url: `/prize-draw-user/update`, data })
  },

  // 删除抽奖用户
  deletePrizeDrawUser: async (id: number) => {
    return await request.delete({ url: `/prize-draw-user/delete?id=` + id })
  },

  // 导出抽奖用户 Excel
  exportPrizeDrawUser: async (params) => {
    return await request.download({ url: `/prize-draw-user/export-excel`, params })
  },
}
