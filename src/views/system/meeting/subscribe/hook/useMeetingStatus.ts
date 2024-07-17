import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { intervalTransform } from '@/utils/formatTime'
import { CommonStatusEnum } from '@/utils/constants'
import { MeetingStatus } from '@/api/system/meeting/constant'

export interface StatusProps {
  isCancelled: number // 是否已被撤销
  startTime: number // 时间间隔 id
  endTime: number // 时间间隔 id
  date: number[] // 会议日期
}

dayjs.extend(isBetween)

/** 日期数组转成 Dayjs 对象 */
export const dateTransfer = (date: number[]) => {
  return dayjs(date.join('-'), ['YYYY-M-D', 'YYYY-MM-DD'])
}

/** 时间间隔 id 转成对应的时间点 */
export const timeTransfer = (
  id: number,
  position: 'start' | 'end',
  dateString: string,
  format = 'YYYY-MM-DD HH:mm'
) => {
  const time = dateString + ' ' + intervalTransform(id, position)
  return dayjs(time, [format])
}

/** 计算会议状态（待开始、会议中、已结束、已撤销） */
export const handleMeetingStatus = ({ isCancelled, startTime, endTime, date }: StatusProps) => {
  const now = dayjs()
  const dateString = dateTransfer(date).format('YYYY-MM-DD')
  const beginTime = timeTransfer(startTime, 'start', dateString)
  const finishTime = timeTransfer(endTime, 'end', dateString)
  let status = -1

  if (isCancelled === CommonStatusEnum.DISABLE) {
    status = MeetingStatus.Cancel
  } else if (now.isBefore(beginTime)) {
    status = MeetingStatus.Pending
  } else if (now.isBetween(beginTime, finishTime)) {
    status = MeetingStatus.Meeting
  } else if (now.isAfter(finishTime)) {
    status = MeetingStatus.Finished
  }

  return status
}

/** @description 计算会议状态（待开始、会议中、已结束、已撤销） */
const useMeetingStatus = (props: StatusProps) => {
  const status = ref(-1)

  watchEffect(() => {
    status.value = handleMeetingStatus(props)
  })

  return {
    status
  }
}

export default useMeetingStatus
