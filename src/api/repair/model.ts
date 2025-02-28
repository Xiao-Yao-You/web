import request from '@/config/axios'

export interface RepairModel {
  id: number // 主键
  model: string // 型号
  status: number // 启用状态（0正常 1停用）
  remark: string // 备注
  deviceTypeId: number // 设备类型id
}

export type RepairModelPayload = Omit<RepairModel, 'id'>

export const getModelPage = (params: any) => {
  return request.get({ url: '/operation-device-model/page', params })
}

// 查询设备型号详情
export const getModel = (id: number) => {
  return request.get({ url: `/operation-device-model/get?id=${id}` })
}

// 新增设备型号
export const createModel = (data: RepairModelPayload) => {
  return request.post({ url: '/operation-device-model/create', data })
}

// 修改设备型号
export const updateModel = (data: RepairModelPayload) => {
  return request.put({ url: '/operation-device-model/update', data })
}

// 删除设备型号
export const deleteModel = (id: number) => {
  return request.delete({ url: `/operation-device-model/delete?id=${id}` })
}

// 根据设备类型 id 获取设备型号
export interface ModelInfo {
  id: number
  model: string
  deviceTypeId: number
  createTime: 1732756415000
  updateTime: 1732756415000
  creator: Numeric
  updater: Numeric
  remark: null | string
  status: number
  deleted: boolean
}
export const getModelById = (id: number) => {
  return request.get<ModelInfo[]>({
    url: `/operation-device-model/getByDeviceTypeId?deviceTypeId=${id}`
  })
}

// 下载设备型号 Excel 模板
export const getModelExcelTemp = () => {
  return request.download<Blob>({ url: '/operation-device-model/get-import-template' })
}

// 导出设备型号 Excel
// export const exportModel = (params) => {
//   return request.download({ url: `/repair/model/export-excel`, params })
// }
