<template>
  <ContentWrap>
    <el-date-picker
      v-model="reportMonth"
      type="month"
      value-format="YYYY-MM"
      placeholder="请选择年月"
      :disabled-date="handleDisabledDate"
    />
    <el-button plain type="success" class="ml-20px" @click="createReport">
      <Icon class="mr-5px" icon="ep:data-analysis" />
      生成新报表
    </el-button>
    <el-button plain type="primary" class="ml-20px" @click="refreshReport">
      <Icon class="mr-5px" icon="ep:refresh" />
      刷新
    </el-button>
  </ContentWrap>

  <ContentWrap :title="title">
    <el-table v-loading="loading" :data="list" stripe show-overflow-tooltip>
      <el-table-column label="月份" prop="reportMonth" />
      <el-table-column label="报表">
        <template #default="{ row: { reportTitle, groupName } }">
          {{ reportTitle || groupName }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row)">详情</el-button>
          <!-- <el-button link type="warning">导出</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="queryList"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import {
  createIndividualReport,
  createGroupReport,
  createAssetsReport,
  getIndividualPage,
  getGroupPage
} from '@/api/statistics'
import { propTypes } from '@/utils/propTypes'

defineOptions({
  name: 'StatsOverview'
})

const props = defineProps({
  tab: propTypes.string.isRequired
})

const TabPaneInfo = {
  individual: {
    title: '人工统计月度报表',
    query: getIndividualPage,
    create: createIndividualReport
  },
  groupOrder: {
    title: '工单统计月度报表',
    query: getGroupPage,
    create: createGroupReport
  },
  assets: {
    title: '资产统计月度报表',
    query: getIndividualPage,
    create: createAssetsReport
  },
  exception: {
    title: '异常统计月度报表',
    query: getIndividualPage,
    create: createIndividualReport
  }
}

const message = useMessage()

// 当月即之后的月份禁用
const handleDisabledDate = (time: Date) => {
  const currentDate = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  const selectedMonth = time.getMonth()
  const selectedYear = time.getFullYear()

  // prettier-ignore
  return selectedYear > currentYear || (selectedYear === currentYear && selectedMonth >= currentMonth)
}

const loading = ref(true)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 20
})
const total = ref(0)
const list = ref<any[]>([])
const title = computed(() => TabPaneInfo[props.tab].title)

// 查询报告
const queryList = async () => {
  try {
    const data = await TabPaneInfo[props.tab].query(queryParams)
    list.value = data.list || []
    total.value = data.total
  } finally {
    loading.value = false
  }
}

// 生成统计报告
const reportMonth = ref(undefined)
const createReport = async () => {
  if (!reportMonth.value) return message.alertWarning('请选择需要的年月')

  try {
    loading.value = true
    await TabPaneInfo[props.tab].create(reportMonth.value)
    await queryList()
  } finally {
    loading.value = false
  }
}

// 刷新
const refreshReport = async () => {
  queryParams.pageNo = 1
  queryParams.pageSize = 20
  reportMonth.value = undefined
  await queryList()
}

watchEffect(() => {
  if (props.tab) refreshReport()
})

// 打开详情
const router = useRouter()
// const route = useRoute()
const openDetail = (row: any) => {
  let path = ''
  switch (props.tab) {
    case 'individual':
      path = `/repair/statistics/individual/${row.reportMonth}`
      break
    case 'groupOrder':
      path = `/repair/statistics/group-order/${row.reportMonth}/${row.groupId}`
      break
    case 'assets':
      break
    case 'exception':
      break

    default:
      break
  }
  if (path) {
    router.push({
      path
    })
  }
  // router.push({
  //   path: route.path,
  //   query: {
  //     ...route.query,
  //     reportMonth: row.reportMonth
  //   }
  // })
}

onMounted(() => {
  queryList()
})
</script>
