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

  <ContentWrap title="月度报表">
    <el-table v-loading="loading" :data="list" stripe show-overflow-tooltip>
      <el-table-column label="月份" prop="reportMonth" />
      <el-table-column label="报表" prop="reportTitle" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <router-link :to="`/repair/statistics/individual/${row.reportMonth}`">
            <el-button link type="primary">详情</el-button>
          </router-link>
          <!-- <el-button link type="warning">导出</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="query"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { getIndividualPage, createIndividualReport } from '@/api/statistics'

defineOptions({
  name: 'StatsIndividual'
})

const loading = ref(true)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 20
})
const total = ref(0)
const list = ref<any[]>([])
const query = async () => {
  try {
    const data = await getIndividualPage(queryParams)
    list.value = data.list || []
    total.value = data.total
  } finally {
    loading.value = false
  }
}

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

//#region 生成统计报告
const reportMonth = ref(undefined)
const createReport = async () => {
  try {
    loading.value = true
    await createIndividualReport(reportMonth.value)
    await query()
  } finally {
    loading.value = false
  }
}

// 刷新
const refreshReport = async () => {
  queryParams.pageNo = 1
  queryParams.pageSize = 20
  reportMonth.value = undefined
  await query()
}

onMounted(() => {
  query()
})
</script>
