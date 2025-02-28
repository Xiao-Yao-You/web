import request from '@/config/axios'

// 成员分组 VO
export interface MemberGroupVO {
  id: number // 分组 id
  groupId: string // 组名id（对应请求类型）
  userIds: number[] // 用户id集合
}

// 成员分组 API
// 查询成员分组分页
export const getMemberGroupPage = (params: any) => {
  return request.get<{ list: MemberGroupVO[]; total: number }>({
    url: '/operation-group/page',
    params
  })
}

// 查询成员分组详情
export const getMemberGroup = (id: number) => {
  return request.get({ url: `/operation-group/get?id=${id}` })
}

// 新增成员分组
export const createMemberGroup = (data: MemberGroupVO) => {
  return request.post({ url: '/operation-group/create', data })
}

// 修改成员分组
export const updateMemberGroup = (data: MemberGroupVO) => {
  return request.put({ url: '/operation-group/update', data })
}

// 删除成员分组
export const deleteMemberGroup = (id: number) => {
  return request.delete({ url: `/operation-group/delete?id=${id}` })
}

// 导出成员分组 Excel
export const exportMemberGroup = (params) => {
  return request.download({ url: '/operation-group/export-excel', params })
}
