import request from '@/config/axios'

export interface UserVO {
  id: number
  username: string
  nickname: string
  deptList: Array<{ id: number; [key: string]: any }>
  postIds: string[]
  email: string
  mobile: string
  sex: number | undefined
  status: number
  remark: string
  avatar?: string
  loginDate?: Date
  createTime?: Date
  loginIp?: string
  password?: string
}

export interface UserQueryParams extends PageParam {
  deptId?: number | number[]
  username?: string
  nickname?: string
}

// 查询用户管理列表
export const getUserPage = (params: UserQueryParams, signal?: AbortSignal) => {
  return request.get<{ list: UserVO[]; total: number }>({
    url: '/system/user/page',
    params,
    signal
  })
}

// 查询所有用户列表
export const getAllUser = () => {
  return request.get({ url: '/system/user/all' })
}

// 查询用户详情
export const getUser = (id: number) => {
  return request.get<UserVO>({ url: '/system/user/get?id=' + id })
}

// 新增用户
export const createUser = (data: UserVO) => {
  return request.post({ url: '/system/user/create', data })
}

// 修改用户
export const updateUser = (data: UserVO) => {
  return request.put({ url: '/system/user/update', data })
}

// 删除用户
export const deleteUser = (id: number) => {
  return request.delete({ url: '/system/user/delete?id=' + id })
}

// 导出用户
export const exportUser = (params) => {
  return request.download({ url: '/system/user/export', params })
}

// 下载用户导入模板
export const importUserTemplate = () => {
  return request.download({ url: '/system/user/get-import-template' })
}

// 用户密码重置
export const resetUserPwd = (id: number, password: string) => {
  const data = {
    id,
    password
  }
  return request.put({ url: '/system/user/update-password', data: data })
}

// 用户状态修改
export const updateUserStatus = (id: number, status: number) => {
  const data = {
    id,
    status
  }
  return request.put({ url: '/system/user/update-status', data: data })
}

// 获取用户精简信息列表
export const getSimpleUserList = (): Promise<UserVO[]> => {
  return request.get({ url: '/system/user/simple-list' })
}
