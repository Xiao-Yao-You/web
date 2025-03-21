<template>
  <el-tabs v-model="activeTab">
    <el-tab-pane label="人工统计" name="individual" />
    <el-tab-pane label="工单统计" name="order" />
    <el-tab-pane label="资产统计" name="assets" />
    <el-tab-pane label="异常统计" name="exception" />
  </el-tabs>
  <Overview key="exception" :tab="activeTab" />
</template>

<script setup lang="ts">
import Overview from './Overview.vue'

defineOptions({ name: 'RepairStatistics' })

const activeTab = ref('individual')
</script>
