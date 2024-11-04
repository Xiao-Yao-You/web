import request from '@/config/axios'
import { MeetingPosition } from '@/api/system/meeting/constant'

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

export interface MeetingRoomsRecord {
  meetingRoomId: number // 会议室 id
  position: MeetingPosition // 会议室所属位置
  capacity: number // 容纳人数
  name: string // 会议室名称
  timeKey?: number[] // 所有预约会议的间隔
  list: Array<{
    meetingRoomId: number // 会议室 id
    meetingBookId: number // 会议 id
    timeKey: number
    dateMeeting: string
    createTime: string
    updateTime: string
    creator: string
    updater: string
    deleted: true
    subject: string
    userPhone: string
    id: number
  }>
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
  },

  // 查询会议室的预约记录
  getMeetingRoomsRecord: async (params: { date: string; meetingIdList?: number[] }) => {
    return request.get<MeetingRoomsRecord[]>({ url: '/meetingRoomBookRecord/get', params })
  }
}

export type JoinUser = {
  userNickName: string
  userId: number
}

// 会议操作（增、改）
export interface MeetingSubscribeVO {
  capacity: number // 与会人数
  dateMeeting: string | number[] // 会议日期
  endTime: number // 结束时间（timeKey）
  equipment: (string | number)[] // 设备
  hostUserNickName: string // 主持人
  joinUserList: JoinUser[] // 参与会议的用户 id
  meetingRoomId: number // 会议室ID
  meetingRoomName: string // 会议室名
  otherAttend: string[] // 外部与会人员
  remark: string // 备注
  startTime: number // 开始时间（timeKey）
  subject: string // 名称
  userNickName: string
  userPhone: string // 用户联系电话
}

// 会议信息
export interface MeetingSubscribeInfo extends MeetingSubscribeVO {
  id: number
  userId: number
  status: number // 0 正常 1 撤销
  createTime: number
  dateMeeting: number[] // 会议日期
}

// 会议预约 API
export const MeetingSubscribeApi = {
  // 查询会议预约分页
  getMeetingSubscribePage: (params: any) => {
    return request.get<{ list: MeetingSubscribeInfo[]; total: number }>({
      url: `/bookMeeting/page`,
      params
    })
  },

  // 新增会议预约
  createMeetingSubscribe: async (data: MeetingSubscribeVO) => {
    return await request.post({ url: `/bookMeeting/create`, data })
  },

  // 查询会议预约详情
  getMeetingSubscribe: async (id: number) => {
    return await request.get<MeetingSubscribeInfo>({ url: `/bookMeeting/get?id=` + id })
  },

  // 修改会议预约
  updateMeetingSubscribe: async (data: MeetingSubscribeVO) => {
    return await request.put({ url: `/bookMeeting/update`, data })
  },

  // 撤销会议预约
  cancelMeetingSubscribe: async (id: number) => {
    return await request.put({ url: `/bookMeeting/cancel?id=` + id })
  },

  // 删除会议预约
  deleteMeetingSubscribe: async (id: number) => {
    return await request.delete({ url: `/bookMeeting/delete?id=` + id })
  },

  // 导出会议预约 Excel
  exportMeetingSubscribe: async (params) => {
    return await request.download({ url: `/bookMeeting/export-excel`, params })
  }
}
