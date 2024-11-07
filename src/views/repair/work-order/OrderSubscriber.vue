vue
<template>
  <Dialog title="设置工单推送对象" v-model="visible" :close-on-click-modal="false">
    <span>人员选择名单：</span>
    <el-select
      v-model="subscribers"
      class="w-60%!"
      multiple
      clearable
      collapse-tags
      collapse-tags-tooltip
      :max-collapse-tags="4"
      value-key="value"
    >
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item" />
    </el-select>
    <template #footer>
      <el-button @click="submitForm" type="primary">确定</el-button>
      <el-button @click="visible = false">取消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { useEmployeeStoreWithOut } from '@/store/modules/employee'
import { getOrderSubscriber, setOrderSubscriber } from '@/api/repair'

defineOptions({ name: 'OrderSubscriber' })

const message = useMessage()
const employeeStore = useEmployeeStoreWithOut()

const subscribers = ref<OptionItem<number>[]>([])
const options = computed(() => {
  return employeeStore.infoEmployees.map((item) => ({ value: item.id, label: item.nickname }))
})

const visible = ref(false)
const open = async () => {
  subscribers.value = []
  visible.value = true
  const data = await getOrderSubscriber()
  subscribers.value = data.map((item) => ({ value: item.id, label: item.nickname }))
}
defineExpose({ open })

const loading = ref(false)
const submitForm = async () => {
  loading.value = true
  try {
    await setOrderSubscriber({ userId: subscribers.value.map((s) => s.value) })
    message.success('推送对象设置成功')
    visible.value = false
  } finally {
    loading.value = false
  }
}
</script>
