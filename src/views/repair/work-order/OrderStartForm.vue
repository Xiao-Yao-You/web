<template>
  <Dialog title="现场确认" v-model="dialogVisible" :fullscreen="false" :draggable="false">
    <el-form ref="formRef" :model="formData" :rules="formRules" v-loading="loading">
      <el-form-item label="现场照片" prop="url">
        <BatchPicturesUploader v-model:fileList="formData.url" />
      </el-form-item>
      <el-form-item label="情况说明" prop="remark">
        <el-input
          v-model="formData.remark"
          placeholder="请输入说明"
          type="textarea"
          show-word-limit
          maxlength="500"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onConfirm" type="primary">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { handleRepairOrder, type AccessoryItem } from '@/api/repair'
import { OperateMethod } from '@/api/repair/constant'
import { PictureType } from '@/api/repair/constant'
import type { UploadFiles } from 'element-plus'

defineOptions({
  name: 'OrderTransferForm'
})

const message = useMessage()

const emit = defineEmits<{
  confirm: [form: AccessoryItem]
}>()

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()
const formData = ref({
  id: undefined as unknown as number,
  url: undefined as unknown as UploadFiles,
  remark: ''
})
const formRules = reactive({
  url: [{ required: true, message: '问题类型不能为空', trigger: 'blur' }],
  remark: [{ required: true, message: '转交说明不能为空', trigger: 'blur' }]
})

const open = (id: number) => {
  resetForm()
  formData.value.id = id
  dialogVisible.value = true
}
defineExpose({ open })

const resetForm = () => {
  formData.value = {
    id: undefined as unknown as number,
    url: undefined as unknown as UploadFiles,
    remark: ''
  }
}

const onCancel = () => {
  dialogVisible.value = false
  resetForm()
}

const onConfirm = async () => {
  await formRef.value.validate()
  const { url, ...rest } = formData.value
  const data = {
    ...rest,
    url: url.map((p) => ({
      name: p.name,
      url: p.url!,
      type: PictureType.Scene
    })),
    operateMethod: OperateMethod.Confirm
  }
  loading.value = true
  try {
    await handleRepairOrder(data)
    message.success('现场确认成功')
    onCancel()
  } finally {
    loading.value = false
  }
}
</script>
