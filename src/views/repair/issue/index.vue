<script setup lang="ts">
import { getRepairIssuesPage, deleteIssue, type RepairIssue } from '@/api/repair'
import { IssueTypeOptions } from '@/api/repair/constant'
import IssueForm from './IssueForm.vue'

defineOptions({
  name: 'RepairIssue'
})

const message = useMessage()

const loading = ref(true)
const list = ref<RepairIssue[]>([])
const total = ref(0)
const queryFormRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: ''
})

// 查询列表
const getList = async () => {
  loading.value = true
  try {
    const data = await getRepairIssuesPage(queryParams)
    list.value = data.list || []
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

// 重置按钮操作
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  await message.delConfirm()
  await deleteIssue(id)
  message.success('删除成功')
  getList()
}

onMounted(() => {
  getList()
})
</script>

<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true">
      <el-form-item label="问题名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入问题名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" plain @click="openForm('create')">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" stripe show-overflow-tooltip>
      <el-table-column type="index" align="center" width="60" />
      <el-table-column label="问题名称" align="center" prop="name" />
      <el-table-column label="问题类型" align="center" prop="type">
        <template #default="{ row: { type } }">
          {{ IssueTypeOptions[type].label }}
        </template>
      </el-table-column>
      <el-table-column label="关联设备" align="center" prop="device" />
      <el-table-column label="问题描述" align="center" prop="description" />
      <el-table-column label="操作" align="center">
        <template #default="{ row: { id } }">
          <el-button link type="primary" @click="openForm('detail', id)"> 详情 </el-button>
          <el-button link type="primary" @click="openForm('child', id)"> 子分类 </el-button>
          <el-button link type="primary" @click="openForm('update', id)"> 编辑 </el-button>
          <el-button link type="danger" @click="handleDelete(id)"> 删除 </el-button>
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
  <IssueForm ref="formRef" @success="getList" />
</template>

<style scoped></style>
