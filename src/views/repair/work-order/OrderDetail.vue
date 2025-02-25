<template>
  <Dialog
    title="工单详情"
    v-model="visible"
    scroll
    maxHeight="60vh"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-tabs v-model="activeName" class="demo-tabs">
      <el-tab-pane label="工单信息" name="info">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="工单编号" :width="10">
            {{ info.code }}
          </el-descriptions-item>
          <el-descriptions-item label="工单标题"> {{ info.title }} </el-descriptions-item>
          <el-descriptions-item label="二维码编号"> {{ info.labelCode }} </el-descriptions-item>
          <el-descriptions-item label="设备名称"> {{ info.deviceName }} </el-descriptions-item>
          <el-descriptions-item label="设备所在地点"> {{ info.address }} </el-descriptions-item>
          <el-descriptions-item label="设备具体位置">{{ info.location }}</el-descriptions-item>
          <el-descriptions-item label="报修人">
            {{ info.submitUserNickName }}
          </el-descriptions-item>
          <el-descriptions-item label="报修人电话">
            {{ info.submitUserMobile }}
          </el-descriptions-item>
          <el-descriptions-item label="请求类型">
            {{ getDictLabel(DICT_TYPE.REPAIR_REQUEST_TYPE, info.requestType) }}
          </el-descriptions-item>
          <el-descriptions-item label="问题类型">{{ info.questionTypeStr }}</el-descriptions-item>
          <el-descriptions-item label="紧急程度">
            {{ getDictLabel(DICT_TYPE.LEVEL, info.level) }}
          </el-descriptions-item>
          <el-descriptions-item label="问题描述"> {{ info.description }} </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane label="处理流程" name="workflow">
        <el-timeline>
          <el-timeline-item
            v-for="(record, index) in info.recordList"
            :key="record.id"
            :timestamp="formatDate(record.createTime)"
            placement="top"
          >
            <el-card body-class="py-10px!">
              <el-descriptions :column="1">
                <el-descriptions-item label="处理状态：">
                  {{ OperateType[record.operateType] }}
                </el-descriptions-item>
                <el-descriptions-item :label="`${index ? '处理' : '报修'}人：`">
                  {{ record.operateUserNickName }}
                </el-descriptions-item>
                <el-descriptions-item :label="`${index ? '说明：' : '描述：'}`">
                  {{ index ? record.remark || '无' : info.description }}
                </el-descriptions-item>
                <el-descriptions-item
                  label="图片："
                  :label-class-name="record.picture ? 'block' : ''"
                >
                  <span v-if="!record.picture">无</span>
                  <template v-else>
                    <el-image
                      class="mr-10px"
                      v-for="(url, i) in record.picture.split(';')"
                      :key="i"
                      style="width: 100px; height: 100px"
                      :src="url"
                      fit="cover"
                      :zoom-rate="1.2"
                      :max-scale="7"
                      :min-scale="0.2"
                      show-progress
                      :preview-src-list="record.picture?.split(';')"
                    />
                  </template>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>
    </el-tabs>
  </Dialog>
</template>

<script setup lang="ts">
import { ElLoading } from 'element-plus'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { getRepairOrder, type RepairOrder } from '@/api/repair'
import { OperateType } from '@/api/repair/constant'
import { formatDate } from '@/utils/formatTime'

defineOptions({
  name: 'OrderDetail'
})

const visible = ref(false)

const activeName = ref('info') // info-工单信息, workflow-处理流程

const info = ref({} as RepairOrder)

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
