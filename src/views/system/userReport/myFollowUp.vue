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
      <el-form-item label="汇报日期" prop="dateReport" label-width="86">
        <el-date-picker
          v-model="queryParams.dateReport"
          type="daterange"
          range-separator="-"
          value-format="YYYY-MM-DD"
          start-placeholder="请选择开始日期"
          end-placeholder="请选择结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"> <Icon icon="ep:search" class="mr-5px" /> 搜索 </el-button>
        <el-button @click="resetQuery"> <Icon icon="ep:refresh" class="mr-5px" /> 重置 </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>
  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column label="工作内容" align="center" prop="content" />
      <el-table-column label="关联事件" align="center" prop="connectContent" />
      <el-table-column
        label="汇报日期"
        align="center"
        prop="createTime"
        :formatter="dateFormatter2"
      />
      <el-table-column label="关注人" align="center" prop="userNickName" />

      <el-table-column label="批复" align="center" prop="reply" />

      <el-table-column label="跟进状态" align="center" prop="replyStatus">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.replyStatus == 0">未跟进</el-tag>
          <el-tag type="warning" v-if="scope.row.replyStatus == 1">已跟进</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openHandleFollowUpForm(scope.row)"
            v-if="scope.row.replyStatus == 0"
            :disabled="new Date(scope.row.createTime).getUTCDate() == new Date().getUTCDate()"
          >
            跟进
          </el-button>
          <el-button
            link
            type="primary"
            @click="openTransferForm(scope.row)"
            v-if="scope.row.replyStatus == 0"
          >
            转交
          </el-button>
          <el-button link type="primary" @click="openTransferRecordForm(scope.row)">
            转交记录
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
  <HandleFollowUpForm ref="handleFollowUpRef" @success="getList" />
  <TransferForm ref="handleTransferRef" @success="getList" />
  <transferRecordForm ref="transferRecordRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter, dateFormatter2 } from '@/utils/formatTime'
import { UserReportApi, UserReportVO } from '@/api/system/userReport'
import HandleFollowUpForm from './handleFollowUpForm.vue'
import TransferForm from './transferForm.vue'
import transferRecordForm from './transferRecordForm.vue'

/** 用户汇报 列表 */
defineOptions({ name: 'MyFollow' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<UserReportVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  dateReport: '',
  userNickName: undefined
})
const queryFormRef = ref() // 搜索的表单

const handleFollowUpRef = ref() // 处理跟进的窗口

const handleTransferRef = ref() // 处理转交的窗口

const transferRecordRef = ref() // 处理转交记录的窗口

/**查询跟进记录 */
const openTransferRecordForm = async (row: any) => {
  transferRecordRef.value.open(row)
}

/** 处理跟进 */
const openTransferForm = async (row: any) => {
  handleTransferRef.value.open(row)
}

/** 处理转交 */
const openHandleFollowUpForm = async (row: any) => {
  handleFollowUpRef.value.open(row)
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserReportApi.getReportFollowPage(queryParams)
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

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
