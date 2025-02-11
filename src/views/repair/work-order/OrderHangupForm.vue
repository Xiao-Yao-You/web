<template>
  <Dialog title="工单挂起" v-model="dialogVisible" :fullscreen="false" :draggable="false">
    <el-form ref="formRef" :model="formData" :rules="formRules">
      <el-form-item label="挂起说明" prop="remark">
        <el-input
          v-model="formData.remark"
          placeholder="请输入挂起说明"
          type="textarea"
          show-word-limit
          maxlength="500"
        />
      </el-form-item>
      <el-form-item label="挂起照片" prop="picture">
        <BatchPicturesUploader
          v-model:fileList="formData.picture"
          :limit-size="{ size: 5, unit: 'MB' }"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="onConfirm" type="primary" :loading="loading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { BatchPicturesUploader } from '@/components/BatchPicturesUploader'
import { OperateMethod } from '@/api/repair/constant'
import { handleRepairOrder } from '@/api/repair'
import type { UploadUserFile, FormInstance } from 'element-plus'

defineOptions({
  name: 'OrderHangupForm'
})

const message = useMessage()

const dialogVisible = ref(false)
const formRef = ref<FormInstance>()
const formData = ref({
  id: undefined as unknown as number,
  remark: '',
  picture: [] as UploadUserFile[]
})
const formRules = reactive({
  remark: [{ required: true, message: '转交说明不能为空', trigger: 'blur' }],
  picture: [{ required: true, message: '请上传挂起照片', trigger: 'blur' }]
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
    remark: '',
    picture: [] as UploadUserFile[]
  }
}

const onCancel = () => {
  dialogVisible.value = false
  resetForm()
}

const emit = defineEmits(['success'])
const loading = ref(false)
const onConfirm = async () => {
  await formRef.value?.validate()
  const { picture, ...rest } = formData.value
  const data = {
    ...rest,
    operateMethod: OperateMethod.HangUp,
    picture: picture
      .map((p) => p.url)
      .filter((url) => url)
      .join(';')
  }
  loading.value = true
  try {
    await handleRepairOrder(data)
    message.success('挂起成功')
    emit('success')
    onCancel()
  } finally {
    loading.value = false
  }
}
</script>
