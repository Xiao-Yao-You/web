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
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="工单状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择工单状态"
          clearable
          class="!w-150px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.HK_WORK_ORDER_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="紧急程度" prop="level">
        <el-select
          v-model="queryParams.level"
          placeholder="请选紧急程度"
          clearable
          class="!w-140px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.LEVEL)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
      <el-table-column label="工单标题" prop="title" width="120" fixed="left" />
      <el-table-column label="工单状态" align="center" prop="status" width="100" fixed="left">
        <template #default="{ row: { status } }">
          <dict-tag :type="DICT_TYPE.HK_WORK_ORDER_STATUS" :value="status" />
        </template>
      </el-table-column>
      <el-table-column label="工单编号" align="center" prop="code" />
      <el-table-column label="请求类型" align="center" prop="requestType">
        <template #default="scope">
          {{ IssueTypeLabel[scope.row.requestType] }}
        </template>
      </el-table-column>
      <el-table-column label="问题类型" align="center" prop="questionType" />
      <el-table-column label="紧急程度" align="center" prop="level">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.LEVEL" :value="scope.row.level" />
        </template>
      </el-table-column>
      <el-table-column label="报修人" align="center" prop="submitUserNickName" />
      <el-table-column label="响应时长" align="center" prop="allocationConsume" />
      <!-- todo: 处置总时长: 发起时间 → 完成时间（没有完成时间，则显示处置中） -->
      <!-- <el-table-column label="处置总时长" align="center" prop="dealConsume" /> -->
      <el-table-column label="个人处置时长" align="center" prop="dealConsume" />
      <el-table-column label="挂起时长" align="center" prop="hangUpConsume" />
      <el-table-column label="处理人" align="center" prop="delUserNickName" />
      <el-table-column label="任务类型" align="center" prop="type" />
      <el-table-column label="工单来源" align="center" prop="sourceType" />
      <el-table-column label="发起时间" align="center" prop="createTime" width="180">
        <template #default="{ row: { createTime } }">
          {{ formatDate(createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="完成时间" align="center" prop="completeTime" />
      <!-- <el-table-column label="服务评分" align="center" prop="" /> -->
      <el-table-column label="操作" align="center" fixed="right" min-width="400">
        <template #default="{ row: { id } }">
          <el-button link type="primary" @click="openForm('detail', id)"> 详情 </el-button>
          <el-button link type="primary">派单</el-button>
          <el-button link type="primary">领单</el-button>
          <el-button link type="primary">转交</el-button>
          <el-button link type="primary">开始</el-button>
          <el-button link type="primary">挂起</el-button>
          <el-button link type="primary">完成</el-button>
          <el-button link type="danger">撤销</el-button>
          <!-- <el-button link type="primary">流转记录</el-button> -->
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
</template>

<script setup lang="ts">
import OrderForm from './OrderForm.vue'
import { getRepairOrderPage, type RepairOrder } from '@/api/repair'
import { IssueTypeLabel } from '@/api/repair/constant'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { useRepairStoreWithOut } from '@/store/modules/repair'
import { defaultProps } from '@/utils/tree'
import { formatDate } from '@/utils/formatTime'

defineOptions({
  name: 'RepairWorkOrder'
})

const repairStore = useRepairStoreWithOut()

const loading = ref(true)
const list = ref<RepairOrder[]>([])
const total = ref(0)
const queryFormRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  title: undefined as unknown as string,
  status: undefined as unknown as string, // 工单状态
  questionType: undefined, // 问题类型
  level: undefined // 紧急程度
})

/** 查询列表 */
const getList = async () => {
  await queryFormRef.value.validate()
  loading.value = true
  try {
    const data = await getRepairOrderPage(queryParams)
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

onMounted(() => {
  repairStore.fetchIssuesAll()
  getList()
})
</script>

<style scoped></style>
