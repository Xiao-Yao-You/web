<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { deleteLocation, type LocationAllParams } from '@/api/repair'
import { useRepairStoreWithOut } from '@/store/modules/repair'
import LocationForm from './LocationForm.vue'
import AddressImportForm from './AddressImportForm.vue'

defineOptions({
  name: 'RepairLocation'
})

const repairStore = useRepairStoreWithOut()
const { locationsTree: tree } = storeToRefs(repairStore)
const message = useMessage()

const loading = ref(true)
const isExpandAll = ref(false) // 是否展开，默认全部折叠
const refreshTable = ref(true) // 重新渲染表格状态
const queryFormRef = ref()
const queryParams = reactive<LocationAllParams>({
  addressName: ''
})

// 查询列表
const getLocationsMenu = () => {
  loading.value = true
  repairStore.fetchLocationsAll(queryParams).finally(() => {
    loading.value = false
  })
}

// 搜索按钮操作
const handleQuery = () => {
  queryParams.addressName = ''
  getLocationsMenu()
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
  await deleteLocation(id)
  message.success('删除成功')
  getLocationsMenu()
}

onMounted(() => {
  getLocationsMenu()
})
</script>

<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" :inline="true">
      <el-form-item label="地点名称" prop="addressName">
        <el-input
          v-model="queryParams.addressName"
          placeholder="请输入地点名称"
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
          <Icon icon="ep:plus" class="mr-5px" /> 新增主地点
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
      <el-table-column label="地点名称" prop="addressName" show-overflow-tooltip width="250" />
      <el-table-column label="区域软件负责人" align="center" prop="softUserNickName" />
      <el-table-column label="区域硬件负责人" align="center" prop="hardwareUserNickName" />
      <el-table-column label="启用状态" align="center" prop="status">
        <template #default="{ row: { status } }">
          <el-tag :type="status ? 'danger' : 'primary'">
            {{ status ? '禁用' : '启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center">
        <template #default="{ row: { id, status } }">
          <el-button link type="primary" @click="openForm('detail', id)"> 详情 </el-button>
          <el-button link type="primary" @click="openForm('child', id)"> 添加子类 </el-button>
          <el-button link type="primary" @click="openForm('update', id)"> 编辑 </el-button>
          <el-button link type="danger" @click="handleDelete(id)" :disabled="!status">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <LocationForm ref="formRef" @success="getLocationsMenu" />

  <AddressImportForm ref="importRef" @success="getLocationsMenu" />
</template>
