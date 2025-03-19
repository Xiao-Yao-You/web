<template>
  <Dialog title="工单转交" v-model="dialogVisible" :fullscreen="false" :draggable="false">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      v-loading="loading"
      label-width="80"
    >
      <el-form-item label="工单编号" prop="code">
        <el-input v-model="formData.code" disabled />
      </el-form-item>
      <el-form-item label="问题类型" prop="questionType">
        <el-cascader
          v-model="formData.questionType"
          filterable
          clearable
          :props="{ label: 'name', value: 'id', emitPath: false }"
          :options="repairStore.issuesTree"
          placeholder="请选择问题类型"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="请求类型" prop="requestType">
        <el-select
          v-model="formData.requestType"
          placeholder="请选择请求类型"
          @change="onRequestTypeChange"
        >
          <el-option
            v-for="dict in groupStore.groupOptions"
            :key="dict.value as string"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="转交对象" prop="user">
        <el-select
          v-model="formData.user"
          :disabled="memberDisabled"
          :placeholder="placeholder"
          filterable
          value-key="value"
          clearable
        >
          <el-option v-for="m in memberOptions" :key="m.value" :label="m.label" :value="m" />
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
import { useDebounceFn } from '@vueuse/core'
import { useRepairStoreWithOut } from '@/store/modules/repair'
import { handleRepairOrder, getMemberGroupByGroupId } from '@/api/repair'
import { OperateMethod } from '@/api/repair/constant'
import { BatchPicturesUploader } from '@/components/BatchPicturesUploader'
import { useGroupStoreWithOut } from '@/store/modules/group'
import type { UploadUserFile, CascaderValue } from 'element-plus'

defineOptions({
  name: 'OrderTransferForm'
})

const message = useMessage()
const repairStore = useRepairStoreWithOut()
const groupStore = useGroupStoreWithOut()

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()
const formData = ref({
  id: undefined as unknown as number,
  code: undefined as unknown as string,
  requestType: undefined as unknown as string,
  questionType: undefined as unknown as CascaderValue,
  user: undefined as unknown as OptionItem,
  remark: '',
  picture: [] as UploadUserFile[]
})
const formRules = reactive({
  requestType: [{ required: true, message: '请求类型不能为空', trigger: ['blur', 'change'] }],
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
    requestType: undefined as unknown as string,
    questionType: undefined as unknown as CascaderValue,
    user: undefined as unknown as OptionItem,
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
    userId: user.value as number,
    userNickName: user.label,
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

//#region 根据请求类型获取指派对象
const memberOptions = ref<OptionItem[]>([])
const memberLoading = ref(false)
const memberDisabled = computed(() => {
  return memberLoading.value || !formData.value.requestType
})
const placeholder = computed(() => {
  if (!formData.value.requestType) {
    return '先选择请求类型，再选择指派对象'
  } else if (memberLoading.value) {
    return '加载中...'
  } else {
    return '请选择指派对象'
  }
})

// 切换请求类型
const onRequestTypeChange = (requestType: string) => {
  memberLoading.value = true
  memberOptions.value = []
  getMemberOptions(requestType)
}

// 根据请求类型获取指派对象
const getMemberOptions = useDebounceFn(async (groupId: string) => {
  try {
    const members = await getMemberGroupByGroupId(groupId)
    memberOptions.value = members.map((m) => ({
      value: m.id,
      label: m.nickname
    }))
    formData.value.user = undefined as unknown as OptionItem
  } finally {
    memberLoading.value = false
  }
}, 800)
//#endregion
</script>
