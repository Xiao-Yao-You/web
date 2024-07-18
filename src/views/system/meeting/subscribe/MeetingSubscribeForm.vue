<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="110px"
      v-loading="formLoading"
    >
      <el-form-item label="会议主题" prop="subject">
        <el-input
          v-model="formData.subject"
          placeholder="请输入会议主题"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-row>
        <el-col :lg="12">
          <el-form-item label="发起人" prop="userNickName">
            <el-input v-model="formData.userNickName" disabled />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="联系方式" prop="userPhone">
            <el-input
              v-model="formData.userPhone"
              placeholder="请输入联系方式"
              :disabled="!!formData.userPhone"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="会议日期" prop="dateMeeting">
        <el-date-picker
          v-model="formData.dateMeeting"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择会议日期"
          :disabled-date="getDisabledDate"
        />
      </el-form-item>
      <el-form-item label="会议室" prop="meetingRoomName">
        <el-input
          v-model="formData.meetingRoomName"
          placeholder="点击右侧查看，选择会议室"
          class="!w-40% mr-5px"
        />
        <el-button type="primary" :loading="roomLoading" @click="onRoomClick">查看</el-button>
      </el-form-item>
      <el-form-item label="会议时间段" prop="range">
        <TimeRangePicker
          ref="timeRangeRef"
          v-model="formData.range"
          class="time-range ml-3"
          :hidden-date="getHiddenDate"
          :disabled-date="(endTime, id) => getForbiddenDate(endTime, id, selectedRoom.list)"
        />
        <el-input
          :model-value="rangeInput"
          placeholder="开始时间 —— 结束时间"
          class="time-range-input !w-65%"
        >
          <template #prefix>
            <TimeIcon />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="内部与会人员" prop="joinUserId">
        <TreeTransfer
          :data="deptList"
          :props="{ label: 'name', isLeaf: 'isLeaf' }"
          node-key="id"
          show-checkbox
          lazy
          :load="loadMember"
          @change="onTreeChange"
        >
          <template #empty>
            <el-empty description="暂无会议室数据" />
          </template>
        </TreeTransfer>
      </el-form-item>
      <el-form-item label="与会总人数" prop="capacity">
        <el-input-number
          v-model="formData.capacity"
          placeholder="请输入总人数"
          :min="formData.joinUserId.length || 1"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="设备需求" prop="equipment">
        <el-select
          :model-value="formData.equipment"
          multiple
          placeholder="请选择需要的设备"
          clearable
          @change="onEquipmentChange"
        >
          <el-option
            v-for="item in props.equipments"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          placeholder="请输入备注"
          :rows="2"
          type="textarea"
          show-word-limit
          maxlength="50"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>

  <!-- 会议室列表选择 -->
  <el-drawer v-model="drawerShow" title="会议室预约情况">
    <el-empty v-if="!roomList.length" description="暂无会议室数据" />
    <el-card
      v-else
      v-for="item in roomList"
      :key="item.meetingRoomId"
      class="room-item mb-4"
      shadow="never"
    >
      <template #header>
        <h4 class="flex justify-between items-center m-0">
          <span>
            {{ t(`position.${MeetingPosition[item.position]}`) + ' — ' + item.name }}<br />
            <span class="text-12px text-slate-400 font-medium">
              {{ `容纳 ${item.capacity} 人` }}
            </span>
          </span>
          <el-button type="primary" @click="onRoomSelect(item)">选择</el-button>
        </h4>
      </template>
      <TimeRangePicker
        class="ml-3"
        :hidden-date="getHiddenDate"
        :disabled-date="(endTime, id) => getForbiddenDate(endTime, id, item.list)"
        forbidden
      />
    </el-card>
  </el-drawer>
</template>
<script setup lang="ts">
import dayjs from 'dayjs'
import { TimeRangePicker } from '@/components/TimeRangePicker'
import { TreeTransfer } from '@/components/TreeTransfer'
import {
  MeetingSubscribeApi,
  MeetingSubscribeVO,
  MeetingRoomsApi,
  MeetingRoomsRecord
} from '@/api/system/meeting'
import { useUserStore } from '@/store/modules/user'
import { useIcon } from '@/hooks/web/useIcon'
import { MeetingPosition } from '@/api/system/meeting/constant'
import { getDeptPage } from '@/api/system/dept'
import { handleTree } from '@/utils/tree'
import { getUserPage } from '@/api/system/user'
import type Node from 'element-plus/es/components/tree/src/model/node'

