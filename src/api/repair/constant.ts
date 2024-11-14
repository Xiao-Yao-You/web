// 问题类型
export enum IssueTypeEnum {
  Software = '0',
  Hardware = '1',
  Other = '2'
}

export const IssueTypeLabel = {
  '0': '软件',
  '1': '硬件',
  '2': '其他'
}

export const IssueTypeOptions = [
  { label: '软件', value: IssueTypeEnum.Software },
  { label: '硬件', value: IssueTypeEnum.Hardware },
  { label: '其他', value: IssueTypeEnum.Other }
]

// 所属公司
export enum CompanyEnum {
  HengKe, // 恒科
  XuanDa // 轩达
}

// 使用状态
export enum UsingStatus {
  InUse, // 使用中
  Idle, // 闲置
  Scrap // 报废
}

export const UsingStatusOptions = [
  { label: '使用中', value: UsingStatus.InUse },
  { label: '闲置', value: UsingStatus.Idle },
  { label: '报废', value: UsingStatus.Scrap }
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
  Done = '04', // 已处理
  Finish = '05', // 已完成
  NoHandle = '0501', // 无需处理
  UnableFix = '0502', // 无法排除的故障
  Revoke = '06' // 撤销
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
  Restart = 'KAISHI'
  // 'CHUANGJIAN' = '创建',
  // 'PAIDAN' = '派单',
  // 'LINGDAN' = '领单',
  // 'ZHUANJIAO' = '转交',
  // 'XIANCHNAGQUEREN' = '现场确认',
  // 'GUAQI' = '挂起',
  // 'WANCHENG' = '已完成',
  // 'CHEXIAO' = '撤销'
}

// 工单报修方式
export const RepairSourceType = {
  Online: 1,
  Offline: 2,
  '1': '线上',
  '2': '线下'
}

// 领单方式
export const OrderTakeType = {
  Active: 0,
  Assign: 1,
  Transfer: 2,
  0: '主动领单',
  1: '指派工单',
  2: '转交工单'
}
