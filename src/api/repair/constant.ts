import { CommonLevelEnum } from '@/utils/constants'
import { getDictLabel, DICT_TYPE } from '@/utils/dict'

// 获取请求类型的名称
export const getRequestTypeLabel = (value: any) => {
  return getDictLabel(DICT_TYPE.REPAIR_REQUEST_TYPE, value)
}

// 所属公司
export enum CompanyEnum {
  HengKe, // 恒科
  XuanDa // 轩达
}

// 使用状态
export enum UsingStatus {
  InUse, // 使用中
  Idle, // 闲置
  Scrap, // 报废
  Maintain, // 维修
  Inventory, // 库存
  Borrow, // 借用
  Repealed // 作废
}

export const UsingStatusOptions = [
  { label: '使用中', value: UsingStatus.InUse },
  { label: '闲置', value: UsingStatus.Idle },
  { label: '报废', value: UsingStatus.Scrap },
  { label: '维修', value: UsingStatus.Maintain },
  { label: '库存', value: UsingStatus.Inventory },
  { label: '借用', value: UsingStatus.Borrow },
  { label: '作废', value: UsingStatus.Repealed }
]

// 照片类型
export enum PictureType {
  Device, // 设备照片
  Scene, // 现场照片
  Scrap // 报废照片
}

// 工单处理状态
export enum OperateStatus {
  Dispatch = '00', // 待分配（此时无人认领）
  Receive = '01', // 待处理（此时已派单或主动接单）
  Handling = '02', // 进行中
  HangUp = '03', // 挂起
  OutSourcing = '04', // 委外维修
  Done = '05', // 已处理
  Finish = '06', // 已完成
  NoHandle = '0601', // 无需处理
  UnableFix = '0602', // 无法排除的故障
  Revoke = '07', // 撤销
  Close = '08' // 后台直接关闭
}

// 工单处理方式
export enum OperateMethod {
  Create = 'CHUANGJIAN',
  Dispatch = 'PAIDAN',
  Receive = 'LINGDAN',
  Transfer = 'ZHUANJIAO',
  Confirm = 'XIANCHNAGQUEREN',
  HangUp = 'GUAQI',
  Finish = 'WANCHENG',
  Revoke = 'CHEXIAO',
  Restart = 'KAISHI',
  Close = 'CLOSEORDER'
  // CHUANGJIAN: '创建',
  // PAIDAN: '派单',
  // LINGDAN: '抢单',
  // ZHUANJIAO: '转交',
  // XIANCHNAGQUEREN: '现场确认',
  // GUAQI: '挂起',
  // WANCHENG: '已完成',
  // CHEXIAO: '撤销',
  // KAISHI: '重启',
}

/**
 * @description 后端工单处理方式对应的枚举
 * @readonly
 * @enum {string}
 */
export const OperateType = {
  CHUANGJIAN: 99,
  PAIDAN: 0,
  LINGDAN: 1,
  ZHUANJIAO: 2,
  XIANCHNAGQUEREN: 3,
  GUAQI: 4,
  WANCHENG: 5,
  CHEXIAO: 6,
  KAISHI: 7,
  OUTSOURCING: 8,
  OUTSOURCING_RESTART: 9,
  CLOSEORDER: 10,
  99: '创建',
  0: '派单',
  1: '抢单',
  2: '转交',
  3: '现场确认',
  4: '挂起',
  5: '已完成',
  501: '无需处理',
  502: '无法排除故障',
  6: '撤销',
  7: '重启',
  8: '委外维修',
  9: '委外维修/重启',
  10: '关单'
}

// 工单报修方式
export const RepairSourceType = {
  Online: 1,
  Offline: 2,
  '1': '线上',
  '2': '线下'
}

// 领单方式（已创建字典，注意更新）
export const OrderTakeType = {
  Assign: 0,
  Active: 1,
  Transfer: 2,
  0: '指派工单',
  1: '主动领单',
  2: '转交工单'
}

// 新老系统的等级程度换算
export const OldLevelTransfer = {
  '1': CommonLevelEnum.Low,
  '2': CommonLevelEnum.Middle,
  '3': CommonLevelEnum.Height
}

// 新老系统的公司id换算
export const OldCompanyTransfer = {
  '24': CompanyEnum.HengKe,
  '25': CompanyEnum.XuanDa,
  [CompanyEnum.HengKe]: 24,
  [CompanyEnum.XuanDa]: 25
}

export const COMPUTER_TYPE_ID = import.meta.env.PROD ? 50 : 47 // 计算机类型
export const IPC_TYPE_ID = import.meta.env.PROD ? 56 : 53 // IPC 工控主机类型
export const PC_TYPES = [COMPUTER_TYPE_ID, IPC_TYPE_ID]