/** 会议预约 表单 */
defineOptions({ name: 'MeetingSubscribeForm' })

const props = withDefaults(
  defineProps<{
    equipments: OptionItem[]
  }>(),
  {
    equipments: () => []
  }
)

const TimeIcon = useIcon({ icon: 'ep:clock' })
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const userInfo = useUserStore().getUser

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的主题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  subject: '',
  userNickName: userInfo.nickname,
  userPhone: userInfo.mobile,
  dateMeeting: dayjs(new Date()).format('YYYY-MM-DD'),
  range: [
    { label: '', value: -1 },
    { label: '', value: -1 }
  ], // 起止时间点
  meetingRoomId: undefined as unknown as number,
  meetingRoomName: '',
  joinUserId: [] as number[],
  capacity: undefined as unknown as number,
  equipment: [] as number[],
  remark: ''
})
const formRules = reactive({
  subject: [{ required: true, message: '会议主题不能为空', trigger: 'blur' }],
  userPhone: [
    { required: true, message: '联系方式不能为空', trigger: 'blur' },
    {
      regexp:
        /^(?:(?:\+|00)86)?1(?:(?:3[\d])|(?:4[5-79])|(?:5[0-35-9])|(?:6[5-7])|(?:7[0-8])|(?:8[\d])|(?:9[1589]))\d{8}$/,
      message: '手机号码格式不正确',
      trigger: 'blur'
    }
  ],
  meetingRoomId: [{ required: true, message: '会议室不能为空', trigger: 'blur' }],
  meetingRoomName: [{ required: true, message: '会议室不能为空', trigger: 'blur' }],
  range: [
    {
      trigger: 'change',
      validator(_rule, _value, cb: Function) {
        if (formData.value.meetingRoomId) {
          return cb(undefined)
        } else {
          formData.value.range = [
            { label: '', value: -1 },
            { label: '', value: -1 }
          ]
          timeRangeRef.value?.clear()
          return cb(new Error('请先选择会议室'))
        }
      }
    },
    {
      validator(_rule, value, cb: Function) {
        const [startTime, endTime] = value
        if (startTime.label && endTime.label) return cb()
        cb(new Error('会议时间段不能为空'))
      }
    }
  ],
  joinUserId: [{ required: true, message: '内部与会人数不能为空', trigger: 'change' }],
  capacity: [{ required: true, message: '总人数不能为空', trigger: 'blur' }],
  equipment: [{ required: true, message: '设备需求不能为空' }]
})
const formRef = ref() // 表单 Ref

// #region 会议时间段组件相关
// 日期禁用函数（当天之前禁用）
const getDisabledDate = (time: Date) => {
  const nowDay = dayjs(new Date()).format('YYYY-MM-DD')
  const currentDay = dayjs(time).format('YYYY-MM-DD')
  return dayjs(nowDay).isAfter(currentDay)
}
// 时间间隔隐藏函数（8点之前隐藏）
const getHiddenDate = (startTime: string) => {
  return dayjs(startTime, 'HH:mm').isBefore(dayjs('08:00', 'HH:mm'))
}
// 时间间隔禁用函数（当前时间之前和已被占用的间隔需要禁用）
const getForbiddenDate = (endTime: string, id: number, list: MeetingRoomsRecord['list']) => {
  let isBefore = false
  if (endTime) {
    const currTime = dayjs().format('HH:mm')
    isBefore = dayjs(endTime, 'HH:mm').isBefore(dayjs(currTime, 'HH:mm'), 'minute')
  }

  const timeKeys = list.map((item) => item.timeKey)
  const isOccupied = timeKeys.includes(id)

  return isBefore || isOccupied
}
// 显式在输入框中的时间段
const rangeInput = computed(() => {
  const [start, end] = formData.value.range
  return `${start.label ? start.label : '开始时间'} —— ${end.label ? end.label : '结束时间'}`
})
// #endregion

