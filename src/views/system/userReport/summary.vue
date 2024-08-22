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
          <template #default="">
            <el-button link type="primary"> 关注 </el-button>
            <el-button link type="primary"> 详情 </el-button>
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
  </Dialog>
</template>
<script setup lang="ts">
import { getDeptsByUserId } from '@/api/system/dept'
import { dateFormatter, dateFormatter2 } from '@/utils/formatTime'
import { getAll } from '@/api/system/user'
import { useUserStore } from '@/store/modules/user'
import { defaultProps, handleTree } from '@/utils/tree'
import dayjs from 'dayjs'
import { isArray } from '../../../utils/is'
import { formatDate } from '../../../utils/formatTime'
import {
  UserReportApi,
  UserReportVO,
  type workProgress,
  type workPlan
} from '@/api/system/userReport'

/** 用户汇报汇总 窗口 */
defineOptions({ name: 'UserReportForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const loading = ref(false) // 列表的加载中
const list = ref<UserReportVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const selectObj = ref()
const userInfo = useUserStore().getUser
const tableData = ref({})

const formRef = ref() // 表单 Ref

const depts = ref<Tree[]>([])
const reportObjects = ref<any[]>([])
const queryFormRef = ref() // 搜索的表单

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  dateReport: ''
})

const queryToday = () => {}

const queryYesterday = () => {}

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

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await UserReportApi.getSummaryData(queryParams)
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
