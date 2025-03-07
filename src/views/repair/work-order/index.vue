<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" inline label-width="80px">
      <!-- 第一行 -->
      <el-row>
        <el-col :span="6">
          <el-form-item label="工单编号" prop="code" class="w-full !mr-0">
            <el-input
              v-model="queryParams.code"
              placeholder="请输入工单编号"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="工单状态" prop="status" class="w-full !mr-0">
            <el-select v-model="queryParams.status" clearable>
              <el-option
                v-for="dict in getStrDictOptions(DICT_TYPE.REPAIR_ORDER_STATUS)"
                :key="dict.value as string"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="问题类型" prop="questionType" class="w-full !mr-0">
            <el-cascader
              v-model="queryParams.questionType"
              filterable
              clearable
              :props="{ label: 'name', value: 'id', emitPath: false }"
              :options="repairStore.issuesTree"
              placeholder="请选择问题类型"
              class="w-full"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="请求类型" prop="requestType" class="w-full !mr-0">
            <el-select v-model="queryParams.requestType" clearable>
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.REPAIR_REQUEST_TYPE)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第二行 -->
      <el-row>
        <el-col :span="6">
          <el-form-item label="报修日期" prop="createTime" class="w-full !mr-0">
            <el-date-picker
              v-model="queryParams.createTime"
              type="daterange"
              range-separator="-"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="时间段" prop="dayNight" class="w-full !mr-0">
            <el-select v-model="queryParams.dayNight" clearable>
              <el-option label="日间" :value="1" />
              <el-option label="夜间" :value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="紧急程度" prop="level" class="w-full !mr-0">
            <el-select v-model="queryParams.level" clearable>
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.LEVEL)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="处理人" prop="dealUserNickName" class="w-full !mr-0">
            <el-input
              v-model="queryParams.dealUserNickName"
              placeholder="请输入处理人名字"
              clearable
              @keyup.enter="handleQuery"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行 -->
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" plain @click="openForm()">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button class="ml-12px" type="warning" plain @click="openSubscriber">
          <Icon icon="ep:setting" class="mr-5px" />推送对象
        </el-button>
        <el-button plain type="success" :loading="exportLoading" @click="openExportModal">
          <Icon class="mr-5px" icon="ep:download" />
          导出当前表格
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 自动刷新 -->
  <div class="auto-refresh my-3 text-right">
    <span>{{ timer }} 后刷新</span>
    <el-button
      class="ml-12px"
      type="info"
      size="small"
      round
      :icon="PauseIcon"
      plain
      @click="countDown.pause"
    >
      暂停刷新
    </el-button>
    <el-button type="success" size="small" round :icon="ResumeIcon" plain @click="countDown.start">
      继续刷新
    </el-button>
    <el-button type="primary" size="small" round :icon="TimerIcon" plain @click="onRefresh">
      立即刷新
    </el-button>
  </div>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe show-overflow-tooltip>
      <el-table-column type="index" align="center" width="40" fixed="left" />
      <el-table-column label="工单标题" prop="title" width="180" fixed="left" />
      <el-table-column label="工单状态" prop="status" width="90" fixed="left">
        <template #default="{ row: { status } }">
          <dict-tag :type="DICT_TYPE.REPAIR_ORDER_STATUS" :value="status" />
        </template>
      </el-table-column>
      <el-table-column label="工单编号" prop="code" width="150" />
      <el-table-column label="报修人" prop="submitUserNickName" />
      <el-table-column label="处理人" prop="dealUserNickName">
        <template #default="{ row: { dealUserNickName } }">
          {{ dealUserNickName }}
        </template>
      </el-table-column>
      <el-table-column label="发起时间" prop="createTime" width="180">
        <template #default="{ row: { createTime } }">
          {{ formatDate(createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="紧急程度" prop="level">
        <template #default="{ row: { level } }">
          <span v-if="isEmptyVal(level)">待定</span>
          <dict-tag v-else :type="DICT_TYPE.LEVEL" :value="level" />
        </template>
      </el-table-column>
      <el-table-column label="请求类型" prop="requestType" width="110">
        <template #default="scope">
          {{ getRequestTypeLabel(scope.row.requestType) || '待定' }}
        </template>
      </el-table-column>
      <el-table-column label="问题类型" prop="questionTypeStr" width="150">
        <template #default="scope">
          {{ scope.row.questionTypeStr || '待定' }}
        </template>
      </el-table-column>
      <el-table-column label="完成时间" prop="completeTime" width="180">
        <template #default="{ row: { completeTime } }">
          {{ formatDate(completeTime) }}
        </template>
      </el-table-column>
      <el-table-column label="响应时长" prop="allocationConsume" width="120">
        <template #default="{ row: { allocationConsume } }">
          {{ allocationConsume ? formatPast2(allocationConsume) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="个人处置时长" prop="dealConsume" width="120">
        <template #default="{ row: { dealConsume } }">
          {{ dealConsume ? formatPast2(dealConsume) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="挂起时长" prop="hangUpConsume" width="120">
        <template #default="{ row: { hangUpConsume } }">
          {{ hangUpConsume ? formatPast2(hangUpConsume) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="处置总时长" prop="completeConsume" width="120">
        <template #default="{ row: { completeConsume } }">
          {{ completeConsume ? formatPast2(completeConsume) : '' }}
        </template>
      </el-table-column>
      <el-table-column label="任务类型" prop="type" width="100">
        <template #default="{ row: { type } }">
          {{ OrderTakeType[type] || '' }}
        </template>
      </el-table-column>
      <el-table-column label="工单来源" prop="sourceType">
        <template #default="{ row: { sourceType } }">
          {{ RepairSourceType[sourceType] }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        width="200"
        :show-overflow-tooltip="false"
      >
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row.id)">详情</el-button>
          <!-- 操作按钮少，用这个 ↓ -->
          <el-button
            link
            type="primary"
            :disabled="handleDisabled(OperateMethod.Dispatch, row)"
            @click="handleCommand(OperateMethod.Dispatch, row)"
          >
            派单
          </el-button>
          <el-button
            link
            type="primary"
            :disabled="handleDisabled(OperateMethod.Transfer, row)"
            @click="handleCommand(OperateMethod.Transfer, row)"
          >
            转交
          </el-button>
          <el-button
            link
            type="danger"
            :disabled="handleDisabled(OperateMethod.Close, row)"
            @click="handleCommand(OperateMethod.Close, row)"
          >
            关单
          </el-button>
          <!-- 操作按钮多，用这个 ↓ -->
          <!-- <el-dropdown class="align-baseline!" @command="(command) => handleCommand(command, row)">
            <el-button type="primary" link><Icon icon="ep:d-arrow-right" />更多</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :command="OperateMethod.Dispatch"
                  :disabled="handleDisabled(OperateMethod.Dispatch, row)"
                >
                  派单
                </el-dropdown-item>
                <el-dropdown-item
                  :command="OperateMethod.Transfer"
                  :disabled="handleDisabled(OperateMethod.Transfer, row)"
                >
                  转交
                </el-dropdown-item>
                <el-dropdown-item
                  :command="OperateMethod.Close"
                  :disabled="handleDisabled(OperateMethod.Close, row)"
                >
                  关单
                </el-dropdown-item>
                <el-dropdown-item
                  :command="OperateMethod.Receive"
                  :disabled="handleDisabled(OperateMethod.Receive, row)"
                >
                  抢单
                </el-dropdown-item>
                <el-dropdown-item
                  :command="OperateMethod.Confirm"
                  :disabled="handleDisabled(OperateMethod.Confirm, row)"
                >
                  确认
                </el-dropdown-item>
                <el-dropdown-item
                  :command="OperateMethod.HangUp"
                  :disabled="handleDisabled(OperateMethod.HangUp, row)"
                >
                  挂起
                </el-dropdown-item>
                <el-dropdown-item
                  :command="OperateMethod.Restart"
                  :disabled="handleDisabled(OperateMethod.Restart, row)"
                >
                  重启
                </el-dropdown-item>
                <el-dropdown-item
                  :command="OperateMethod.Finish"
                  :disabled="handleDisabled(OperateMethod.Finish, row)"
                >
                  完成
                </el-dropdown-item>
                <el-dropdown-item
                  :command="OperateMethod.Revoke"
                  :disabled="handleDisabled(OperateMethod.Revoke, row)"
                >
                  撤销
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown> -->
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

  <!-- 新增表单 -->
  <OrderCreate ref="formRef" @success="getList" />

  <!-- 派单 -->
  <OrderDispatchForm ref="dispatchRef" @success="getList" />

  <!-- 转交 -->
  <OrderTransferForm ref="transferRef" @success="getList" />

  <!-- 开始 -->
  <OrderStartForm ref="startRef" @success="getList" />

  <!-- 挂起 -->
  <OrderHangupForm ref="HangupRef" @success="getList" />

  <!-- 结束 -->
  <OrderCompleteForm ref="completeRef" @success="getList" />

  <!-- 推送对象 -->
  <OrderSubscriber ref="subscribeRef" />

  <!-- 工单详情 -->
  <OrderDetail ref="detialRef" />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  ElMessageBox,
  type CascaderValue,
  type FormInstance,
  type ModelValueType
} from 'element-plus'
import OrderCreate from './OrderCreate.vue'
import OrderDispatchForm from './OrderDispatchForm.vue'
import OrderTransferForm from './OrderTransferForm.vue'
import OrderHangupForm from './OrderHangupForm.vue'
import OrderCompleteForm from './OrderCompleteForm.vue'
import OrderStartForm from './OrderStartForm.vue'
import OrderSubscriber from './OrderSubscriber.vue'
import OrderDetail from './OrderDetail.vue'
import {
  getRepairOrderPage,
  handleRepairOrder,
  exportRepairOrder,
  type RepairOrder
} from '@/api/repair'
import {
  getRequestTypeLabel,
  OperateMethod,
  OrderTakeType,
  RepairSourceType,
  OperateStatus
} from '@/api/repair/constant'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import { useRepairStoreWithOut } from '@/store/modules/repair'
import { isEmptyVal } from '@/utils/is'
import { formatDate, formatPast2 } from '@/utils/formatTime'
import { useEmployeeStoreWithOut } from '@/store/modules/employee'
import { useGroupStoreWithOut } from '@/store/modules/group'
import { useIcon } from '@/hooks/web/useIcon'
import { useUserStore } from '@/store/modules/user'
import { useCountDown } from '@/hooks/web/useCountDown'
import { useEmitt } from '@/hooks/web/useEmitt'
import download from '@/utils/download'

defineOptions({
  name: 'RepairWorkOrder'
})

const message = useMessage()
const repairStore = useRepairStoreWithOut()
const employeeStore = useEmployeeStoreWithOut()
const groupStore = useGroupStoreWithOut()
const PauseIcon = useIcon({ icon: 'ep:video-pause' })
const ResumeIcon = useIcon({ icon: 'ep:video-play' })
const TimerIcon = useIcon({ icon: 'ep:timer' })

// #region 一、表单查询
const loading = ref(true)
const list = ref<RepairOrder[]>([])
const total = ref(0)
const queryFormRef = ref<FormInstance>()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  code: undefined as unknown as string,
  status: undefined as unknown as string, // 工单状态
  dealUserNickName: undefined as unknown as string,
  questionType: undefined as unknown as CascaderValue, // 问题类型（最后一级节点）
  level: undefined, // 紧急程度
  requestType: undefined, // 请求类型
  dayNight: undefined,
  createTime: '' as ModelValueType
})
// 处理 createTime 格式，添加上 00:00 和 59:59 时间
function handleCreateTime(createTime: ModelValueType): ModelValueType {
  if (Array.isArray(createTime)) {
    let [beginTime, endTime] = createTime
    beginTime = `${beginTime} 00:00:00`
    endTime = `${endTime} 23:59:59`
    return [beginTime, endTime]
  } else {
    return createTime
  }
}
// 查询
const getList = async () => {
  await queryFormRef.value?.validate()
  loading.value = true
  try {
    // 处理 createTime 格式，添加上 00:00 和 59:59 时间
    const { createTime, ...rest } = queryParams
    const data = await getRepairOrderPage({
      ...rest,
      createTime: handleCreateTime(createTime)
    })
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}
// 搜索按钮操作
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}
// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}
// 添加/修改
const formRef = ref()
const openForm = () => {
  formRef.value.open()
}
// #endregion

// #region 二、工单处理
const handleCommand = (command: string, row: RepairOrder) => {
  switch (command) {
    case OperateMethod.Dispatch:
      openDispatchForm(row)
      break
    case OperateMethod.Receive:
      receiveOrder(row.id)
      break
    case OperateMethod.Transfer:
      openTransferForm(row)
      break
    case OperateMethod.Restart:
      restart(row)
      break
    case OperateMethod.Confirm:
      openStartForm(row)
      break
    case OperateMethod.HangUp:
      openHangupForm(row.id)
      break
    case OperateMethod.Finish:
      openCompleteForm(row)
      break
    case OperateMethod.Revoke:
      handleRevoke(row.id)
      break
    case OperateMethod.Close:
      handleClose(row.id)
      break
    default:
      break
  }
}

// 撤销
const handleRevoke = async (id: number) => {
  ElMessageBox.prompt('请输入撤销原因', '系统提示', {
    confirmButtonText: '撤销',
    cancelButtonText: '取消',
    inputPattern: /^(?=.*\S).+$/,
    inputErrorMessage: '原因不能为空',
    beforeClose(action, instance, done) {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        handleRepairOrder({
          id,
          operateMethod: OperateMethod.Revoke,
          remark: instance.inputValue
        })
          .then(() => {
            message.success('撤销成功')
            handleQuery()
            done()
          })
          .finally(() => {
            instance.confirmButtonLoading = false
          })
      } else {
        done()
      }
    }
  })
}

// 派单
const dispatchRef = ref<InstanceType<typeof OrderDispatchForm>>()
const openDispatchForm = (row: RepairOrder) => {
  dispatchRef.value?.open({ id: row.id, code: row.code })
}

// 抢单
// todo: 需要重构，查询自己所在的请求类型分组并选择对应的问题类型
const receiveOrder = (id: number) => {
  ElMessageBox.confirm('抢单后将开始记录工单处置时长，是否确定抢单并开始执行工单？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    beforeClose(action, instance, done) {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        handleRepairOrder({ id, operateMethod: OperateMethod.Receive })
          .then(() => {
            message.success('抢单成功')
            handleQuery()
            done()
          })
          .finally(() => {
            instance.confirmButtonLoading = false
          })
      } else {
        done()
      }
    }
  })
}

// 转交
const transferRef = ref<InstanceType<typeof OrderTransferForm>>()
const openTransferForm = (row: RepairOrder) => {
  transferRef.value?.open({
    id: row.id,
    code: row.code,
    questionType: row.questionType
  })
}

// 现场确认
const startRef = ref<InstanceType<typeof OrderStartForm>>()
const openStartForm = (row: RepairOrder) => {
  startRef.value?.open(row)
}

// 挂起
const HangupRef = ref<InstanceType<typeof OrderHangupForm>>()
const openHangupForm = (id: number) => {
  HangupRef.value?.open(id)
}

// 重启
const restart = ({ id }: RepairOrder) => {
  ElMessageBox.confirm('重启后继续计算处置时长，是否确定重启？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    beforeClose(action, instance, done) {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        handleRepairOrder({ id, operateMethod: OperateMethod.Restart })
          .then(() => {
            message.success('重启成功')
            handleQuery()
            done()
          })
          .finally(() => {
            instance.confirmButtonLoading = false
          })
      } else {
        done()
      }
    }
  })
}

