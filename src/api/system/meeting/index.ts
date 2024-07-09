import request from '@/config/axios'

// 会议室管理 VO
export interface MeetingRoomsVO {
  id: number // 主键
  name: string // 名称
  position: number // 位置(0:指挥部,1:厂区,2:生活区)
  roomNo: string // 房间号
  capacity: number // 容纳人数
  status: number // 状态(0:开启,1:禁用)
  remark: string // 备注
}

// 会议室管理 API
export const MeetingRoomsApi = {
  // 查询会议室管理分页
  getMeetingRoomsPage: async (params: any) => {
    return await request.get({ url: `/meeting/page`, params })
  },

  // 查询会议室管理详情
  getMeetingRooms: async (id: number) => {
    return await request.get({ url: `/meeting/get?id=` + id })
  },

  // 新增会议室管理
  createMeetingRooms: async (data: MeetingRoomsVO) => {
    return await request.post({ url: `/meeting/create`, data })
  },

  // 修改会议室管理
  updateMeetingRooms: async (data: MeetingRoomsVO) => {
    return await request.put({ url: `/meeting/update`, data })
  },

  // 删除会议室管理
  deleteMeetingRooms: async (id: number) => {
    return await request.delete({ url: `/meeting/delete?id=` + id })
  },

  // 导出会议室管理 Excel
  exportMeetingRooms: async (params) => {
    return await request.download({ url: `/meeting/export-excel`, params })
  }
}
