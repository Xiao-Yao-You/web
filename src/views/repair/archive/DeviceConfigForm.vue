<script setup lang="ts">
import type { AccessoryItem } from '@/api/repair'

defineOptions({
  name: 'DeviceConfigForm'
})

const emit = defineEmits<{
  confirm: [form: AccessoryItem]
}>()

const dialogVisible = ref(false)
const formRef = ref()
const formData = ref({
  accessoryDesc: '', // 配件描述
  model: '', // 型号
  num: 1, // 数量
  remark: '' // 备注
})
const formRules = reactive({
  accessoryDesc: [{ required: true, message: '配件不能为空', trigger: 'blur' }],
  model: [{ required: true, message: '型号不能为空', trigger: 'blur' }]
})

const open = () => {
  dialogVisible.value = true
}
defineExpose({ open })

const resetForm = () => {
  formData.value = {
    accessoryDesc: '',
    model: '',
    num: 1,
    remark: ''
  }
}

const onCancel = () => {
  dialogVisible.value = false
  resetForm()
}

const onConfirm = async () => {
  await formRef.value.validate()
  emit('confirm', formData.value)
  onCancel()
}
</script>

<template>
  <Dialog title="添加设备配置" v-model="dialogVisible" :fullscreen="false" :draggable="false">
    <el-form ref="formRef" :model="formData" :rules="formRules">
      <el-form-item label="配件" prop="accessoryDesc">
        <el-input v-model="formData.accessoryDesc" placeholder="请输入配件信息" />
      </el-form-item>
      <el-form-item label="型号" prop="model">
        <el-input v-model="formData.model" placeholder="请输入型号" />
      </el-form-item>
      <el-form-item label="数量" prop="num">
        <el-input-number v-model="formData.num" :min="1" :max="99" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onConfirm" type="primary">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<style scoped></style>