// 完成
const completeRef = ref<InstanceType<typeof OrderCompleteForm>>()
const openCompleteForm = ({ id, code, status }: RepairOrder) => {
  completeRef.value?.open({ id, code, status })
}

// 直接关单
const handleClose = async (id: number) => {
  ElMessageBox.prompt('工单还在处理流程中，确定关闭吗？', '系统提示', {
    type: 'warning',
    confirmButtonText: '直接关单',
    cancelButtonText: '取消',
    inputPattern: /^(?=.*\S).+$/,
    inputPlaceholder: '请输入关单原因',
    inputErrorMessage: '原因不能为空',
    beforeClose(action, instance, done) {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        handleRepairOrder({
          id,
          operateMethod: OperateMethod.Close,
          remark: instance.inputValue
        })
          .then(() => {
            message.success('关单成功')
            handleQuery()
            done()
          })
          .finally(() => {
            instance.confirmButtonLoading = false
          })
      } else {
        done()
      }
    }
  })
}

// 处理按钮的禁用状态
const { user } = storeToRefs(useUserStore())
const handleDisabled = (
  method: OperateMethod,
  { status, submitUserId, dealUserId }: RepairOrder
) => {
  let res = true
  switch (method) {
    // 派单和领单的前提条件：待分配
    case OperateMethod.Dispatch:
    case OperateMethod.Receive:
      res = status === OperateStatus.Dispatch
      break
    // 现场确认的前提条件：待处理
    case OperateMethod.Confirm:
      res = status === OperateStatus.Receive && dealUserId === user.value.id
      break
    // 转交的前提条件：接单后全程可以转交（除非工单已完成或被撤销）
    case OperateMethod.Transfer:
      res = [OperateStatus.Receive, OperateStatus.Handling, OperateStatus.HangUp].includes(status)
      break
    // 挂起和完成的前提条件：进行中
    case OperateMethod.HangUp:
    case OperateMethod.Finish:
      res = status === OperateStatus.Handling && dealUserId === user.value.id
      break
    // 重启的前提条件：挂起
    case OperateMethod.Restart:
      res = status === OperateStatus.HangUp && dealUserId === user.value.id
      break
    // 撤销的前提条件：不是已完成、已撤销、已处理
    case OperateMethod.Revoke:
      res =
        ![OperateStatus.Revoke, OperateStatus.Done, OperateStatus.Finish].includes(status) &&
        submitUserId === user.value.id
      break
    // 直接关单的前提条件：不是待分配、已完成、已关单、已撤销
    case OperateMethod.Close:
      res = ![
        OperateStatus.Dispatch,
        OperateStatus.Revoke,
        OperateStatus.Done,
        OperateStatus.Finish,
        OperateStatus.Close
      ].includes(status)
      break
    default:
      break
  }
  return !res
}
// #endregion

