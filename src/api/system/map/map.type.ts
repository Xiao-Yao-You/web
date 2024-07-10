export interface CategoryItem {
  id: number
  sort: number
  label: string
  value: string
  dictType: string
  status: number
  colorType: string
  cssClass: string
  remark: string
  createTime: number
}
// 厂区地图定位详细信息
export interface MapPoint {
  id: number // 地点 id
  zoneType: string // 园区，00:南通产业园
  factoryCode: string // 厂区，00: 恒科，01：轩达
  code: string // 地点编号
  name: string // 财务对外的地点名
  alias: string // 常用的口头地点别名
  markName: string // 建筑物标记的地点名
  type: string // 类型
  longitude: number // GPS 经度
  latitude: number // GPS 纬度
  status: number
  image: string
  creator: string
  createTime: number
  sort: number // 排序
}
// 地点列表查询参数
export type MapQuery = Partial<
  Omit<MapPoint, 'id' | 'sort' | 'image' | 'sort' | 'creator' | 'createTime'>
> & {
  pageNo: number
  pageSize: number
  createTime?: [string | undefined, string | undefined]
}
