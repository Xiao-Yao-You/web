<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="会议主题" prop="subject">
        <el-input
          v-model="queryParams.subject"
          placeholder="请输入会议主题"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="会议日期" prop="date" :label-width="90">
        <el-date-picker
          v-model="queryParams.date"
          type="daterange"
          value-format="YYYY-MM-DD"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['hk:user-book-meeting:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <!-- <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['system:meeting-subscribe:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button> -->
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true">
      <el-table-column label="序号" align="center" width="60px">
        <template #default="{ $index }">
          {{ $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="会议主题" align="center" prop="subject" />
      <el-table-column label="会议室" align="center" prop="meetingRoomName" />
      <el-table-column label="会议状态" align="center" prop="status" width="90">
        <template #default="{ row: { status, startTime, endTime, dateMeeting } }">
          <MeetingStatusTag
            :isCancelled="status"
            :startTime="startTime"
            :endTime="endTime"
            :date="dateMeeting"
          />
        </template>
      </el-table-column>
      <el-table-column label="会议日期" align="center" prop="dateMeeting" width="110">
        <template #default="{ row: { dateMeeting } }">
          {{ formatDate(dateMeeting, 'YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column label="会议时间" align="center" width="120">
        <template #default="{ row: { startTime, endTime } }">
          {{ `${intervalTransform(startTime, 'start')} - ${intervalTransform(endTime, 'end')}` }}
        </template>
      </el-table-column>
      <el-table-column align="center">
        <template #header>会议时长（分钟）</template>
        <template #default="{ row: { startTime, endTime } }">
          {{ calculateDuration(startTime, endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="主持人" align="center" prop="hostUserNickName" />
      <el-table-column label="发起人" align="center" prop="userNickName" />
      <el-table-column label="与会人数" align="center" prop="capacity" width="80" />
      <el-table-column label="所需设备" align="center" prop="equipment">
        <template #default="{ row: { equipment } }">
          {{ isEmpty(equipment) ? '无' : equipment.map((e) => equimentDict[e]).join('、') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" min-width="150">
        <template
          #default="{ row: { id, status: isCancelled, dateMeeting: date, startTime, endTime } }"
        >
          <el-button
            link
            type="primary"
            @click="openDetail(id)"
            v-hasPermi="['hk:user-book-meeting:detail']"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            :disabled="
              handleMeetingStatus({ isCancelled, date, startTime, endTime }) !==
              MeetingStatus.Pending
            "
            @click="openForm('update', id)"
            v-hasPermi="['hk:user-book-meeting:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            :disabled="handleCancelStatus({ isCancelled, date, startTime, endTime })"
            @click="handleCancel(id)"
            v-hasPermi="['hk:user-book-meeting:cancel']"
          >
            撤销
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(id)"
            v-hasPermi="['hk:user-book-meeting:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <MeetingSubscribeForm ref="formRef" :equipments="equipmentOptions" @success="getList" />

  <!-- 会议详情 -->
  <MeetingSubscribeDetail ref="detailRef" :equimentDict="equimentDict" />
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { isEmpty } from 'lodash-es'
import MeetingSubscribeForm from './MeetingSubscribeForm.vue'
import MeetingStatusTag from './MeetingStatusTag.vue'
import MeetingSubscribeDetail from './MeetingSubscribeDetail.vue'
import { MeetingSubscribeApi, MeetingSubscribeInfo } from '@/api/system/meeting'
import { getDictDataByType } from '@/api/system/dict/dict.data'
import { handleMeetingStatus, type StatusProps } from './hook/useMeetingStatus'
import { MeetingStatus } from '@/api/system/meeting/constant'
import { useCache } from '@/hooks/web/useCache'
import { formatDate, /* dateFormatter, */ intervalTransform } from '@/utils/formatTime'
// import { dateFormatter } from '@/utils/formatTime'
// import download from '@/utils/download'

defineOptions({ name: 'SystemMeetingSubscribe' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const { wsCache } = useCache()

const loading = ref(true) // 列表的加载中
const list = ref<MeetingSubscribeInfo[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  subject: undefined,
  date: ''
})
const queryFormRef = ref() // 搜索的表单
const equipmentOptions = ref<OptionItem[]>([{ label: '不需要', value: -1 }]) // 设备选项
const equimentDict = reactive(wsCache.get('meeting_equiment_type') || {}) // 设备字典
const detailRef = ref() // 详情
// const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await MeetingSubscribeApi.getMeetingSubscribePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 撤销操作 */
const handleCancel = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm('是否撤销当前会议？')
    // 发起删除
    await MeetingSubscribeApi.cancelMeetingSubscribe(id)
    message.success('撤销成功')
    // 刷新列表
    await getList()
  } catch {}
}

// 计算撤销的状态（只有 '待开始' 和 '会议中' 的会议，允许撤销）
const handleCancelStatus = (props: StatusProps) => {
  const status = handleMeetingStatus(props)
  return [MeetingStatus.Finished, MeetingStatus.Cancel].includes(status)
}

/** 删除操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm('是否删除当前会议？')
    // 发起删除
    await MeetingSubscribeApi.deleteMeetingSubscribe(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 计算会议时长 */
const calculateDuration = (startTime: number, endTime: number) => {
  const beginTime = intervalTransform(startTime, 'start')
  const finishedTime = intervalTransform(endTime, 'end')
  return dayjs(finishedTime, 'HH:mm').diff(dayjs(beginTime, 'HH:mm'), 'minute')
}

/** 打开详情窗口 */
const openDetail = (id: number) => {
  detailRef.value?.open(id)
}

/** 导出按钮操作 */
// const handleExport = async () => {
//   try {
//     // 导出的二次确认
//     await message.exportConfirm()
//     // 发起导出
//     exportLoading.value = true
//     const data = await MeetingSubscribeApi.exportMeetingSubscribe(queryParams)
//     download.excel(data, '会议预约.xls')
//   } catch {
//   } finally {
//     exportLoading.value = false
//   }
// }

/** 初始化 **/
onMounted(() => {
  getList()

  // 缓存会议设备字典
  if (isEmpty(equimentDict)) {
    getDictDataByType('hk_meeting_equipment_type').then(({ list }) => {
      // 保存字典
      const dict = {}
      list.forEach(({ label, value }) => {
        dict[value] = label
      })
      wsCache.set('meeting_equiment_type', dict)
      Object.assign(equimentDict, dict)
      // 更新设备下拉菜单
      equipmentOptions.value = equipmentOptions.value.concat(
        list.map(({ label, value }) => ({ label, value }))
      )
    })
  } else {
    const options = [] as OptionItem[]
    for (let value in equimentDict) {
      options.push({ value, label: equimentDict[value] })
    }
    equipmentOptions.value = equipmentOptions.value.concat(options)
  }
})
</script>
