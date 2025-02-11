<template>
  <Dialog title="工单转交" v-model="dialogVisible" :fullscreen="false" :draggable="false">
    <el-form ref="formRef" :model="formData" :rules="formRules" v-loading="loading">
      <el-form-item label="工单编号" prop="code">
        <el-input v-model="formData.code" disabled />
      </el-form-item>
      <el-form-item label="问题类型" prop="questionType">
        <el-tree-select
          v-model="formData.questionType"
          :data="repairStore.issuesTree"
          :props="defaultProps"
          check-strictly
          node-key="id"
          placeholder="请选择问题类型"
        />
      </el-form-item>
      <el-form-item label="转交对象" prop="user">
        <el-select
          v-model="formData.user"
          placeholder="请选择转交对象"
          filterable
          value-key="id"
          clearable
        >
          <el-option
            v-for="item in employeeStore.infoEmployees"
            :key="item.id"
            :label="item.nickname"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="转交说明" prop="remark">
        <el-input
          v-model="formData.remark"
          placeholder="请输入说明"
          type="textarea"
          show-word-limit
          maxlength="500"
        />
      </el-form-item>
      <el-form-item label="转交照片" prop="picture">
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
import { useRepairStoreWithOut } from '@/store/modules/repair'
import { useEmployeeStoreWithOut } from '@/store/modules/employee'
import { handleRepairOrder } from '@/api/repair'
import { OperateMethod } from '@/api/repair/constant'
import { defaultProps } from '@/utils/tree'
import { BatchPicturesUploader } from '@/components/BatchPicturesUploader'
import { type UserVO } from '@/api/system/user'
import type { UploadUserFile } from 'element-plus'

defineOptions({
  name: 'OrderTransferForm'
})

const employeeStore = useEmployeeStoreWithOut()
const repairStore = useRepairStoreWithOut()
const message = useMessage()

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()
const formData = ref({
  id: undefined as unknown as number,
  code: undefined as unknown as string,
  questionType: undefined as unknown as number,
  user: undefined as unknown as UserVO,
  remark: '',
  picture: [] as UploadUserFile[]
})
const formRules = reactive({
  questionType: [{ required: true, message: '问题类型不能为空', trigger: 'blur' }],
  user: [{ required: true, message: '转交对象不能为空', trigger: 'blur' }],
  remark: [{ required: true, message: '转交说明不能为空', trigger: 'blur' }]
})

const open = (payload: { id: number; code: string; questionType: number }) => {
  resetForm()
  Object.assign(formData.value, {
    id: payload.id,
    code: payload.code,
    questionType: payload.questionType
  })
  dialogVisible.value = true
}
defineExpose({ open })

const resetForm = () => {
  formData.value = {
    id: undefined as unknown as number,
    code: undefined as unknown as string,
    questionType: undefined as unknown as number,
    user: undefined as unknown as UserVO,
    remark: '',
    picture: [] as UploadUserFile[]
  }
}

const onCancel = () => {
  dialogVisible.value = false
  resetForm()
}

const emit = defineEmits(['success'])
const onConfirm = async () => {
  await formRef.value.validate()
  const { user, picture, ...rest } = formData.value
  const data = {
    ...rest,
    userId: user.id,
    userNickName: user.nickname,
    operateMethod: OperateMethod.Transfer,
    picture: picture
      .map((p) => p.url)
      .filter((url) => url)
      .join(';')
  }
  loading.value = true
  try {
    await handleRepairOrder(data)
    message.success('转交成功')
    emit('success')
    onCancel()
  } finally {
    loading.value = false
  }
}
</script>
