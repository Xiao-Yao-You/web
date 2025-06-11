<template>
  <Dialog title="工单指派" v-model="dialogVisible" :fullscreen="false" :draggable="false">
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
      <el-form-item label="请求类型" prop="requestType">
        <el-select
          v-model="formData.requestType"
          placeholder="请选择请求类型"
          class="!w-150px"
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
      <el-form-item label="指派对象" prop="repairer">
        <el-select
          v-model="formData.repairer"
          :disabled="memberDisabled"
          :placeholder="placeholder"
          filterable
          value-key="value"
          clearable
        >
          <el-option v-for="m in memberOptions" :key="m.value" :label="m.label" :value="m" />
        </el-select>
      </el-form-item>
      <el-form-item label="指派说明" prop="remark">
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
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button @click="onConfirm" type="primary">确 定</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { handleRepairOrder, getMemberGroupByGroupId } from '@/api/repair'
import { OperateMethod } from '@/api/repair/constant'
import { useGroupStoreWithOut } from '@/store/modules/group'

defineOptions({
  name: 'OrderDispatchForm'
})

const message = useMessage()
const groupStore = useGroupStoreWithOut()

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()
const formData = ref({
  id: undefined as unknown as number,
  code: undefined as unknown as string,
  repairer: undefined as unknown as OptionItem,
  requestType: undefined as unknown as string,
  remark: ''
})
const formRules = reactive({
  requestType: [{ required: true, message: '请求类型不能为空', trigger: 'blur' }],
  repairer: [{ required: true, message: '指派对象不能为空', trigger: ['blur', 'change'] }]
})

const open = (payload: { id: number; code: string }) => {
  resetForm()
  formData.value.id = payload.id
  formData.value.code = payload.code
  dialogVisible.value = true
}
defineExpose({ open })

const resetForm = () => {
  formData.value = {
    id: undefined as unknown as number,
    code: undefined as unknown as string,
    repairer: undefined as unknown as OptionItem,
    requestType: undefined as unknown as string,
    remark: ''
  }
}

const onCancel = () => {
  dialogVisible.value = false
  resetForm()
}

const emit = defineEmits(['success'])
const onConfirm = async () => {
  await formRef.value.validate()
  const { repairer, ...rest } = formData.value
  const data = {
    ...rest,
    userId: repairer.value as number,
    userNickName: repairer.label,
    operateMethod: OperateMethod.Dispatch
  }
  loading.value = true
  try {
    await handleRepairOrder(data)
    message.success('派单成功')
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
    formData.value.repairer = undefined as unknown as OptionItem
  } finally {
    memberLoading.value = false
  }
}, 800)
//#endregion
</script>
