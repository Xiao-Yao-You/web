<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { deleteIssue, type IssuesAllParams } from '@/api/repair'
import { useRepairStoreWithOut } from '@/store/modules/repair'
import { IssueTypeOptions } from '@/api/repair/constant'
import IssueForm from './IssueForm.vue'

defineOptions({
  name: 'RepairIssue'
})

const repairStore = useRepairStoreWithOut()
const { issuesTree: tree } = storeToRefs(repairStore)
const message = useMessage()

const loading = ref(true)
const isExpandAll = ref(false) // 是否展开，默认全部折叠
const refreshTable = ref(true) // 重新渲染表格状态
const queryFormRef = ref()
const queryParams = reactive<IssuesAllParams>({
  name: ''
})

// 查询列表
const getIssuesMenu = () => {
  loading.value = true
  repairStore.fetchIssuesAll(queryParams).finally(() => {
    loading.value = false
  })
}

// 搜索按钮操作
const handleQuery = () => {
  queryParams.name = ''
  getIssuesMenu()
}

// 重置按钮操作
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 展开/折叠操作 */
const toggleExpandAll = () => {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  await message.delConfirm()
  await deleteIssue(id)
  message.success('删除成功')
  getIssuesMenu()
}

onMounted(() => {
  getIssuesMenu()
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
          <Icon icon="ep:plus" class="mr-5px" /> 新增主问题
        </el-button>
        <el-button plain type="danger" @click="toggleExpandAll">
          <Icon class="mr-5px" icon="ep:sort" />
          展开/折叠
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="tree"
      row-key="id"
      :default-expand-all="isExpandAll"
    >
      <el-table-column label="问题名称" prop="name" show-overflow-tooltip width="250" />
      <el-table-column label="问题类型" align="center" prop="type">
        <template #default="{ row: { type } }">
          {{ IssueTypeOptions[type].label }}
        </template>
      </el-table-column>
      <el-table-column label="设备类型" align="center" prop="deviceTypeName" />
      <el-table-column label="问题描述" align="center" prop="description" />
      <el-table-column label="操作" align="center">
        <template #default="{ row: { id } }">
          <el-button link type="primary" @click="openForm('detail', id)"> 详情 </el-button>
          <el-button link type="primary" @click="openForm('child', id)"> 添加子类 </el-button>
          <el-button link type="primary" @click="openForm('update', id)"> 编辑 </el-button>
          <el-button link type="danger" @click="handleDelete(id)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <IssueForm ref="formRef" @success="getIssuesMenu" />
</template>
