<template>
  <ContentWrap>
    <el-table v-loading="loading" :data="data" stripe show-overflow-tooltip highlight-current-row>
      <el-table-column label="月份" prop="reportMonth" fixed width="90" />
      <el-table-column label="姓名" prop="username" fixed width="90" />
      <el-table-column label="总工单数量" prop="totalOrderCount" width="100" align="center">
        <template #default="{ row }">
          {{ row.totalOrderCount ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column label="已完成数量" prop="completeOrderCount" width="100" align="center">
        <template #default="{ row }">
          {{ row.completeOrderCount ?? '--' }}
        </template>
      </el-table-column>
      <el-table-column label="处理中数量" prop="processingOrderCount" width="100" align="center">
        <template #default="{ row }">
          {{ row.processingOrderCount ?? '--' }}
        </template>
      </el-table-column>
      <el-table-column label="挂起数量" prop="pendingOrderCount" align="center">
        <template #default="{ row }">
          {{ row.pendingOrderCount ?? '--' }}
        </template>
      </el-table-column>
      <el-table-column label="处理总时长" prop="totalHandleTime" width="110" align="center">
        <template #default="{ row: { totalHandleTime } }">
          {{ isNullOrUnDef(totalHandleTime) ? '--' : formatMs(totalHandleTime) }}
        </template>
      </el-table-column>
      <el-table-column label="平均处理时长" prop="aht" width="110" align="center">
        <template #default="{ row: { aht } }">
          {{ isNullOrUnDef(aht) ? '--' : formatMs(aht) }}
        </template>
      </el-table-column>
      <el-table-column label="处理时长/工作时长" prop="timeProportion" width="150" align="center">
        <template #default="{ row: { timeProportion } }">
          {{ isNullOrUnDef(timeProportion) ? '--' : `${timeProportion} %` }}
        </template>
      </el-table-column>
      <el-table-column label="低紧急工单数" prop="lowLevelNum" width="110" align="center" />
      <el-table-column label="中紧急工单数" prop="middleLevelNum" width="110" align="center" />
      <el-table-column label="高紧急工单数" prop="highLevelNum" width="110" align="center" />
      <el-table-column label="主动接单数" prop="scrambleNum" width="110" align="center" />
      <el-table-column
        label="主动接单占比"
        prop="orderAcceptedProportion"
        width="110"
        align="center"
      >
        <template #default="{ row: { orderAcceptedProportion } }">
          {{ isNullOrUnDef(orderAcceptedProportion) ? '--' : `${orderAcceptedProportion} %` }}
        </template>
      </el-table-column>
      <el-table-column label="挂起总时长" prop="pendingTotalTime" width="110" align="center">
        <template #default="{ row: { pendingTotalTime } }">
          {{ isNullOrUnDef(pendingTotalTime) ? '--' : formatMs(pendingTotalTime) }}
        </template>
      </el-table-column>
      <el-table-column label="平均挂起时长" prop="apt" width="110" align="center">
        <template #default="{ row: { apt } }">
          {{ isNullOrUnDef(apt) ? '--' : formatMs(apt) }}
        </template>
      </el-table-column>
      <el-table-column label="按时完成率" prop="onTimeCompletionRate" width="100" align="center">
        <template #default="{ row: { onTimeCompletionRate } }">
          {{ isNullOrUnDef(onTimeCompletionRate) ? '--' : `${onTimeCompletionRate} %` }}
        </template>
      </el-table-column>
      <el-table-column label="环比增长量" prop="monthOnMonthGrowth" width="100" align="center">
        <template #default="{ row }">
          {{ row.monthOnMonthGrowth ?? '--' }}
        </template>
      </el-table-column>
      <el-table-column label="环比增长率" prop="monthOnMonthGrowthRate" width="100" align="center">
        <template #default="{ row: { monthOnMonthGrowthRate } }">
          {{ isNullOrUnDef(monthOnMonthGrowthRate) ? '--' : `${monthOnMonthGrowthRate} %` }}
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>
</template>

<script setup lang="ts">
import { getIndividualReport } from '@/api/statistics'
import { formatMs } from '@/utils/formatTime'
import { isNullOrUnDef } from '@/utils/is'

defineOptions({
  name: 'IndividualReport'
})

const route = useRoute()

const loading = ref(false)
const data = ref<any[]>([])
const query = async () => {
  const { list } = await getIndividualReport({
    pageNo: 1,
    pageSize: 50,
    reportMonth: route.params.month as string
  })
  if (Array.isArray(list) && list.length) {
    data.value = list.map((item) => {
      // 提取派单、抢单、转单数量和高、中、低紧急工单数量
      const { orderTypeDistribution, urgencyLevelDistribution, ...rest } = item
      // prettier-ignore
      const [dispatchNum = '--', scrambleNum = '--', transferNum = '--'] = (orderTypeDistribution ?? '').match(/\d+/g) || []
      // prettier-ignore
      const [lowLevelNum = '--', middleLevelNum = '--', highLevelNum = '--'] = (urgencyLevelDistribution ?? '').match(/\d+/g) || []

      return {
        ...rest,
        lowLevelNum,
        middleLevelNum,
        highLevelNum,
        dispatchNum,
        scrambleNum,
        transferNum
      }
    })
  }
}
defineExpose({ query })

onMounted(() => {
  query()
})
</script>
