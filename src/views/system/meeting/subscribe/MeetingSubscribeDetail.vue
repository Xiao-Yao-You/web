<script setup lang="ts">
import dayjs from 'dayjs'
import { isEmpty } from 'lodash-es'
import MeetingStatusTag from './MeetingStatusTag.vue'
import { MeetingSubscribeApi, MeetingSubscribeInfo } from '@/api/system/meeting'
import { formatDate, intervalTransform } from '@/utils/formatTime'

defineOptions({
  name: 'MeetingSubscribeDetail'
})

const props = withDefaults(defineProps<{ equimentDict: Record<string, string> }>(), {
  equimentDict: () => ({})
})

const detailVisible = ref(false)
const loading = ref(false)
const form = ref<Omit<MeetingSubscribeInfo, 'id' | 'userId' | 'meetingRoomId'>>({
  subject: '',
  status: -1,
  startTime: undefined as unknown as number,
  endTime: undefined as unknown as number,
  dateMeeting: [] as number[],
  userNickName: '',
  userPhone: '',
  meetingRoomName: '',
  capacity: undefined as unknown as number,
  joinUserList: [],
  otherAttend: [],
  equipment: [] as number[],
  createTime: 0,
  remark: ''
})

// 会议时长
const duration = computed(() => {
  const beginTime = intervalTransform(form.value.startTime, 'start')
  const finishedTime = intervalTransform(form.value.endTime, 'end')
  return dayjs(finishedTime, 'HH:mm').diff(dayjs(beginTime, 'HH:mm'), 'minute')
})

// 所需设备
const equimentList = computed(() => {
  if (isEmpty(props.equimentDict)) return ''

  return isEmpty(form.value.equipment)
    ? '无'
    : form.value.equipment.map((e) => props.equimentDict[e]).join('、')
})

// 会议日期
const meetingDate = computed(() => {
  if (isEmpty(form.value.dateMeeting)) return ''
  return isEmpty(form.value.dateMeeting) ? '' : form.value.dateMeeting.join('-')
})

// 内部人员
const internalUserList = computed(() => {
  if (isEmpty(form.value.joinUserList)) return '无'
  return form.value.joinUserList.map((u) => u.userNickName).join('、')
})

// 外部人员
const externalUserList = computed(() => {
  if (isEmpty(form.value.otherAttend)) return '无'
  return form.value.otherAttend.join('、')
})

const open = async (id: number) => {
  resetForm()
  detailVisible.value = true
  // resetForm()
  // 修改时，设置数据
  loading.value = true
  try {
    form.value = await MeetingSubscribeApi.getMeetingSubscribe(id)
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    subject: '',
    status: -1,
    startTime: undefined as unknown as number,
    endTime: undefined as unknown as number,
    dateMeeting: [] as number[],
    userNickName: '',
    userPhone: '',
    meetingRoomName: '',
    capacity: undefined as unknown as number,
    joinUserList: [],
    otherAttend: [],
    equipment: [] as number[],
    createTime: 0,
    remark: ''
  }
}

defineExpose({ open })
</script>

<template>
  <Dialog title="会议详情" v-model="detailVisible">
    <el-descriptions :column="2" border v-loading="loading">
      <el-descriptions-item label="会议主题" min-width="100">
        {{ form.subject }}
      </el-descriptions-item>
      <el-descriptions-item label="会议室">
        {{ form.meetingRoomName }}
      </el-descriptions-item>
      <el-descriptions-item label="会议状态">
        <MeetingStatusTag
          v-if="form.startTime"
          :isCancelled="form.status"
          :startTime="form.startTime"
          :endTime="form.endTime"
          :date="form.dateMeeting"
        />
      </el-descriptions-item>
      <el-descriptions-item label="会议日期">
        {{ formatDate(meetingDate, 'YYYY-MM-DD') }}
      </el-descriptions-item>
      <el-descriptions-item label="会议时长">
        {{ duration + ' 分钟' }}
      </el-descriptions-item>
      <el-descriptions-item label="会议主持人">
        {{ form.userNickName }}
      </el-descriptions-item>
      <el-descriptions-item label="发起人">
        {{ form.userNickName }}
      </el-descriptions-item>
      <el-descriptions-item label="联系方式">
        {{ form.userPhone }}
      </el-descriptions-item>
      <el-descriptions-item label="内部人员">
        {{ internalUserList }}
      </el-descriptions-item>
      <el-descriptions-item label="外部人员">
        {{ externalUserList }}
      </el-descriptions-item>
      <el-descriptions-item label="与会人数">
        {{ form.capacity + ' 人' }}
      </el-descriptions-item>
      <el-descriptions-item label="设备需求">
        {{ equimentList }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ form.createTime ? formatDate(form.createTime, 'YYYY-MM-DD') : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="备注" label-class-name="remark-label">
        {{ form.remark }}
      </el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>

<style scoped>
:deep(.remark-label) {
  min-width: 110px;
}
</style>
