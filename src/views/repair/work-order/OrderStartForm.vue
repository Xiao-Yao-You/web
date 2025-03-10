<template>
  <Dialog title="现场确认" v-model="dialogVisible" :fullscreen="false" :draggable="false">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      v-loading="loading"
      label-width="110px"
    >
      <el-form-item label="现场照片" prop="picture">
        <BatchPicturesUploader
          v-model:fileList="formData.picture"
          :limit-size="{ size: 5, unit: 'MB' }"
        />
      </el-form-item>
      <el-form-item label="紧急程度" prop="level">
        <el-select v-model="formData.level" placeholder="请选择紧急程度" clearable class="!w-200px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.LEVEL)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="二维码标签号" prop="labelCode" ref="labelRef">
        <el-input
          v-model="formData.labelCode"
          placeholder="请输入二维码标签号"
          maxlength="20"
          clearable
          class="!w-200px"
        />
      </el-form-item>
      <el-form-item label="请求类型">
        <el-input disabled :model-value="requestTypeLabel" class="!w-200px" />
      </el-form-item>
      <el-form-item label="问题类型" prop="questionType">
        <el-cascader
          v-model="formData.questionType"
          :props="{ label: 'name', value: 'id' }"
          :options="repairStore.issuesTree"
          placeholder="请选择问题类型"
        />
      </el-form-item>
      <el-form-item label="确认说明" prop="remark">
        <el-input
          v-model="formData.remark"
          placeholder="确认说明"
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
import { handleRepairOrder, type RepairOrder } from '@/api/repair'
import { RequsetTypeEnum, OperateMethod, getRequestTypeLabel } from '@/api/repair/constant'
import { CommonLevelEnum } from '@/utils/constants'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { useRepairStoreWithOut } from '@/store/modules/repair'
import { BatchPicturesUploader } from '@/components/BatchPicturesUploader'
import type { UploadUserFile } from 'element-plus'

defineOptions({
  name: 'OrderTransferForm'
})

const message = useMessage()
const repairStore = useRepairStoreWithOut()

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()
const formData = ref({
  id: undefined as unknown as number,
  picture: [] as UploadUserFile[],
  remark: '',
  questionType: [] as number[],
  level: undefined as unknown as CommonLevelEnum,
  labelCode: undefined as undefined | string
})
const formRules = reactive({
  picture: [{ required: true, message: '现场图片不能为空', trigger: ['blur', 'change'] }],
  remark: [{ required: true, message: '确认说明不能为空', trigger: 'blur' }],
  questionType: [{ type: 'array', required: true, message: '问题类型不能为空', trigger: 'blur' }],
  level: [{ required: true, message: '紧急程度不能为空', trigger: 'blur' }]
})

const requestType = ref(undefined as unknown as RequsetTypeEnum)
const requestTypeLabel = computed(() => getRequestTypeLabel(requestType.value))

const open = (row: RepairOrder) => {
  requestType.value = row.requestType
  resetForm()
  formData.value.id = row.id
  formData.value.labelCode = row.labelCode
  dialogVisible.value = true
}
defineExpose({ open })

const resetForm = () => {
  formData.value = {
    id: undefined as unknown as number,
    picture: [] as UploadUserFile[],
    remark: '',
    questionType: [],
    level: undefined as unknown as CommonLevelEnum,
    labelCode: undefined as undefined | string
  }
}

const onCancel = () => {
  dialogVisible.value = false
  resetForm()
}

const emit = defineEmits(['success'])
const onConfirm = async () => {
  await formRef.value.validate()
  const { picture, questionType, ...rest } = formData.value
  const data = {
    ...rest,
    questionType: questionType[questionType.length - 1],
    picture: picture
      .map((p) => p.url)
      .filter((url) => url)
      .join(';'),
    operateMethod: OperateMethod.Confirm
  }
  loading.value = true
  try {
    await handleRepairOrder(data)
    message.success('现场确认成功')
    emit('success')
    onCancel()
  } finally {
    loading.value = false
  }
}
</script>
