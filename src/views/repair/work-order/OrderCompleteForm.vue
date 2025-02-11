<template>
  <Dialog title="工单完成" v-model="dialogVisible" :fullscreen="false" :draggable="false">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      v-loading="loading"
      label-width="80px"
      :disabled="isCompleted"
    >
      <el-form-item label="工单编号" prop="code">
        <el-input v-model="formData.code" disabled />
      </el-form-item>
      <el-form-item label="处理人" prop="operateUser">
        <el-input v-model="formData.operateUser.nickname" disabled />
      </el-form-item>
      <el-form-item label="处理结果" prop="completeResult">
        <el-select v-model="formData.completeResult" placeholder="请选择处理结果" class="!w-180px">
          <el-option
            v-for="dict in resultOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="完成照片" prop="picture">
        <BatchPicturesUploader
          v-model:fileList="formData.picture"
          :limit-size="{ size: 5, unit: 'MB' }"
        />
      </el-form-item>
      <el-form-item label="完成时间" prop="endTime">
        <el-input v-model="formData.endTime" disabled :prefix-icon="Calendar" class="!w-180px" />
      </el-form-item>
      <el-form-item label="处理说明" prop="remark">
        <el-input
          v-model="formData.remark"
          placeholder="请输入说明"
          type="textarea"
          :rows="2"
          show-word-limit
          maxlength="200"
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
import { Calendar } from '@element-plus/icons-vue'
import { BatchPicturesUploader } from '@/components/BatchPicturesUploader'
import { handleRepairOrder } from '@/api/repair'
import { OperateMethod, OperateStatus } from '@/api/repair/constant'
import { useUserStore } from '@/store/modules/user'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import type { UploadUserFile, FormInstance } from 'element-plus'

defineOptions({
  name: 'OrderCompleteForm'
})

const userInfo = useUserStore().getUser
const message = useMessage()

// 处理结果
const resultOptions = getIntDictOptions(DICT_TYPE.REPAIR_ORDER_COMPLETE_TYPE)
const defaultType = resultOptions[0]?.value

const isCompleted = ref(false)
const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()
const formData = ref({
  id: undefined as unknown as number,
  code: undefined as unknown as string,
  operateUser: userInfo,
  completeResult: defaultType,
  endTime: formatDate(new Date()),
  remark: '',
  picture: [] as UploadUserFile[]
})
const formRules = reactive({
  completeResult: [{ required: true, message: '处理结果不能为空', trigger: 'blur' }],
  remark: [{ required: true, message: '处理说明不能为空', trigger: 'blur' }],
  picture: [{ required: true, message: '请上传完成照片', trigger: 'blur' }]
})

const open = (payload: { id: number; code: string; status: OperateStatus }) => {
  resetForm()
  formData.value.id = payload.id
  formData.value.code = payload.code
  dialogVisible.value = true
  // prettier-ignore
  isCompleted.value = [
    OperateStatus.Finish,
    OperateStatus.Done,
    OperateStatus.NoHandle,
    OperateStatus.UnableFix,
    OperateStatus.Revoke,
  ].includes(payload.status)
}
defineExpose({ open })

const resetForm = () => {
  formData.value = {
    id: undefined as unknown as number,
    code: undefined as unknown as string,
    operateUser: userInfo,
    completeResult: defaultType,
    endTime: formatDate(new Date()),
    remark: '',
    picture: [] as UploadUserFile[]
  }
}

const emit = defineEmits(['success'])
const onConfirm = async () => {
  await formRef.value?.validate()
  const { operateUser, picture, ...rest } = formData.value
  const data = {
    ...rest,
    operateUserId: operateUser.id,
    operateUserNickName: operateUser.nickname,
    operateMethod: OperateMethod.Finish,
    picture: picture
      .map((p) => p.url)
      .filter((url) => url)
      .join(';')
  }
  loading.value = true
  try {
    await handleRepairOrder(data)
    message.success('工单已完成') /* 待报修人确认 */
    dialogVisible.value = false
    emit('success')
  } finally {
    loading.value = false
  }
}
</script>
