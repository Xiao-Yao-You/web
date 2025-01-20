<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form class="-mb-15px" :model="queryParams" ref="queryFormRef" inline>
      <el-form-item label="地点名称" prop="addressName">
        <el-input
          v-model="queryParams.addressName"
          placeholder="请输入地点名称"
          clearable
          @keyup.enter="getLocationsMenu"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="getLocationsMenu"
          ><Icon icon="ep:search" class="mr-5px" />搜索</el-button
        >
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
        <el-button type="primary" @click="openImportTable()">
          <Icon class="mr-5px" icon="ep:upload" />
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
      <el-table-column label="操作" align="center" fixed="right" width="240">
        <template #default="{ row }">
          <el-button link type="primary" @click="openForm('detail', row.id)"> 详情 </el-button>
          <el-button
            v-if="!row.parentAddressId"
            link
            type="primary"
            @click="openForm('child', row.id)"
          >
            添加子类
          </el-button>
          <el-button link type="primary" @click="openForm('update', row.id)"> 编辑 </el-button>
          <el-button link type="danger" @click="handleDelete(row)" :disabled="!row.status">
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

<script setup lang="ts">
import { ElMessageBox } from 'element-plus'
import {
  deleteLocation,
  getRepairLocationAll,
  type LocationAllParams,
  type RepairLocation
} from '@/api/repair'
import LocationForm from './LocationForm.vue'
import { handleTree } from '@/utils/tree'
import AddressImportForm from './AddressImportForm.vue'
import { CommonStatusEnum } from '@/utils/constants'

defineOptions({
  name: 'RepairLocation'
})

const message = useMessage()

const loading = ref(true)
const isExpandAll = ref(false) // 是否展开，默认全部折叠
const refreshTable = ref(true) // 重新渲染表格状态
const queryFormRef = ref()
const queryParams = reactive<LocationAllParams>({
  addressName: ''
})
const tree = ref<any[]>([])

// 查询列表
const getLocationsMenu = async () => {
  loading.value = true
  try {
    const data = await getRepairLocationAll(queryParams)
    tree.value = handleTree(data, 'id', 'parentAddressId')
  } finally {
    loading.value = false
  }
}

// 重置按钮操作
const resetQuery = () => {
  queryFormRef.value.resetFields()
  getLocationsMenu()
}

// 导入
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

// #region 地点删除
const handleDelete = async (row) => {
  const enableExistd = getChildEnabledStatus(row.children)
  if (enableExistd) {
    return ElMessageBox.alert(
      '<div>该类地点下有正在启用的子类地点。<p style="margin-top: 15px">如需删除，请先手动禁用它们。</p></div>',
      '系统提示',
      { dangerouslyUseHTMLString: true }
    )
  }
  ElMessageBox({
    title: '系统提示',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    message: h(
      'div',
      null,
      row.parentAddressId
        ? [h('span', '确定删除该地点吗？')]
        : [
            h('span', '确定删除该类地点吗？'),
            h(
              'p',
              { style: { marginTop: '16px', fontWeight: 600 } },
              '请注意：该类型下所有子类地点都将被删除！'
            )
          ]
    ),
    beforeClose(action, instance, done) {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        instance.confirmButtonText = '删除中...'
        deleteLocation(row.id)
          .then(() => {
            message.success('删除成功')
            getLocationsMenu()
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

// 查找父类下有没有正在启用的子类（如果有，在删除父类时，需要提示）
const getChildEnabledStatus = (children: RepairLocation[]) => {
  if (!Array.isArray(children)) return false

  let enabled = false
  for (const child of children) {
    enabled = child?.status === CommonStatusEnum.ENABLE
    if (enabled) break
  }
  return enabled
}

// #endregion

onMounted(() => {
  getLocationsMenu()
})
</script>
