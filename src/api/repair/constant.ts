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

// 所属厂区
export enum CompanyEnum {
  HengKe,
  XuanDa,
  Other
}

export const CompanyOptions = [
  { label: '恒科', value: CompanyEnum.HengKe },
  { label: '轩达', value: CompanyEnum.XuanDa },
  { label: '其他', value: CompanyEnum.Other }
]

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

// 工单处理类型
export enum OperateType {
  Dispatch = '00',
  Receive = '01',
  Transfer = '02',
  Confirm = '03',
  HangUp = '04',
  Finish = '05',
  NoHandle = '0501',
  UnableFix = '0502',
  Revoke = '06',
  '00' = '派单',
  '01' = '领单',
  '02' = '转交',
  '03' = '现场确认',
  '04' = '挂起',
  '05' = '已完成',
  '0501' = '无需处理',
  '0502' = '无法排除故障',
  '06' = '撤销'
}
