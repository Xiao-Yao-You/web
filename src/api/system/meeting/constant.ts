import type { TagProps } from 'element-plus'

export enum MeetingPosition {
  Headquarter, // 指挥部
  Factory, // 厂区
  Dormitory // 生活区
}

export const positionOptions = [
  { label: '指挥部', value: MeetingPosition.Headquarter },
  { label: '厂区', value: MeetingPosition.Factory },
  { label: '生活区', value: MeetingPosition.Dormitory }
]

// 会议状态
export enum MeetingStatus {
  Pending, // 待开始
  Meeting, // 会议中
  Finished, // 已结束
  Cancel // 已撤销
}

export const MeetingStatusTag: { [P in `${MeetingStatus}`]: OptionItem<TagProps['type']> } = {
  [MeetingStatus.Pending]: {
    label: '待开始',
    value: 'success'
  },
  [MeetingStatus.Meeting]: {
    label: '会议中',
    value: 'warning'
  },
  [MeetingStatus.Finished]: {
    label: '已结束',
    value: 'info'
  },
  [MeetingStatus.Cancel]: {
    label: '已撤销',
    value: 'danger'
  }
}
