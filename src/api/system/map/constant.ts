// 园区
export enum ZoneType {
  NanTong = '00', // 南通
  '00' = 'NanTong'
}

// 厂区
export enum FactoryType {
  HengKe = '00', // 恒科
  XuanDa = '01', // 轩达
  Public = '02', // 公共
  '00' = 'HengKe',
  '01' = 'XuanDa',
  '02' = 'Public'
}

// 厂区列表
export const FactoryOptions = [
  { label: '恒科', value: FactoryType.HengKe },
  { label: '轩达', value: FactoryType.XuanDa },
  { label: '公共', value: FactoryType.Public }
]
