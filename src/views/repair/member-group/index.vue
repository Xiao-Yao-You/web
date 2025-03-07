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
      <!-- <el-form-item label="分组id" prop="groupId">
        <el-input
          v-model="queryParams.groupId"
          placeholder="请输入分组id"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item> -->
      <el-form-item>
        <!-- <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button> -->
        <!-- <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button> -->
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['hk:operation-group:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增分组
        </el-button>
        <!-- <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['hk:operation-group:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button> -->
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="运维小组" align="center" prop="groupId">
        <template #default="scope">
          {{ getDictLabel(DICT_TYPE.REPAIR_REQUEST_TYPE, scope.row.groupId) }}
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['hk:operation-group:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['hk:operation-group:delete']"
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
  <MemberGroupForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import {
  getMemberGroupPage,
  deleteMemberGroup,
  // exportMemberGroup,
  type MemberGroupVO
} from '@/api/repair'
import MemberGroupForm from './MemberGroupForm.vue'
import { useEmployeeStoreWithOut } from '@/store/modules/employee'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
// import download from '@/utils/download'

/** 成员分组 列表 */
defineOptions({ name: 'MemberGroup' })

const message = useMessage()
const { t } = useI18n()
const employeeStore = useEmployeeStoreWithOut()

const loading = ref(true)
const list = ref<MemberGroupVO[]>([])
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 20
  // groupId: undefined
})
const queryFormRef = ref() // 搜索的表单
// const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getMemberGroupPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
// const handleQuery = () => {
//   queryParams.pageNo = 1
//   getList()
// }

/** 重置按钮操作 */
// const resetQuery = () => {
//   queryFormRef.value.resetFields()
//   handleQuery()
// }

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await deleteMemberGroup(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
// const handleExport = async () => {
//   try {
//     // 导出的二次确认
//     await message.exportConfirm()
//     // 发起导出
//     exportLoading.value = true
//     const data = await exportMemberGroup(queryParams)
//     download.excel(data, '成员分组.xls')
//   } catch {
//   } finally {
//     exportLoading.value = false
//   }
// }

/** 初始化 **/
onMounted(() => {
  employeeStore.fetchInfoEmployees()
  getList()
})
</script>
