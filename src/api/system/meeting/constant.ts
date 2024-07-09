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