// #region 查看会议室预约记录
const timeRangeRef = ref()
const drawerShow = ref(false) // 会议室抽屉
const roomLoading = ref(false)
const roomList = ref<MeetingRoomsRecord[]>([]) // 会议室列表数据
const selectedRoom = ref({ list: [] } as unknown as MeetingRoomsRecord) // 当前选择的会议室数据
const onRoomClick = async () => {
  roomLoading.value = true
  try {
    const data = await MeetingRoomsApi.getMeetingRoomsRecord({
      date: formData.value.dateMeeting
    })
    // 整合并收集同一个会议室的不同预约会议的 timeKey
    data.forEach((room) => {
      room['timeKeys'] = room.list.reduce((collector, item) => {
        collector.push(item.timeKey)
        return collector
      }, [] as number[])
    })
    roomList.value = data
    drawerShow.value = true
  } finally {
    roomLoading.value = false
  }
}
const onRoomSelect = (info: MeetingRoomsRecord) => {
  if (formData.value.meetingRoomId !== info.meetingRoomId) {
    selectedRoom.value = info
    // @ts-ignore
    formData.value.meetingRoomId = info.meetingRoomId
    formData.value.meetingRoomName = info.name
    timeRangeRef.value?.clear()
    formData.value.range = [
      { label: '', value: -1 },
      { label: '', value: -1 }
    ]
  }
  drawerShow.value = false
}
// #endregion

// #region 与会人员相关
// 查询部门
const deptList = ref()
const getDeptList = async () => {
  const data = await getDeptPage({ pageNo: 1, pageSize: 100 })
  deptList.value = handleTree(data)
}
// 根据部门 id 动态加载人员
const loadMember = async (node: Node, resolve: (data: Tree[]) => void) => {
  const { data, level } = node
  // 1. 第一层级 level 为 0
  if (level === 0) return resolve(data as Tree[])
  // 2.其他层级
  if (Array.isArray(data.children) && data.children.length) {
    return resolve(data.children)
  }

  // 3. 如果当前部门节点下没有 children，则视为最里面的部门，可以开始请求人员节点了
  getUserPage({ pageNo: 1, pageSize: 100, deptId: data.id }).then(({ list }) => {
    const memberNodes = list.map((m) => ({
      id: m.id,
      name: m.nickname,
      isLeaf: true
    }))
    memberNodes.push({
      id: 201,
      name: '我尼玛',
      isLeaf: true
    })
    return resolve(memberNodes)
  })
}
const onTreeChange = (keys: number[]) => {
  formData.value.joinUserId = keys
  if (keys.length > (formData.value.capacity || 0)) {
    formData.value.capacity = keys.length
  }
}
onMounted(() => {
  getDeptList()
})
// #endregion

// #region 设备选择相关
const onEquipmentChange = (values: number[]) => {
  const lastValue = values.at(-1)
  formData.value.equipment = lastValue === -1 ? [-1] : values.filter((v) => v !== -1)
}
// #endregion

// #region 表单的重置与提交
// 提交表单
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const { range, equipment, ...rest } = formData.value
    const [startTime, endTime] = range

    const data: MeetingSubscribeVO = {
      equipment: equipment.includes(-1) ? [] : equipment,
      startTime: startTime.value,
      endTime: endTime.value,
      ...rest
    }

    if (formType.value === 'create') {
      await MeetingSubscribeApi.createMeetingSubscribe(data)
      message.success(t('common.createSuccess'))
    } else {
      await MeetingSubscribeApi.updateMeetingSubscribe(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}
// 重置表单
const resetForm = () => {
  formData.value = {
    subject: '',
    userNickName: userInfo.nickname,
    userPhone: userInfo.mobile,
    dateMeeting: dayjs(new Date()).format('YYYY-MM-DD'),
    range: [
      { label: '', value: -1 },
      { label: '', value: -1 }
    ],
    meetingRoomId: undefined as unknown as number,
    meetingRoomName: '',
    joinUserId: [],
    capacity: undefined as unknown as number,
    equipment: [],
    remark: ''
  }
  formRef.value?.resetFields()
  selectedRoom.value = { list: [] } as unknown as MeetingRoomsRecord
}
// #endregion

// #region 打开弹框
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const res = await MeetingSubscribeApi.getMeetingSubscribe(id)
      console.log('🚀 ~ res:', res)
      // formData.value = res
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
// #endregion
</script>

<style scoped lang="scss">
/* stylelint-disable media-feature-range-notation */
@media screen and (min-width: 1600px) {
  .time-range {
    width: 83%;
  }
}

@media screen and (min-width: 1800px) {
  .time-range {
    width: 70%;
  }
}

@media screen and (min-width: 1920px) {
  .time-range {
    width: 66%;
  }
}

.time-range-input :deep(.el-input__inner) {
  color: var(--el-disabled-text-color);
}

.room-item:last-child {
  margin-bottom: 0;
}
</style>
