<template>
  <Dialog
    title="工单详情"
    v-model="visible"
    scroll
    maxHeight="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-descriptions :column="1" border>
      <el-descriptions-item label="工单编号" :width="10"> {{ info.code }} </el-descriptions-item>
      <el-descriptions-item label="工单标题"> {{ info.title }} </el-descriptions-item>
      <el-descriptions-item label="二维码编号"> {{ info.labelCode }} </el-descriptions-item>
      <el-descriptions-item label="设备名称"> {{ info.deviceName }} </el-descriptions-item>
      <el-descriptions-item label="设备所在地点"> {{ info.address }} </el-descriptions-item>
      <el-descriptions-item label="设备具体位置">{{ info.location }}</el-descriptions-item>
      <el-descriptions-item label="报修人"> {{ info.submitUserNickName }} </el-descriptions-item>
      <el-descriptions-item label="报修人电话"> {{ info.submitUserMobile }} </el-descriptions-item>
      <el-descriptions-item label="请求类型">
        {{ getDictLabel(DICT_TYPE.REPAIR_REQUEST_TYPE, info.requestType) }}
      </el-descriptions-item>
      <el-descriptions-item label="问题类型">{{ info.questionTypeStr }}</el-descriptions-item>
      <el-descriptions-item label="紧急程度">
        {{ getDictLabel(DICT_TYPE.LEVEL, info.level) }}
      </el-descriptions-item>
      <el-descriptions-item label="问题描述"> {{ info.description }} </el-descriptions-item>
      <el-descriptions-item label="问题图片">
        <el-empty
          v-if="!pictures.length"
          style="padding: unset"
          :image-size="80"
          description="暂无数据"
        />
        <el-carousel v-else trigger="click">
          <el-carousel-item v-for="(url, index) in pictures" :key="index">
            <el-image style="width: 100%; height: 100%" :src="url" fit="contain" />
          </el-carousel-item>
        </el-carousel>
      </el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>

<script setup lang="ts">
import { ElLoading } from 'element-plus'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { getRepairOrder, type RepairOrder } from '@/api/repair'
import { OperateType } from '@/api/repair/constant'

defineOptions({
  name: 'OrderDetail'
})

const visible = ref(false)
const info = ref({} as RepairOrder)
const pictures = computed(() => {
  if (Array.isArray(info.value.recordList)) {
    const record = info.value.recordList.find((item) => item.operateType === OperateType.CHUANGJIAN)
    return record?.picture ? record.picture.split(';') : []
  } else {
    return []
  }
})
const open = async (id: number) => {
  info.value = {} as RepairOrder
  visible.value = true
  await nextTick()
  const loadingInstance = ElLoading.service({
    target: document.querySelector('.el-dialog__body') as HTMLElement
  })
  try {
    info.value = await getRepairOrder(id)
  } finally {
    loadingInstance.close()
  }
}
defineExpose({ open })
</script>
