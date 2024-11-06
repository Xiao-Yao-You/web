<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true">
      <el-form-item label="设备类型" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入设备类型"
          clearable
          @keyup.enter="handleQuery"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" @click="openImportTable()">
          <Icon class="mr-5px" icon="ep:zoom-in" />
          导入
        </el-button>
        <el-button type="primary" plain @click="openForm('create')">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="pageLoading" :data="list" stripe>
      <el-table-column type="index" align="center" width="60" />
      <el-table-column label="类型名称" align="center" prop="name" />
      <el-table-column label="设备编码" align="center" prop="sceneName" />
      <el-table-column label="设备流水号" align="center" prop="currentCode" />
      <el-table-column label="标签编码" align="center" prop="labelSceneName" />
      <el-table-column label="标签流水号" align="center" prop="labelCurrentCode" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="{ row: { status } }">
          <el-tag :type="status ? 'danger' : 'primary'">
            {{ status ? '禁用' : '启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" fixed="right" min-width="200">
        <template #default="{ row: { id } }">
          <el-button link type="primary" @click="openForm('detail', id)">详情</el-button>
          <el-button link type="primary" @click="openForm('update', id)">编辑</el-button>
          <el-button link type="primary" @click="print(id)">打印</el-button>
          <el-button link type="danger" @click="handleDelete(id)">删除</el-button>
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
  <DeviceForm ref="formRef" @success="getList" />

  <!-- 打印弹窗 -->
  <PrintDialog ref="printRef" :labels="batchLabelList" />

  <!-- 弹窗：导入表 -->
  <DeviceTypeImportForm ref="importRef" @success="getList" />
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import {
  getRepairDevicePage,
  deleteDeviceType,
  printBatchLabels,
  type RepairDevice,
  type LabelItem
} from '@/api/repair'
import DeviceForm from './DeviceForm.vue'
import PrintDialog from './PrintDialog.vue'
import DeviceTypeImportForm from './DeviceTypeImportForm.vue'

defineOptions({
  name: 'RepairDevice'
})

const message = useMessage()

const pageLoading = ref(true)
const list = ref<RepairDevice[]>([])
const total = ref(0)
const batchLabelList = ref<LabelItem[]>([]) // 批量的标签打印信息
const printRef = ref()
const queryFormRef = ref()
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: ''
})

// 查询列表
const getList = async () => {
  pageLoading.value = true
  try {
    const data = await getRepairDevicePage(queryParams)
    list.value = data.list || []
    total.value = data.total
  } finally {
    pageLoading.value = false
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

const importRef = ref()
const openImportTable = () => {
  importRef.value.open()
}

const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const handleDelete = async (id: number) => {
  await message.delConfirm()
  await deleteDeviceType(id)
  message.success('删除成功')
  getList()
}

const print = (id: number) => {
  ElMessageBox.prompt('请输入打印数量', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^([1-9]|[1-9][0-9])$/,
    inputErrorMessage: '1-99内的数字',
    beforeClose(action, instance, done) {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        printBatchLabels({ id, num: instance.inputValue })
          .then((res) => {
            if (Array.isArray(res) && res.length) {
              batchLabelList.value = res
              printRef.value.open()
            } else {
              message.warning('没有可打印的标签')
            }
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
  getList()
})
</script>
