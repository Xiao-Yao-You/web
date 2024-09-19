import { defineStore } from 'pinia'
import { store } from '@/store'
import { getTrackInfo } from '@/api/system/userReport'

export const useReportStore = defineStore('report', {
  state: () => {
    return {
      badgeInfo: {
        needFollow: 0, // “我的跟进” 数量
        summaryFlag: false // 是否显示“每日汇总”的徽标
      }
    }
  },
  actions: {
    async queryBadgeInfo() {
      const data = await getTrackInfo()
      Object.assign(this.badgeInfo, data)
    }
  }
})

export const useReportStoreWithOut = () => {
  return useReportStore(store)
}
