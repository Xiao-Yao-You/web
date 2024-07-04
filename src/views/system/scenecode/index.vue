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
      <el-form-item label="编码编号" prop="keyCode">
        <el-input
          v-model="queryParams.keyCode"
          placeholder="请输入编码号码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="编码规则" prop="description">
        <el-input
          v-model="queryParams.description"
          placeholder="请输入编码名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['system:scene-code:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <!-- <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['system:scene-code:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button> -->
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="编码编号" align="center" prop="keyCode" />
      <el-table-column label="编码名称" align="center" prop="description" />
      <el-table-column label="前缀" align="center" prop="prefix" />
      <el-table-column label="中缀" align="center" prop="infix" />
      <el-table-column label="后缀" align="center" prop="suffix" />
      <el-table-column label="编码规则" align="center" prop="type">
        <template #default="{ row: { type } }">
          {{ SceneTypeEnums[type] }}
        </template>
      </el-table-column>
      <el-table-column label="起始值" align="center" prop="start" />
      <el-table-column label="步长" align="center" prop="step" />
      <el-table-column label="启用状态" align="center" prop="status">
        <template #default="{ row: { status } }">
          <el-tag :type="status ? 'danger' : 'primary'">
            {{ status ? '禁用' : '启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="使用状态" align="center" prop="useStatus">
        <template #default="{ row: { useStatus } }">
          <el-tag :type="useStatus ? 'warning' : 'success'" effect="plain" round>
            {{ useStatus ? '使用中' : '未使用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="110" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            :disabled="scope.row.useStatus"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['system:scene-code:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            :disabled="scope.row.useStatus"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['system:scene-code:delete']"
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
  <SceneCodeForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { SceneCodeApi, SceneCodeVO } from '@/api/system/scenecode'
import SceneCodeForm from './ScenecodeForm.vue'
import { SceneTypeEnums } from './constant'
// import download from '@/utils/download'

/** 单据编码类型配置 列表 */
defineOptions({ name: 'SceneCode' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<SceneCodeVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  keyCode: undefined,
  description: undefined
})
const queryFormRef = ref() // 搜索的表单
// const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await SceneCodeApi.getSceneCodePage(queryParams)
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

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  // 删除的二次确认
  await message.delConfirm()
  // 发起删除
  await SceneCodeApi.deleteSceneCode(id)
  message.success(t('common.delSuccess'))
  // 刷新列表
  await getList()
}

/** 导出按钮操作 */
// const handleExport = async () => {
//   try {
//     // 导出的二次确认
//     await message.exportConfirm()
//     // 发起导出
//     exportLoading.value = true
//     const data = await SceneCodeApi.exportSceneCode(queryParams)
//     download.excel(data, '单据编码类型配置.xls')
//   } catch {
//   } finally {
//     exportLoading.value = false
//   }
// }

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
