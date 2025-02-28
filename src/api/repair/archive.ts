import request from '@/config/axios'
import { CompanyEnum, PictureType } from './constant'
import { CommonLevelEnum } from '@/utils/constants'

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
