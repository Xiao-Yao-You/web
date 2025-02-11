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
          <el-option label="请选择字典生成" value="" />
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
      <el-form-item label="建议状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择建议状态"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="附件地址" prop="filePath">
        <el-input
          v-model="queryParams.filePath"
          placeholder="请输入附件地址"
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
          v-hasPermi="['reasonableSuggestion::create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['reasonableSuggestion::export']"
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
      <el-table-column label="建议类型" align="center" prop="suggestionType">
        <template #default="{ row: { suggestionType } }">
          <dict-tag :type="DICT_TYPE.SUGGESTION_TYPE" :value="suggestionType" />
        </template>
      </el-table-column>
      <el-table-column label="申报人" align="center" prop="nickname" />
      <el-table-column label="申报人工号" align="center" prop="workNum" />
      <el-table-column label="手机号" align="center" prop="phoneNum" />
      <el-table-column label="申报部门" align="center" prop="deptName" />
      <el-table-column label="采纳状态" align="center" prop="status">
        <template #default="{ row: { status } }">
          <dict-tag :type="DICT_TYPE.ADOPTION_STATUS" :value="status" />
        </template>
      </el-table-column>
      <el-table-column
        label="申报时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" width="260px">
        <template #default="scope">
          <el-button link type="primary" @click="openViewForm('详情', scope.row.id)">
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['reasonableSuggestion::update']"
            v-if="scope.row.userId == userInfo.id"
          >
            编辑
          </el-button>
          <el-button
            link
            type="primary"
            @click="openViewForm('审核', scope.row.id)"
            v-if="scope.row.status == 1"
            v-hasPermi="['reasonableSuggestion::examine']"
          >
            审核
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['reasonableSuggestion::delete']"
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
  <ReasonableSuggestionForm ref="formRef" @success="getList" />
  <ReasonableSuggestionViewForm ref="viewFormRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { ReasonableSuggestionApi, ReasonableSuggestionVO } from '@/api/reasonablesuggestion'
import ReasonableSuggestionForm from './ReasonableSuggestionForm.vue'
import ReasonableSuggestionViewForm from './ReasonableSuggestionViewForm.vue'
import { useUserStore } from '@/store/modules/user'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

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

/** 详情页 */
const viewFormRef = ref()
const openViewForm = (type: string, id?: number) => {
  viewFormRef.value.open(type, id)
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

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
