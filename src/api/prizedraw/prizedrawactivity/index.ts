import request from '@/config/axios'

// 抽奖活动 VO
export interface PrizeDrawActivityVO {
  id: number // id
  activityName: string // 活动名称
  beginTime: Date // 开始时间
  endTime: Date // 结束时间
  participantsQuantity: number // 参与人数
}

// 抽奖活动 API
export const PrizeDrawActivityApi = {
  // 查询抽奖活动分页
  getPrizeDrawActivityPage: async (params: any) => {
    return await request.get({ url: `/prize-draw-activity/page`, params })
  },

  getAllActivities: async () => {
    return await request.get({ url: `/prize-draw-activity/getAllActivities` })
  },

  // 查询抽奖活动详情
  getPrizeDrawActivity: async (id: number) => {
    return await request.get({ url: `/prize-draw-activity/get?id=` + id })
  },

  // 新增抽奖活动
  createPrizeDrawActivity: async (data: PrizeDrawActivityVO) => {
    return await request.post({ url: `/prize-draw-activity/create`, data })
  },

  // 修改抽奖活动
  updatePrizeDrawActivity: async (data: PrizeDrawActivityVO) => {
    return await request.put({ url: `/prize-draw-activity/update`, data })
  },

  // 删除抽奖活动
  deletePrizeDrawActivity: async (id: number) => {
    return await request.delete({ url: `/prize-draw-activity/delete?id=` + id })
  },

  // 导出抽奖活动 Excel
  exportPrizeDrawActivity: async (params) => {
    return await request.download({ url: `/prize-draw-activity/export-excel`, params })
  }
}
