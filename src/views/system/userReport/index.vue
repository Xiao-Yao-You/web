<template>
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane label="全部" name="all">
      <UserReport v-if="activeName == 'all'" :badge-show="reportStore.badgeInfo.summaryFlag" />
    </el-tab-pane>
    <el-tab-pane label="我的关注" name="myFollow">
      <MyFollow v-if="activeName == 'myFollow'" />
    </el-tab-pane>
    <el-tab-pane name="myFollowUp">
      <template #label>
        <el-badge :value="reportStore.badgeInfo.needFollow">
          <span>我的跟进</span>
        </el-badge>
      </template>
      <myFollowUp v-if="activeName == 'myFollowUp'" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import UserReport from './all.vue'
import MyFollow from './myFollow.vue'
import myFollowUp from './myFollowUp.vue'
import { useReportStoreWithOut } from '@/store/modules/report'

const reportStore = useReportStoreWithOut()
const activeName = ref('all') //默认tab栏

onMounted(() => {
  reportStore.queryBadgeInfo()
})
</script>
