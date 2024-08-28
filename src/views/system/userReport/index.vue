<template>
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane label="全部" name="all">
      <UserReport v-if="activeName == 'all'" />
    </el-tab-pane>
    <el-tab-pane label="我的关注" name="myFollow">
      <MyFollow v-if="activeName == 'myFollow'" />
    </el-tab-pane>
    <el-tab-pane label="我的跟进" name="myFollowUp">
      <myFollowUp v-if="activeName == 'myFollowUp'" />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import UserReport from './all.vue'
import MyFollow from './myFollow.vue'
import myFollowUp from './myFollowUp.vue'
const activeName = ref('all') //默认tab栏
</script>
