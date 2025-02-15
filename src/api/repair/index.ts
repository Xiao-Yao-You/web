import request from '@/config/axios'
import { RequsetTypeEnum, CompanyEnum, PictureType, OperateMethod, OperateStatus } from './constant'
import { CommonLevelEnum } from '@/utils/constants'

// #region 问题
export interface IssuesAllParams {
  name?: string // 问题类型
}

export interface RepairIssuesPage extends PageParam, IssuesAllParams {}

export type RepairIssue = {
  id: number
  name: string
  parentId?: number
  type: RequsetTypeEnum
  deviceTypeId: number
  deviceTypeName?: string
  description: string
  solution: string
}

export type IssuePayload = {
  name: string
  parentId?: number
  type: RequsetTypeEnum
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
// #endregion

// #region 设备类型
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
export type LabelItem = {
  name: string
  labelCode: string // 设备标签号
  qr?: string // 二维码，例：https://szh.jshkxcl.cn/repair/device?qr={labelCode}
}
export const printBatchLabels = (params: Record<'id' | 'num', Numeric>): Promise<LabelItem[]> => {
  return request.get<LabelItem[]>({
    url: '/operation-device-type/batchPrintLabelCode',
    params
  })
}
// #endregion

// #region 地点
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
// #endregion

// #region 设备档案
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
  model: string // 型号 ID
  modelName: string // 型号名称
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

// 老系统设备档案分页
export interface OldRepairArchive {
  resourcename: string // 设备名称
  enable: number // 可用状态
  stateid: number // 状态id，1-库存、2-运行、3-维修、4-报废、5-借用、6-作废
  ciid: number // 设备编码
  productid: number // 设备型号 id
  productname: number // 设备型号 name
  barcode: string // 标签码
  assettag: string // 资产编码
  corporationid: number // 公司id，24-恒科、25-轩达
  corporationname: number // 公司name
  deptid: number // 部门id
  departmentname: number // 部门name
  description: string // 描述
  displayassettag1: string // 显示器资源标签1
  displayassettag2: string // 显示器资源标签2
  displayphoto: string // 显示照片
  displayserilno1: string // 显示器编号1
  displayserilno2: string // 显示器编号2
  gobalphoto: string // 全局照片
  impactid: number // 影响度，1-低、2-中、3-高
  ipaddresses1: string // ip1
  ipaddresses2: string // ip2
  location: string // 具体位置
  locationex: string // 所在地点
  macaddress1: string // mac1
  macaddress2: string // mac2
  productdate: number // 生产日期
  productphoto: string // 产品照片
  regisetperson: string // 登记人
  registerdate: number // 登记日期
  serialno: string // 序列号
  siteid: number // 地点id
  userno: string // 使用人账号
  personname: string // 使用人账号
}
export type OldArchiveParams = PageParam &
  Partial<OldRepairArchive> & {
    citype?: string // 设备类型名称
  }
export const getOldDevicePage = (params: OldArchiveParams) => {
  return request.get<{ list: OldRepairArchive[]; total: number }>({
    url: '/operation-device/oldPage',
    params
  })
}

// 查询运维设备档案详情
export const getRepairArchive = (id: number) => {
  return request.get<RepairArchive>({ url: '/operation-device/get?id=' + id })
}

// 查询老系统运维设备档案详情
export interface OldArchiveDetail extends OldRepairArchive {
  registerperson: string // 登记人
  registerdate: number // 登记时间
  productPhotoList: string[] // 设备照片
  globalPhotoList: string[] // 现场照片
  typeName: string // 设备类型名称
}
export const getOldArchiveDetail = (ciid: number) => {
  return request.get<OldArchiveDetail>({ url: '/operation-device/getOldDevice?ciid=' + ciid })
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
  address: string
  addressIdList: number[]
  location: string
  ip1: string
  ip2: string
  pictureList: PictureItem[]
}

export const distributeDevice = (data: DistributePayload) => {
  return request.put({ url: '/operation-device/register', data })
}

// 同步老系统的设备档案
export const syncOldDevice = () => {
  return request.post({ url: '/operation-device/syncOldDevice' })
}
// #endregion

// #region 工单
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
// #endregion

// #region 设备型号管理
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
// #endregion
