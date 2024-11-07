<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" inline label-width="80px">
      <el-form-item label="工单标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题"
          clearable
          @keyup.enter="handleQuery"
          class="!w-200px"
        />
      </el-form-item>
      <el-form-item label="工单状态" prop="status">
        <el-select v-model="queryParams.status" clearable class="!w-110px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.REPAIR_ORDER_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="紧急程度" prop="level">
        <el-select v-model="queryParams.level" clearable class="!w-90px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.LEVEL)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="处理人" prop="dealUserNickName">
        <el-input
          v-model="queryParams.dealUserNickName"
          placeholder="请输入处理人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-110px"
        />
      </el-form-item>
      <el-form-item label="问题类型" prop="questionType">
        <el-tree-select
          v-model="queryParams.questionType"
          :data="repairStore.issuesTree"
          :default-expanded-keys="[0]"
          :props="defaultProps"
          check-strictly
          node-key="id"
          class="!w-180px"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" plain @click="openForm('create')">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button class="ml-12px" type="warning" plain @click="openSubscriber">
          <Icon icon="ep:setting" class="mr-5px" />推送对象
        </el-button>
        <!-- <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button> -->
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe show-overflow-tooltip>
      <el-table-column type="index" align="center" width="40" fixed="left" />
      <el-table-column label="工单标题" prop="title" width="150" fixed="left" />
      <el-table-column label="工单状态" align="center" prop="status" width="100" fixed="left">
        <template #default="{ row: { status } }">
          <dict-tag :type="DICT_TYPE.REPAIR_ORDER_STATUS" :value="status" />
        </template>
      </el-table-column>
      <el-table-column label="工单编号" align="center" prop="code" />
      <el-table-column label="请求类型" align="center" prop="requestType" width="80">
        <template #default="scope">
          {{ IssueTypeLabel[scope.row.requestType] }}
        </template>
      </el-table-column>
      <el-table-column label="问题类型" align="center" prop="questionTypeStr" width="140" />
      <el-table-column label="紧急程度" align="center" prop="level">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.LEVEL" :value="scope.row.level" />
        </template>
      </el-table-column>
      <el-table-column label="报修人" align="center" prop="submitUserNickName" />
      <el-table-column label="响应时长" align="center" prop="allocationConsume" width="120">
        <template #default="{ row: { allocationConsume } }">
          {{ allocationConsume ? formatPast2(allocationConsume) : '/' }}
        </template>
      </el-table-column>
      <el-table-column label="个人处置时长" align="center" prop="dealConsume" width="120">
        <template #default="{ row: { dealConsume } }">
          {{ dealConsume ? formatPast2(dealConsume) : '/' }}
        </template>
      </el-table-column>
      <el-table-column label="挂起时长" align="center" prop="hangUpConsume" width="120">
        <template #default="{ row: { hangUpConsume } }">
          {{ hangUpConsume ? formatPast2(hangUpConsume) : '/' }}
        </template>
      </el-table-column>
      <el-table-column label="处置总时长" align="center" prop="completeConsume" width="120">
        <template #default="{ row: { completeConsume } }">
          {{ completeConsume ? formatPast2(completeConsume) : '/' }}
        </template>
      </el-table-column>
      <el-table-column label="处理人" align="center" prop="dealUserNickName">
        <template #default="{ row: { dealUserNickName } }">
          {{ dealUserNickName || '/' }}
        </template>
      </el-table-column>
      <el-table-column label="任务类型" align="center" prop="type" width="100">
        <template #header>
          任务类型
          <el-tooltip effect="dark" content="领单方式" placement="top-start">
            <InfoIcon />
          </el-tooltip>
        </template>
        <template #default="{ row: { type } }">
          {{ OrderTakeType[type] || '/' }}
        </template>
      </el-table-column>
      <el-table-column label="工单来源" align="center" prop="sourceType">
        <template #default="{ row: { sourceType } }">
          {{ RepairSourceType[sourceType] }}
        </template>
      </el-table-column>
      <el-table-column label="发起时间" align="center" prop="createTime" width="180">
        <template #default="{ row: { createTime } }">
          {{ formatDate(createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" prop="completeTime" width="180">
        <template #default="{ row: { completeTime } }">
          {{ formatDate(completeTime) || '/' }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        width="120"
        :show-overflow-tooltip="false"
      >
        <template #default="{ row }">
          <el-button link type="primary" @click="openForm('detail', row.id)">详情</el-button>
          <el-dropdown class="align-baseline!" @command="(command) => handleCommand(command, row)">
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
                  :command="OperateMethod.Receive"
                  :disabled="handleDisabled(OperateMethod.Receive, row)"
                >
                  领单
                </el-dropdown-item>
                <el-dropdown-item
                  :command="OperateMethod.Transfer"
                  :disabled="handleDisabled(OperateMethod.Transfer, row)"
                >
                  转交
                </el-dropdown-item>
                <el-dropdown-item
                  :command="OperateMethod.Restart"
                  :disabled="handleDisabled(OperateMethod.Restart, row)"
                >
                  重启
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
          </el-dropdown>
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

  <!-- 新增、编辑表单 -->
  <OrderForm ref="formRef" @success="getList" />

  <!-- 派单 -->
  <OrderDispatchForm ref="dispatchRef" @success="getList" />

  <!-- 转交 -->
  <OrderTransferForm ref="transferRef" @success="getList" />

  <!-- 开始 -->
  <OrderStartForm ref="startRef" @success="getList" />

  <!-- 结束 -->
  <OrderCompleteForm ref="completeRef" @success="getList" />

  <!-- 推送对象 -->
  <OrderSubscriber ref="subscribeRef" />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ElMessageBox } from 'element-plus'
import OrderForm from './OrderForm.vue'
import OrderDispatchForm from './OrderDispatchForm.vue'
import OrderTransferForm from './OrderTransferForm.vue'
import OrderCompleteForm from './OrderCompleteForm.vue'
import OrderStartForm from './OrderStartForm.vue'
import OrderSubscriber from './OrderSubscriber.vue'
import { getRepairOrderPage, handleRepairOrder, type RepairOrder } from '@/api/repair'
import {
  IssueTypeLabel,
  OperateMethod,
  OrderTakeType,
  RepairSourceType,
  OperateStatus
} from '@/api/repair/constant'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { useRepairStoreWithOut } from '@/store/modules/repair'
import { defaultProps } from '@/utils/tree'
import { formatDate, formatPast2 } from '@/utils/formatTime'
import { useEmployeeStoreWithOut } from '@/store/modules/employee'
import { useIcon } from '@/hooks/web/useIcon'
import { useUserStore } from '@/store/modules/user'

defineOptions({
  name: 'RepairWorkOrder'
})

const message = useMessage()
const repairStore = useRepairStoreWithOut()
const employeeStore = useEmployeeStoreWithOut()
const InfoIcon = useIcon({ icon: 'ep:info-filled', size: 14 })

// #region 一、表单查询
const loading = ref(true)
const list = ref<RepairOrder[]>([])
const total = ref(0)
const queryFormRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  title: undefined as unknown as string,
  status: undefined as unknown as string, // 工单状态
  dealUserNickName: '',
  questionType: undefined, // 问题类型
  level: undefined // 紧急程度
})
// 查询
const getList = async () => {
  await queryFormRef.value.validate()
  loading.value = true
  try {
    const { status, ...rest } = queryParams
    const data = await getRepairOrderPage({
      ...rest,
      status: status ? '0' + status : undefined
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
  queryFormRef.value.resetFields()
  handleQuery()
}
// 添加/修改
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
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
      openStartForm(row.id)
      break
    case OperateMethod.HangUp:
      onHangUp(row)
      break
    case OperateMethod.Finish:
      openCompleteForm(row)
      break
    case OperateMethod.Revoke:
      handleRevoke(row.id)
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
    beforeClose(action, instance, done) {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        handleRepairOrder({ id, operateMethod: OperateMethod.Revoke })
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

// 领单
const receiveOrder = (id: number) => {
  ElMessageBox.confirm('领单后将开始记录工单处置时长，是否确定领单并开始执行工单？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    beforeClose(action, instance, done) {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        handleRepairOrder({ id, operateMethod: OperateMethod.Receive })
          .then(() => {
            message.success('领单成功')
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
const openStartForm = (id: number) => {
  startRef.value?.open(id)
}

// 挂起
const onHangUp = ({ title, id }: RepairOrder) => {
  ElMessageBox.confirm(`确定挂起 “${title}” 的工单吗？`, '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    beforeClose(action, instance, done) {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        handleRepairOrder({ id, operateMethod: OperateMethod.HangUp })
          .then(() => {
            message.success('挂起成功')
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
    // 转交的前提条件：待处理、进行中、不是自己
    case OperateMethod.Transfer:
      res =
        [OperateStatus.Receive, OperateStatus.Handling].includes(status) &&
        dealUserId !== user.value.id
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
    // 撤销的前提条件：不是已完成
    case OperateMethod.Revoke:
      res = status !== OperateStatus.Finish && submitUserId === user.value.id
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

onMounted(() => {
  repairStore.fetchIssuesAll()
  repairStore.fetchLocationsAll()
  employeeStore.fetchInfoEmployees()
  getList()
})
</script>

<style lang="scss" scoped>
.el-form--inline .el-form-item {
  margin-right: 15px;
}
</style>