// #region 三、设置推送对象
const subscribeRef = ref<InstanceType<typeof OrderSubscriber>>()
const openSubscriber = () => {
  subscribeRef.value?.open()
}
// #endregion

// #region 四、工单详情
const detialRef = ref<InstanceType<typeof OrderDetail>>()
const openDetail = (id: number) => {
  detialRef.value?.open(id)
}
// #endregion

// #region 五、倒计时刷新
const countDown = useCountDown({
  time: 2 * 60 * 1000,
  onFinish: () => onRefresh()
})
const timer = computed(
  () => `${countDown.current.value.minutes}:${countDown.current.value.seconds}`
)
const onRefresh = () => {
  getList()
  countDown.reset()
  countDown.start()
}
countDown.start()

// 事件总线（WebSocket 推送工单处理的最新情况后，立即刷新，主要针对工单播报员）
const { emitter } = useEmitt()
emitter.on('getNewOrder', onRefresh)
// #endregion

// #region 六、工单导出
const exportLoading = ref(false)
const openExportModal = async () => {
  exportLoading.value = true
  try {
    const blob = await exportRepairOrder(queryParams)
    download.excel(blob, '工单列表.xls')
  } finally {
    exportLoading.value = false
  }
}
// #endregion

onMounted(() => {
  repairStore.fetchIssuesAll()
  repairStore.fetchLocationsAll()
  employeeStore.fetchInfoEmployees()
  groupStore.fetchAllGroups()
  getList()
})
</script>

<style lang="scss" scoped>
.el-form--inline .el-form-item {
  margin-right: 15px;
}

.auto-refresh {
  color: var(--el-color-info);
}
</style>
