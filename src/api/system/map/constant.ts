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

// 地点类型
export const enum MapType {
  Warehouse = '00', // 成品仓库
  Workshop = '01', // 立库
  Futures = '02', // 期货仓库
  Restaurant = '03', // 切片
  Gate = '04', // 大门
  Canteen = '05', // 食堂
  FireFighting = '06', // 消防
  Office = '07', // 办公楼
  Wharf = '08', // 码头
  Public = '09', // 公共服务
  Materiel = '10' // 机物料仓库
}
