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
      <el-form-item label="建议主题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入建议主题"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="建议类型" prop="suggestionType">
        <el-select
          v-model="queryParams.suggestionType"
          placeholder="请选择建议类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.SUGGESTION_TYPE)"
            :key="dict.label"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="申报人" prop="nickname">
        <el-input
          v-model="queryParams.nickname"
          placeholder="请输入申报人"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="申报部门" prop="deptName">
        <el-input
          v-model="queryParams.deptName"
          placeholder="请输入申报部门"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="审核状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择审核状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.ADOPTION_STATUS)"
            :key="dict.label"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          v-hasPermi="['reasonableSuggestion::create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          v-hasPermi="['reasonableSuggestion::allRead']"
          plain
          type="primary"
          :loading="readLoading"
          @click="handleRead"
        >
          <Icon icon="ep:reading" class="mr-5px" /> 一键已读
        </el-button>
        <el-button
          v-hasPermi="['reasonableSuggestion::export']"
          type="success"
          plain
          :loading="exportLoading"
          @click="handleExport"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="序号" type="index" width="80" />
      <el-table-column label="建议主题" align="center" prop="title" width="250" />
      <el-table-column label="审核状态" align="center" prop="status">
        <template #default="{ row: { status } }">
          <dict-tag :type="DICT_TYPE.ADOPTION_STATUS" :value="status" />
        </template>
      </el-table-column>
      <el-table-column label="建议类型" align="center" prop="suggestionType">
        <template #default="{ row: { suggestionType } }">
          <dict-tag :type="DICT_TYPE.SUGGESTION_TYPE" :value="suggestionType" />
        </template>
      </el-table-column>
      <!-- <el-table-column label="申报人" align="center" prop="nickname" />
      <el-table-column label="申报人工号" align="center" prop="workNum" /> -->
      <el-table-column label="手机号" align="center" prop="phoneNum" />
      <el-table-column label="申报部门" align="center" prop="deptName" />
      <el-table-column
        label="申报时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" width="200px">
        <template #default="{ row: { id, userId, status } }">
          <el-button
            v-hasPermi="['reasonableSuggestion::examine']"
            link
            type="primary"
            @click="openViewForm(id, status)"
          >
            审核
          </el-button>
          <el-button
            v-if="isOnlySelf(['reasonableSuggestion::delete'], userId)"
            link
            type="primary"
            :disabled="status !== AdoptionStatus.Unread"
            @click="openForm('update', id)"
          >
            编辑
          </el-button>
          <el-button
            v-if="isOnlySelf(['reasonableSuggestion::delete'], userId)"
            link
            type="danger"
            :disabled="[AdoptionStatus.Resolve, AdoptionStatus.Reject].includes(status)"
            @click="handleDelete(id)"
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

  <!-- 表单弹窗：新增/编辑 -->
  <ReasonableSuggestionForm
    ref="formRef"
    :user-info="userInfo"
    :depts="depts"
    @success="getList"
    @query="getList"
  />

  <!-- 审核与已读 -->
  <ReasonableExamine ref="viewFormRef" :user-info="userInfo" @success="getList" @query="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import {
  AdoptionStatus,
  ReasonableSuggestionApi,
  ReasonableSuggestionVO
} from '@/api/reasonablesuggestion'
import ReasonableSuggestionForm from './ReasonableSuggestionForm.vue'
import ReasonableExamine from './ReasonableExamine.vue'
import { useUserStore } from '@/store/modules/user'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { getDeptsByUserId } from '@/api/system/dept'
import { handleTree } from '@/utils/tree'

/** 合理化建议 列表 */
defineOptions({ name: 'ReasonableSuggestion' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const userInfo = useUserStore().getUser

const loading = ref(true) // 列表的加载中
const list = ref<ReasonableSuggestionVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  title: undefined,
  suggestionType: undefined,
  nickname: undefined,
  deptName: undefined,
  status: undefined,
  filePath: undefined
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

// 判断是否只有自己有权限
const isOnlySelf = (permissions: string[], userId: number) => {
  return checkPermi(permissions) && userId === userInfo.id
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ReasonableSuggestionApi.getPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

// 查询用户所在部门
const depts = ref<Tree[]>([])
const getUserDepts = async () => {
  const deptList = await getDeptsByUserId(userInfo.id)
  depts.value = handleTree(deptList || [])
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

/** 审核页 */
const viewFormRef = ref<InstanceType<typeof ReasonableExamine>>()
const openViewForm = (id: number, status: number) => {
  viewFormRef.value?.open(id, status)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await ReasonableSuggestionApi.delete(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await ReasonableSuggestionApi.export(queryParams)
    download.excel(data, '合理化建议.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

// 一键已读
const readLoading = ref(false)
const handleRead = async () => {
  readLoading.value = true
  try {
    await ReasonableSuggestionApi.readAll()
    message.success('一键已读成功')
    getList()
  } finally {
    readLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
  getUserDepts()
})
</script>
