<template>
  <ContentWrap>
    <el-table v-loading="loading" :data="data" stripe show-overflow-tooltip highlight-current-row>
      <el-table-column label="月份" prop="reportMonth" />
      <el-table-column label="组别" prop="groupName" />
      <el-table-column label="问题类型" prop="questionTypeName" />
      <el-table-column label="工单数量" prop="orderCount">
        <template #default="{ row }">
          {{ row.orderCount ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column label="组内占比">
        <!-- <template #default="{ row }">
          {{ row.orderCount ?? '-' }}
        </template> -->
      </el-table-column>
      <el-table-column label="紧急程度分布" prop="urgencyLevelDistribution">
        <template #default="{ row: { urgencyLevelDistribution } }">
          {{ urgencyLevelDistribution ?? '--' }}
        </template>
      </el-table-column>
      <el-table-column label="平均处理时长" prop="aht">
        <!-- <template #default="{ row: { aht } }">
          {{ isNullOrUnDef(aht) ? '--' : formatMs(aht) }}
        </template> -->
      </el-table-column>
      <el-table-column label="挂起总时长" prop="pendingTotalTime">
        <template #default="{ row: { pendingTotalTime } }">
          {{ isNullOrUnDef(pendingTotalTime) ? '--' : formatMs(pendingTotalTime) }}
        </template>
      </el-table-column>
      <el-table-column label="接单类型分布" prop="orderTypeDistribution">
        <template #default="{ row: { orderTypeDistribution } }">
          {{ orderTypeDistribution ?? '--' }}
        </template>
      </el-table-column>
    </el-table>
  </ContentWrap>
</template>

<script setup lang="ts">
import { getGroupReport } from '@/api/statistics'
import { formatMs } from '@/utils/formatTime'
import { isNullOrUnDef } from '@/utils/is'

defineOptions({
  name: 'IndividualReport'
})

const route = useRoute()

const loading = ref(false)
const data = ref<any[]>([])
const query = async () => {
  const { list } = await getGroupReport({
    pageNo: 1,
    pageSize: 50,
    month: route.params.month as string,
    groupId: route.params.groupId as string
  })

  if (Array.isArray(list) && list.length) {
    data.value = list
    // data.value = list.map((item) => {
    //   // 提取派单、抢单、转单数量和高、中、低紧急工单数量
    //   const { orderTypeDistribution, urgencyLevelDistribution, ...rest } = item
    //   // prettier-ignore
    //   const [dispatchNum = '--', scrambleNum = '--', transferNum = '--'] = (orderTypeDistribution ?? '').match(/\d+/g) || []
    //   // prettier-ignore
    //   const [lowLevelNum = '--', middleLevelNum = '--', highLevelNum = '--'] = (urgencyLevelDistribution ?? '').match(/\d+/g) || []

    //   return {
    //     ...rest,
    //     lowLevelNum,
    //     middleLevelNum,
    //     highLevelNum,
    //     dispatchNum,
    //     scrambleNum,
    //     transferNum
    //   }
    // })
  }
}
defineExpose({ query })

onMounted(() => {
  query()
})
</script>
