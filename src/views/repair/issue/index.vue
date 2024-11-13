<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true">
      <el-form-item label="问题名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入问题名称"
          clearable
          @keyup.enter="getIssuesMenu"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="getIssuesMenu"><Icon icon="ep:search" class="mr-5px" />搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        <el-button type="primary" @click="openImportTable()">
          <Icon class="mr-5px" icon="ep:zoom-in" />
          导入
        </el-button>
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
          {{ type ? IssueTypeOptions[type].label : '/' }}
        </template>
      </el-table-column>
      <el-table-column label="设备类型" align="center" prop="deviceTypeName" />
      <el-table-column label="问题描述" align="center" prop="description" />
      <el-table-column label="操作" align="center" fixed="right" width="240">
        <template #default="{ row }">
          <el-button link type="primary" @click="openForm('detail', row.id)">详情</el-button>
          <el-button v-if="!row.parentId" link type="primary" @click="openForm('child', row.id)">
            添加子类
          </el-button>
          <el-button link type="primary" @click="openForm('update', row.id)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <IssueForm ref="formRef" @success="getIssuesMenu" />
  <!-- 弹窗：导入表 -->
  <QuestionTypeImportForm ref="importRef" @success="getIssuesMenu" />
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import {
  deleteIssue,
  getRepairIssuesAll,
  type IssuesAllParams,
  type RepairIssue
} from '@/api/repair'
import { handleTree } from '@/utils/tree'
import { IssueTypeOptions } from '@/api/repair/constant'
import IssueForm from './IssueForm.vue'
import QuestionTypeImportForm from './QuestionTypeImportForm.vue'

defineOptions({
  name: 'RepairIssue'
})

const message = useMessage()

const loading = ref(true)
const isExpandAll = ref(false) // 是否展开，默认全部折叠
const refreshTable = ref(true) // 重新渲染表格状态
const queryFormRef = ref()
const queryParams = reactive<IssuesAllParams>({
  name: ''
})
const tree = ref<any[]>([])

const importRef = ref()
const openImportTable = () => {
  importRef.value.open()
}

// 查询列表
const getIssuesMenu = async () => {
  loading.value = true
  try {
    const data = await getRepairIssuesAll(queryParams)
    tree.value = handleTree(data)
  } finally {
    loading.value = false
  }
}

// 重置按钮操作
const resetQuery = () => {
  queryFormRef.value.resetFields()
  getIssuesMenu()
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

const handleDelete = (row: RepairIssue) => {
  ElMessageBox({
    title: '系统提示',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    message: h(
      'div',
      null,
      row.parentId
        ? [h('span', '确定删除该条问题吗？')]
        : [
            h('span', '确定删除该类问题吗？'),
            h(
              'p',
              { style: { marginTop: '16px', fontWeight: 600 } },
              '请注意：该类型下所有子类问题都将被删除！'
            )
          ]
    ),
    beforeClose(action, instance, done) {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        instance.confirmButtonText = '删除中...'
        deleteIssue(row.id)
          .then(() => {
            message.success('删除成功')
            getIssuesMenu()
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

onMounted(() => {
  getIssuesMenu()
})
</script>
