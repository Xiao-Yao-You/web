import request from '@/config/axios'

// 分页查询所有的分组工单统计列表
// export const getGroupPage = (params: Required<PageParam>) => {
//   return request.get<{ total: number; list: any[] }>({
//     url: '/report-group-order/page',
//     params
//   })
// }

/**
 * @description 创建某月的分组工单统计
 * @param {string} month 年月，比如 '2025-01'
 */
export const createAssetsReport = (month?: string) => {
  return request.post({
    url: `/report-device/generateReport?month=${month}`
  })
}

// export interface GroupParams extends Required<PageParam> {
//   month: string // 年月，比如 '2025-03'
//   groupId: string // 分组id
// }

// 查询某月的分组工单统计
// export const getGroupReport = (params: GroupParams) => {
//   return request.get<{ list: any[]; total: number }>({
//     url: '/report-group-order-detail/page',
//     params
//   })
// }
