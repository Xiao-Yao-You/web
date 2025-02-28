import request from '@/config/axios'

export interface LocationAllParams extends PageParam {
  addressName?: string
}

export type RepairLocation = {
  id: number
  addressName: string
  parentAddressId: number
  softUserId: number // 区域软件负责人
  softUserNickName: string
  hardwareUserId: number // 区域硬件负责人
  hardwareUserNickName: string
  status: number
  remark: string
  createTime: string
}

export type LocationPayload = {
  addressName: string
  parentAddressId?: number
  softUserId: number
  softUserNickName: string
  hardwareUserId: number
  hardwareUserNickName: string
  status: number
  remark: string
}

// 获取全量运维地点
export const getRepairLocationAll = (params?: LocationAllParams) => {
  return request.get<RepairLocation[]>({
    url: '/operation-address/getAll',
    params
  })
}

// 创建运维地点
export const createLocation = (data: LocationPayload) => {
  return request.post({ url: '/operation-address/create', data })
}

// 删除运维地点
export const deleteLocation = (id: number) => {
  return request.delete({ url: `/operation-address/delete?id=${id}` })
}

// 更新运维地点
export const updateLocation = (data: RepairLocation) => {
  return request.put({ url: '/operation-address/update', data })
}

// 获取运维地点详情
export const getLocationDetail = (id: number) => {
  return request.get<RepairLocation>({ url: `/operation-address/get?id=${id}` })
}
