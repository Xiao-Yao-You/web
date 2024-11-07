import request from '@/config/axios'
import { IssueTypeEnum, CompanyEnum, PictureType, OperateMethod, OperateStatus } from './constant'
import { CommonLevelEnum } from '@/utils/constants'

/** =========== 问题 ============== */
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

/** =========== 设备类型 ============== */

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

// 获取全量设备类型
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

/** =========== 地点 ============== */

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

/** =========== 设备档案 ============== */

export type RepairArchivePage = PageParam &
  Partial<{
    name: string
    code: string
    model: string
    labelCode: string
    assetNumber: string
    ip1: string
    macAddress1: string
    deviceType: number
    deviceTypeName: string
  }>

export type PictureItem = {
  id?: number
  deviceId?: number
  name?: string
  type: PictureType
  url: string
}

export type AccessoryItem = {
  id?: number
  deviceId?: number
  accessoryDesc: string
  model: string
  num: number
  remark: string
}

export interface RepairArchive {
  id: number // 主键
  name: string // 设备名称
  code: string // 设备编码
  deviceType: number // 设备类型
  deviceTypeName: string // 设备类型描述
  model: string // 型号
  labelCode: string // 标签code
  status: number // 状态 0:在用,1:闲置,2:报废
  company: number // 所属单位 0:恒科,1:轩达,2:其他
  serialNumber: string // 序列号
  effectLevel: number // 影响程度
  numberName: string // 编码规则 ID
  numberNameStr: string // 编码规则
  assetNumber: string // 资产编号
  macAddress1: string // mac地址1
  macAddress2: string // mac地址2
  manufactureDate: number[] // 生产日期
  warrantyDate: number[] // 质保日期
  needCheckFlag: number // 是否需要巡检，0:是 1:否
  deptId: number // 设备部门
  deptName: string // 设备部门名称
  userId: number // 使用人 ID
  userNickName: string // 使用人
  address: string // 使用地点
  addressId: number // 使用地点
  location: string // 设备位置
  ip1: string // ip1
  ip2: string // ip2
  registerUserId: number // 设备分配登记人
  registerUserName: number // 设备分配登记人
  registerDate: number // 设备分配登记时间
  scrapDate: number[] // 报废时间
  scrapType: string // 报废类型
  scrapUserId: number // 报废处理人
  scrapUserName: string // 报废处理人
  scrapDealType: string // 报废处理方式
  scrapRemark: string // 报废说明
  pictureList: PictureItem[]
  devicePictureList: PictureItem[] // 设备图片
  distributePictureList: PictureItem[] // 现场图片
  scrapPictureList: PictureItem[] // 报废图片
  accessoryList: AccessoryItem[]
}

export type ArchivePayload = {
  code?: string
  name: string
  deviceType: number
  deviceTypeName: string
  model: string
  labelCode?: string
  serialNumber: string
  numberName: string
  macAddress1: string
  macAddress2?: string
  company: CompanyEnum
  effectLevel: CommonLevelEnum
  assetNumber: string
  manufactureDate: string
  warrantyDate: string
  needCheckFlag: number
  pictureList: PictureItem[]
  accessoryList?: AccessoryItem[]
}

// 获取设备档案分页
export const getRepairArchivePage = (params: RepairArchivePage) => {
  return request.get<{ list: RepairArchive[]; total: number }>({
    url: '/operation-device/page',
    params
  })
}

// 查询运维设备档案详情
export const getRepairArchive = (id: number) => {
  return request.get<RepairArchive>({ url: '/operation-device/get?id=' + id })
}

// 根据二维码标签号查询设备详情
export const getArchiveByLabelCode = (labelCode: string) => {
  return request.get<RepairArchive>({
    url: '/operation-device/getByLabelCode?labelCode=' + labelCode
  })
}

// 新增运维设备档案
export const createRepairArchive = (data: ArchivePayload) => {
  return request.post({ url: '/operation-device/create', data })
}

// 修改运维设备档案
export const updateRepairArchive = (data: ArchivePayload) => {
  return request.put({ url: '/operation-device/update', data })
}

// 删除运维设备档案
export const deleteRepairArchive = (id: number) => {
  return request.delete({ url: '/operation-device/delete?id=' + id })
}

// 导出运维设备档案 Excel
export const exportRepairArchive = (params) => {
  return request.download({ url: '/operation-device/export-excel', params })
}

// 报废设备
export interface ScrapPayload {
  id: number
  scrapDate: string
  scrapType: number
  scrapUserId: number
  scrapDealType: number
  scrapRemark: string
  pictureList: PictureItem[]
}

export const scrapDevice = (data: ScrapPayload) => {
  return request.put({ url: '/operation-device/scrap', data })
}

// 分配设备
export interface DistributePayload {
  id: number
  deptId: number
  deptName: string
  userId: number | undefined
  addressId: number
  location: string
  ip1: string
  ip2: string
  pictureList: PictureItem[]
}

export const distributeDevice = (data: DistributePayload) => {
  return request.put({ url: '/operation-device/register', data })
}

/** =========== 工单 ============== */
export type RepairOrderPage = PageParam &
  Partial<{
    title: string
    status: string
    questionType: string
    level: string
    submitUserNickName: string
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
  requestType: string // 请求（问题）类型
  questionType: number // 问题管理中的某个具体问题的 id
  level: CommonLevelEnum // 紧急程度
  desc: string
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
  deviceName: string
  deviceId?: number
  addressId: number
  location: string
  submitUserId: number
  submitUserMobile: string
  requestType: string
  questionType: number
  level: CommonLevelEnum
  description: string
  operateMethod: OperateMethod
  sourceType: number
  // submitUserNickName: string
  // type: string
  // sourceType: string
  // dealUserId: number
  // dealUserNickName: string
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
  code?: string
  userId?: number
  userNickName?: string
  url?: PictureItem[]
  remark?: string
  operateMethod: OperateMethod
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
