import request from '@/config/axios'
import { RequsetTypeEnum, OperateMethod, OperateStatus } from './constant'
import { CommonLevelEnum } from '@/utils/constants'
import type { PictureItem } from './archive'
import type { CascaderValue, ModelValueType } from 'element-plus'

export type RepairOrderPage = PageParam &
  Partial<{
    title: string
    status: string
    questionType: CascaderValue
    level: string
    submitUserNickName: string
    createTime: ModelValueType
  }>

export interface RepairOrder {
  id: number
  title: string
  status: OperateStatus
  labelCode?: string // 二维码标签号
  deviceName?: string // 设备名称
  addressId: number // 设备地点
  location: string // 设备位置
  dealUserId: number
  dealUserNickName: string
  submitUserId: number // 报修人
  submitUserNickName: string
  submitUserMobile: string // 报修人电话
  requestType: RequsetTypeEnum // 请求（问题）类型
  questionType: number // 问题管理中的某个具体问题的 id
  level: CommonLevelEnum // 紧急程度
  desc: string
  recordList: any[] // 处理记录
  [key: string]: any
}

// 获取工单分页
export const getRepairOrderPage = (params: RepairOrderPage, signal?: AbortSignal) => {
  return request.get<{ list: RepairOrder[]; total: number }>({
    url: '/operation-order/page',
    params,
    signal
  })
}

export interface OrderPayload {
  id?: number
  title: string
  labelCode?: string
  deviceName?: string
  deviceId?: number
  addressIdList: number[]
  location: string
  submitUserId: number
  submitUserMobile: string
  description: string
  operateMethod: OperateMethod
  sourceType: number
  picture: string // 问题照片
}

// 创建工单
export const createRepairOrder = (data: OrderPayload) => {
  return request.post({
    url: '/operation-order/create',
    data
  })
}

// 查询工单详情
export const getRepairOrder = (id: number) => {
  return request.get<RepairOrder>({ url: '/operation-order/get?id=' + id })
}

// 删除工单
export const deleteRepairOrder = (id: number) => {
  return request.delete({ url: '/operation-order/delete?id=' + id })
}

// 处理工单
export interface HandlePayload {
  id: number
  operateMethod: OperateMethod
  code?: string
  userId?: number
  userNickName?: string
  remark?: string
  requestType?: string // 现场确认时必填
  questionType?: number // 现场确认时必填
  level?: CommonLevelEnum // 现场确认时必填
  pictureList?: PictureItem[] // 上传的图片（已弃用，新需求请使用下面的 picture）
  picture?: string // 以 ';' 号连接的图片名，例：aaa.jpg;bbb.png
}
export const handleRepairOrder = (data: HandlePayload) => {
  return request.put({ url: '/operation-order/workOrderCirculation', data })
}

// 获取可用二维码列表
export interface LabelCode {
  code: string
  createTime: number
  id: number
  labelId: number
  status: number
}
export const getUseableLabelCode = () => {
  return request.get<LabelCode[]>({ url: '/operation-device/getUseableLabelCode' })
}

// 查询新运维工单数量
export const getNewRepairOrder = async () => {
  return await request.get<number>({ url: '/operation-order/getUnDealOrderCount' })
}

export const getImportTemplate = async () => {
  return request.download({ url: '/operation-device-type/get-import-template' })
}

// 配置运维工单消息推送对象
export const setOrderSubscriber = async (data: { userId: number[] }) => {
  return request.post({ url: '/operation-notice-object/create', data })
}

// 查询运维工单消息推送对象
export const getOrderSubscriber = async () => {
  return request.get({ url: '/operation-notice-object/getAllUser' })
}

export const getQuestionImportTemplate = async () => {
  return request.download({ url: '/operation-question-type/get-import-template' })
}

export const getAddressImportTemplate = async () => {
  return request.download({ url: '/operation-address/get-import-template' })
}

// 导出运维工单
export const exportRepairOrder = async (params: RepairOrderPage) => {
  return request.download({ url: '/operation-order/export-excel', params })
}
