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
      <el-form-item label="汇报人姓名" prop="reportUserNickName" label-width="100">
        <el-input
          v-model="queryParams.reportUserNickName"
          placeholder="请输入汇报人姓名"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="汇报日期" prop="dateReport">
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
      <el-table-column label="姓名" align="center" prop="replyUserNickName" />
      <el-table-column label="部门" align="center" prop="deptName" />
      <el-table-column
        label="汇报日期"
        align="center"
        prop="dateReport"
        :formatter="dateFormatter2"
      />
      <el-table-column label="工作内容" align="center" prop="content" />
      <el-table-column label="关联事件" align="center" prop="connectContent" width="180px" />
      <el-table-column label="批复" align="center" prop="reply" />
      <el-table-column label="跟进状态" align="center" prop="replyStatus" width="180px">
        <template #default="scope">
          <el-tag type="primary" v-if="scope.row.replyStatus == 0">未跟进</el-tag>
          <el-tag type="warning" v-if="scope.row.replyStatus == 1">已跟进</el-tag>
        </template></el-table-column
      >
      <el-table-column label="跟进情况" align="center" prop="situation" />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            v-if="scope.row.replyStatus == 1"
            v-hasPermi="['hk:report_job_schedule:query']"
            link
            type="primary"
            @click="viewFollow(scope.row.id)"
          >
            查看跟进
          </el-button>
          <el-button
            v-else
            v-hasPermi="['hk:report-attention:delete']"
            link
            type="primary"
            @click="deleteFollow(scope.row.id)"
          >
            取消关注
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
  <ViewWorkProgressForm ref="viewWorkProgressRef" />
</template>

<script setup lang="ts">
import { dateFormatter, dateFormatter2 } from '@/utils/formatTime'
import { UserReportApi, UserReportVO } from '@/api/system/userReport'
import ViewWorkProgressForm from './viewWorkProgressForm.vue'

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
  reportUserNickName: undefined
})
const queryFormRef = ref() // 搜索的表单
const viewWorkProgressRef = ref()

const deleteFollow = async (id: number) => {
  try {
    // 取消的二次确认
    await message.confirm('是否确认取消关注当前事项?', '取消关注')
    // 发起取消
    await UserReportApi.deleteFollow(id)
    message.success('取消成功')
    // 刷新列表
    await getList()
  } catch {}
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserReportApi.getReportAttentionPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}
const viewFollow = async (id: number) => {
  viewWorkProgressRef.value.open(id)
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
