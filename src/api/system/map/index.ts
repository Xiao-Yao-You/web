/* eslint-disable no-unused-vars */
import request from '@/config/axios'

// 园区
export enum ZoneType {
  NanTong = '00', // 南通
  '00' = 'NanTong'
}

// 厂区
export enum FactoryType {
  HengKe = '00', // 恒科
  XuanDa = '01', // 轩达
  '00' = 'HengKe',
  '01' = 'XuanDa'
}

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
  name: string // 地点名
  type: MapType // 类型
  description: string // 描述
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
