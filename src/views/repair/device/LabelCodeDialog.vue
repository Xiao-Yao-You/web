<template>
  <Dialog title="标签打印" v-model="visible">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="现有编号" name="useable">
        <span>请选择需要的编号：</span>
        <el-select
          v-model="selectLabels"
          class="w-60%!"
          multiple
          clearable
          collapse-tags
          collapse-tags-tooltip
          :max-collapse-tags="3"
        >
          <el-option
            v-for="item in repairStore.labelCodeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-tab-pane>
      <el-tab-pane label="新增编号" name="create">
        <span>请输入打印数量：</span>
        <el-input-number v-model="num" :min="1" :max="99" />
      </el-tab-pane>
    </el-tabs>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="onConfirm" v-loading="confirmLoading">确认</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useRepairStoreWithOut } from '@/store/modules/repair'
import { DEVICE_QR_HREF } from '@/utils/constants'
import { printBatchLabels, type LabelItem } from '@/api/repair'

defineOptions({
  name: 'LabelCodeDialog'
})

const repairStore = useRepairStoreWithOut()
const message = useMessage()

const activeTab = ref('useable') // create-新增、useable-当前可用

const visible = ref(false)
const open = async (id: number, name: string) => {
  reset()
  labelId.value = id
  labelName.value = name
  repairStore.fetchLabelCodeAll()
  visible.value = true
}
defineExpose({ open })

const labelId = ref<number>()
const labelName = ref<string>('')
const selectLabels = ref<string[]>([])
const num = ref<number | undefined>(undefined)
const reset = () => {
  num.value = undefined
  activeTab.value = 'useable'
  selectLabels.value = []
  labelId.value = undefined
  labelName.value = ''
}

const emit = defineEmits<{
  confirm: [(string | LabelItem)[]]
}>()
const confirmLoading = ref(false)
const onConfirm = async () => {
  switch (activeTab.value) {
    case 'useable':
      if (!selectLabels.value?.length) return message.alertWarning('请选择编号')
      emit(
        'confirm',
        selectLabels.value.map((l) => ({
          name: labelName.value,
          labelCode: l,
          qr: DEVICE_QR_HREF + l
        }))
      )
      visible.value = false
      break
    case 'create':
      {
        if (!num.value) return message.alertWarning('请输入打印数量')
        try {
          confirmLoading.value = true
          const res = await printBatchLabels({ id: labelId.value!, num: num.value })
          if (Array.isArray(res) && res.length) {
            emit(
              'confirm',
              res.map((l) => ({ ...l, qr: DEVICE_QR_HREF + l.labelCode }))
            )
            visible.value = false
          } else {
            message.warning('没有可打印的标签')
          }
        } finally {
          confirmLoading.value = false
        }
      }
      break
    default:
      break
  }
}
</script>
