// 问题类型
export enum IssueTypeEnum {
  Software,
  Hardware,
  Other
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

// 影响程度
export enum EffectLevelEnum {
  Low,
  Middle,
  Height
}

export const EffectLevelOptions = [
  { label: '高', value: EffectLevelEnum.Height },
  { label: '中', value: EffectLevelEnum.Middle },
  { label: '低', value: EffectLevelEnum.Low }
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
