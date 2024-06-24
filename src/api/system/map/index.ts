/* eslint-disable no-unused-vars */
import request from '@/config/axios'

export const enum MapType {
  Warehouse = '00', // 仓库
  Workshop = '01', // 车间
  Office = '02', // 办公楼
  Restaurant = '03', // 餐厅
  Gate = '04' // 大门
}

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
  type: MapType // 类型：00:仓库,01:车间,02:办公楼,03:餐厅,04:大门
  description: string // 地点名
  longitude: number // GPS经度
  latitude: number // GPS纬度
  sort?: number // 排序
}

export type MapQuery = Partial<Omit<MapPoint, 'id'>> & {
  pageNo: number
  pageSize: number
  createTime?: [string | undefined, string | undefined]
}

/** @description 获取厂区分类枚举类型 */
export const queryCategoryEnums = async () => {
  return request.get<{ list: CategoryItem[] }>({ url: '/system/dict-data/pageIgnoreLogin' })
}

// 获取地图列表
export const getMapList = async (params: MapQuery) => {
  return request.get<{ list: MapPoint[]; total: number }>({
    url: '/map/page',
    params
  })
}

// 获取单个地点
export const getMapPoint = async (id: number) => {
  return request.get<MapPoint>({
    url: '/map/get',
    params: { id }
  })
}

// 新增地点
export const createMapPoint = async (data: Omit<MapPoint, 'id'>) => {
  return request.post({
    url: '/map/create',
    data
  })
}

// 修改单个地点
export const updateMapPoint = async (info: MapPoint) => {
  return request.put({
    url: '/map/update',
    data: info
  })
}

// 删除单个地点
export const deleteMapPoint = async (id: number) => {
  return request.delete({
    url: '/map/delete',
    params: { id }
  })
}

// 导出所有地图列表
// export const exportMapList = async () => {
//   return request.download({ url: `` })
// }
