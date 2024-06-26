import request from '@/config/axios'

export interface TenantVO {
  name: string // 租户名
  contactName: string // 联系人
  status: number // 租户状态
  packageId: number // 租户套餐编号
  username: string // 用户账号
  password: string // 密码
  expireTime: Date // 过期时间
  accountCount: number // 账号数量
  id: number // 租户编号
  contactMobile?: string // 联系手机
  website?: string // 绑定手机
  createTime?: Date
}

export interface TenantPageReqVO extends PageParam {
  name?: string
  contactName?: string
  contactMobile?: string
  status?: number
  createTime?: Date[]
}

export interface TenantExportReqVO {
  name?: string
  contactName?: string
  contactMobile?: string
  status?: number
  createTime?: Date[]
}

export interface TenantUserItem {
  createTime: string
  updateTime: string
  creator: string
  updater: string
  deleted: boolean
  id: number
  userId: number
  tenantId: number
  tenantName: string
}

export interface TenantUpdateReqVO {
  userId: number
  tenantIdList: number[]
  tenantType?: number
}

// 查询租户列表
export const getTenantPage = (params: TenantPageReqVO) => {
  return request.get<{ list: TenantVO[] }>({ url: '/system/tenant/page', params })
}

// 查询租户详情
export const getTenant = (id: number) => {
  return request.get({ url: '/system/tenant/get?id=' + id })
}

// 新增租户
export const createTenant = (data: TenantVO) => {
  return request.post({ url: '/system/tenant/create', data })
}

// 修改租户
export const updateTenant = (data: TenantVO) => {
  return request.put({ url: '/system/tenant/update', data })
}

// 删除租户
export const deleteTenant = (id: number) => {
  return request.delete({ url: '/system/tenant/delete?id=' + id })
}

// 导出租户
export const exportTenant = (params: TenantExportReqVO) => {
  return request.download({ url: '/system/tenant/export-excel', params })
}

// 查询用户的租户信息
export const queryUserTenant = (params: { userId: number }) => {
  return request.get<{ tenantDOList: TenantUserItem[] }>({
    url: '/system/user/profile/queryUserTenant',
    params
  })
}

// 修改用户的租户信息
export const updateUserTenant = (data: TenantUpdateReqVO) => {
  return request.put({ url: '/system/user/ignoreTenant/updateUserTenant', data })
}
