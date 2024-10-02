import request from '@/config/axios'
import { IssueTypeEnum } from './constant'

export interface IssuesAllParams {
  name?: string // 问题类型
}

export interface RepairIssuesPage extends PageParam, IssuesAllParams {}

export type RepairIssue = {
  id: number
  name: string
  parentId?: number
  type: IssueTypeEnum
  deviceTypeId: number
  deviceTypeName?: string
  description: string
  solution: string
}

export type IssuePayload = {
  name: string
  parentId?: number
  type: IssueTypeEnum
  deviceTypeId: number
  description?: string
  solution?: string
}

// 获取问题分页
export const getRepairIssuesPage = (params: RepairIssuesPage) => {
  return request.get<{ list: RepairIssue[]; total: number }>({
    url: '/operation-question-type/page',
    params
  })
}

// 获取全量问题
export const getRepairIssuesAll = (params?: IssuesAllParams) => {
  return request.get<RepairIssue[]>({
    url: '/operation-question-type/getAll',
    params
  })
}

// 删除问题
export const deleteIssue = (id: number) => {
  return request.delete({ url: `/operation-question-type/delete?id=${id}` })
}

// 创建问题
export const createIssue = (data: IssuePayload) => {
  return request.post({ url: 'operation-question-type/create', data })
}

// 获取问题详情
export const getIssueDetail = (id: number) => {
  return request.get<RepairIssue>({ url: `/operation-question-type/get?id=${id}` })
}

// 编辑问题
export const updateIssue = (data: RepairIssue) => {
  return request.put({ url: '/operation-question-type/update', data })
}

export type RepairDevicePage = RepairIssuesPage

export type RepairDevice = {
  id: number
  name: string
  sceneCodeId: number // 设备编码规则 id
  sceneName: string // 设备编码规则名
  currentCode?: string // 设备流水号
  labelSceneCodeId: number // 标签编码规则 id
  labelSceneName: string // 标签编码规则名
  labelCurrentCode?: string // 标签流水号
  status: number
  remark: string
  creator?: string
  createTime?: string
}

export type DevicePayload = {
  name: string
  sceneCodeId: number
  sceneName: string
  currentCode?: string
  labelSceneCodeId: number
  labelSceneName: string
  labelCurrentCode?: string
  status: number
  remark: string
}

// 获取设备类型分页
export const getRepairDevicePage = (params: RepairDevicePage) => {
  return request.get<{ list: RepairDevice[]; total: number }>({
    url: '/operation-device-type/page',
    params
  })
}

// 删除设备类型
export const deleteDeviceType = (id: number) => {
  return request.delete({ url: `/operation-device-type/delete?id=${id}` })
}

// 新增设备类型
export const createDeviceType = (data: DevicePayload) => {
  return request.post({ url: '/operation-device-type/create', data })
}

// 编辑设备类型
export const updateDeviceType = (data: RepairDevice) => {
  return request.put({ url: '/operation-device-type/update', data })
}

// 获取设备类型详情
export const getDeviceTypeDetail = (id: number) => {
  return request.get<RepairDevice>({ url: `/operation-device-type/get?id=${id}` })
}

// 获取全量设备
export const getRepairDeviceAll = () => {
  return request.get<RepairDevice[]>({
    url: '/operation-device-type/getAll'
  })
}

// 批量生成标签
export type LabelItem = Record<'name' | 'labelCode', string>
export const printBatchLabels = (params: Record<'id' | 'num', Numeric>): Promise<LabelItem[]> => {
  return request.get<LabelItem[]>({
    url: '/operation-device-type/batchPrintLabelCode',
    params
  })
}

export interface LocationAllParams extends PageParam {
  addressName?: string
}

export type RepairLocation = {
  id: number
  addressName: string
  parentAddressId: number
  softUserId: number // 区域软件负责人
  softUserNickName: string
  hardwareUserId: number // 区域硬件负责人
  hardwareUserNickName: string
  status: number
  remark: string
  createTime: string
}

export type LocationPayload = {
  addressName: string
  parentAddressId?: number
  softUserId: number
  softUserNickName: string
  hardwareUserId: number
  hardwareUserNickName: string
  status: number
  remark: string
}

// 获取全量运维地点
export const getRepairLocationAll = (params?: LocationAllParams) => {
  return request.get<RepairLocation[]>({
    url: '/operation-address/getAll',
    params
  })
}

// 创建运维地点
export const createLocation = (data: LocationPayload) => {
  return request.post({ url: '/operation-address/create', data })
}

// 删除运维地点
export const deleteLocation = (id: number) => {
  return request.delete({ url: `/operation-address/delete?id=${id}` })
}

// 更新运维地点
export const updateLocation = (data: RepairLocation) => {
  return request.put({ url: '/operation-address/update', data })
}

// 获取运维地点详情
export const getLocationDetail = (id: number) => {
  return request.get<RepairLocation>({ url: `/operation-address/get?id=${id}` })
}
