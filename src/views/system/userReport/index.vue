<template>
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane label="全部" name="all">
      <UserReport />
    </el-tab-pane>
    <el-tab-pane label="我的关注" name="myFollow">Config</el-tab-pane>
    <el-tab-pane label="我的跟进" name="myFollowUp">Role</el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import UserReport from './all.vue'
const activeName = ref('all') //默认tab栏
</script>
