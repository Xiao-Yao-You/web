import request from '@/config/axios'

// 报表信息
export interface ReportInfo {
  id: number
  reportMonth: string
  reportTitle: string
  createTime: number
}

// 当月的人工统计详情_请求参数
export interface IndivParams extends Required<PageParam> {
  reportMonth: string // 年月，比如 '2025-03'
}

// 分页查询所有的人工统计列表
export const getIndividualPage = (params: Required<PageParam>) => {
  return request.get<{ total: number; list: ReportInfo[] }>({
    url: '/report-list/page',
    params
  })
}

/**
 * @description 创建当月的人工统计
 * @param {string} month 年月，比如 '2025-01'
 */
export const createIndividualReport = (month?: string) => {
  return request.post({
    url: `/report-person-order/generateReport?month=${month}`
  })
}

/**
 * @description 删除当月的人工统计
 * @param {string} month 年月，比如 '2025-01'
 */
export const deleteIndividualReport = (month?: string) => {
  return request.post({
    url: `/report-person-order/deleteReport?month=${month}`
  })
}

// 查询当月的人工统计详情
export const getIndividualReport = (params: IndivParams) => {
  return request.get<{ list: any[]; total: number }>({
    url: '/report-person-order/page',
    params
  })
}
