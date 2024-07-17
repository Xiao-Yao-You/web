<script setup lang="ts">
import type { TagProps } from 'element-plus'
import { MeetingStatusTag, type MeetingStatus } from '@/api/system/meeting/constant'
import useMeetingStatus, { type StatusProps } from './hook/useMeetingStatus'

type TagInfo = OptionItem<TagProps['type']>

defineOptions({
  name: 'MeetingStatusTag'
})

const props = defineProps<StatusProps>()

const { status } = useMeetingStatus(props)

const tagInfo = reactive<TagInfo>({ value: 'primary', label: '未知状态' })

watchEffect(() => {
  if (status.value >= 0) {
    const { value, label } = MeetingStatusTag[status.value as unknown as `${MeetingStatus}`]
    tagInfo.value = value
    tagInfo.label = label
  }
})
</script>

<template>
  <el-tag :type="tagInfo.value">
    {{ tagInfo.label }}
  </el-tag>
</template>

<style scoped></style>
