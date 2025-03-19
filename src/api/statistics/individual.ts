import request from '@/config/axios'

/**
 * @description 查询人工统计列表
 */
export const getIndividualPage = (params: Required<PageParam>) => {
  return request.get<{ total: number; list: any[] }>({
    url: '/report-list/page',
    params
  })
}

/**
 * @description 创建某月的人工统计
 * @param {string} month 年月，比如 '2025-01'
 */
export const createIndividualReport = (month?: string) => {
  return request.post({
    url: `/report-person-order/generateReport?month=${month}`
  })
}

export interface IndivParams extends Required<PageParam> {
  reportMonth: string // 年月，比如 '2025-03'
}

/**
 * @description 查询人工统计
 * @param {string} month 年月，比如 '2025-01'
 */
export const getIndividualReport = (params: IndivParams) => {
  return request.get<{ list: any[]; total: number }>({
    url: '/report-person-order/page',
    params
  })
}
