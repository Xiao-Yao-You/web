/* eslint-disable no-unused-vars */
import request from '@/config/axios'
import { CategoryItem, MapQuery, MapPoint } from './map.type'
export * from './constant'
export * from './map.type'

/** @description 获取厂区分类枚举类型 */
export const queryCategoryEnums = async () => {
  return request.get<{ list: CategoryItem[] }>({
    url: '/system/dict-data/pageIgnoreLogin',
    params: {
      dictType: 'hk_map_coordinate_info_type', // 指明哪张字典表
      pageSize: 100
    }
  })
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
