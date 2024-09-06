<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1300px">
    <ContentWrap>
      <!-- 搜索工作栏 -->
      <el-form
        class="-mb-15px"
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        label-width="68px"
      >
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
          <el-button @click="handleQuery" type="primary">
            <Icon icon="ep:search" class="mr-5px" /> 搜索
          </el-button>
          <el-button @click="resetQuery">
            <Icon icon="ep:refresh" class="mr-5px" /> 重置
          </el-button>
          <el-button @click="queryToday" type="primary">
            <Icon icon="ep:search" class="mr-5px" /> 今日
          </el-button>
          <el-button @click="queryYesterday" type="primary">
            <Icon icon="ep:search" class="mr-5px" /> 昨日
          </el-button>
        </el-form-item>
      </el-form>
    </ContentWrap>
    <ContentWrap>
      <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="工作内容" align="center" prop="content" />
        <el-table-column label="汇报人" align="center" prop="userNickName" />
        <el-table-column label="完成情况" align="center" prop="situation" />
        <el-table-column label="关联事项" align="center" prop="connectContent" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button
              link
              type="primary"
              @click="openHandleFollowForm(scope.row)"
              v-hasPermi="['hk:report-attention:create']"
              v-if="scope.row.attentionUserId == '' || scope.row.attentionUserId == null"
            >
              关注
            </el-button>
            <el-button link type="primary" @click="openSummaryDetailForm(scope.row)">
              详情
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
    <HandleFollow ref="handleFollowRef" @success="getList" />
    <SummaryDetail ref="summaryDetailRef" />
    以下人员暂未提交当日工作汇报： <br />
    <span v-if="notSubmitUserList.length != 0"> {{ notSubmitUserList.join(',') }} </span>
    <span v-if="notSubmitUserList.length == 0"> 暂无统计数据 </span>
  </Dialog>
</template>
<script setup lang="ts">
import { useUserStore } from '@/store/modules/user'
import HandleFollow from './handleFollow.vue'
import SummaryDetail from './summaryDetail.vue'
import { UserReportApi, UserReportVO } from '@/api/system/userReport'

/** 用户汇报汇总 窗口 */
defineOptions({ name: 'UserReportForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const loading = ref(false) // 列表的加载中
const list = ref<UserReportVO[]>([]) // 列表的数据
const notSubmitUserList = ref<string[]>([])
const total = ref(0) // 列表的总页数

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const selectObj = ref()
const userInfo = useUserStore().getUser
const tableData = ref({})

const formRef = ref() // 表单 Ref
const handleFollowRef = ref()
const summaryDetailRef = ref()

const depts = ref<Tree[]>([])
const reportObjects = ref<any[]>([])
const queryFormRef = ref() // 搜索的表单

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  dateReport: [] as string[]
})

/**打开关注详情的操作抽屉 */
const openSummaryDetailForm = (row) => {
  summaryDetailRef.value.open(row)
}

/**打开关注的操作抽屉 */
const openHandleFollowForm = (row) => {
  handleFollowRef.value.open(row, 1)
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 查询今天的汇报 */
const queryToday = () => {
  queryParams.pageNo = 1
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  queryParams.dateReport = [todayStr, todayStr]
  getList()
}
/** 查询昨天的汇报 */
const queryYesterday = () => {
  queryParams.pageNo = 1
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  queryParams.dateReport = [yesterdayStr, yesterdayStr]
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserReportApi.getSummaryData(queryParams)
    notSubmitUserList.value = data.notSubmitUserNameList
    list.value = data.reportList.list
    total.value = data.reportList.total
  } finally {
    loading.value = false
  }
}

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
  dialogTitle.value = '工作汇报汇总'
  getList()
}
/** 初始化 **/
onMounted(() => {})
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
</script>
