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
      <el-form-item label="处理结果" prop="operateType">
        <el-select v-model="formData.operateType" placeholder="请选择处理结果" class="!w-180px">
          <el-option
            v-for="dict in resultOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
import { useEmployeeStoreWithOut } from '@/store/modules/employee'
import { handleRepairOrder, type AccessoryItem } from '@/api/repair'
import { OperateMethod, OperateStatus } from '@/api/repair/constant'
import { useUserStore } from '@/store/modules/user'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

defineOptions({
  name: 'OrderCompleteForm'
})

const userInfo = useUserStore().getUser
const employeeStore = useEmployeeStoreWithOut()
const message = useMessage()

const emit = defineEmits<{
  confirm: [form: AccessoryItem]
}>()

// 处理结果
const resultOptions = getIntDictOptions(DICT_TYPE.REPAIR_ORDER_COMPLETE_TYPE)
const defaultType = resultOptions[0]?.value

const isCompleted = ref(false)
const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()
const formData = ref({
  id: undefined as unknown as number,
  code: undefined as unknown as string,
  operateUser: userInfo,
  operateType: defaultType,
  endTime: formatDate(new Date()),
  remark: ''
})
const formRules = reactive({
  operateType: [{ required: true, message: '处理结果不能为空', trigger: 'blur' }],
  remark: [{ required: true, message: '处理说明不能为空', trigger: 'blur' }]
})

const open = (payload: { id: number; code: string; status: OperateStatus }) => {
  resetForm()
  formData.value.id = payload.id
  formData.value.code = payload.code
  dialogVisible.value = true
  // prettier-ignore
  isCompleted.value = [
  OperateStatus.Finish,
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
    operateType: defaultType,
    endTime: formatDate(new Date()),
    remark: ''
  }
}

const onConfirm = async () => {
  await formRef.value.validate()
  const { operateUser, operateType, ...rest } = formData.value
  const data = {
    ...rest,
    operateUserId: operateUser.id,
    operateUserNickName: operateUser.nickname,
    operateMethod: OperateMethod.Finish
  }
  loading.value = true
  try {
    await handleRepairOrder(data)
    message.success('工单已完成，等待发起人确认')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  employeeStore.fetchInfoEmployees()
})
</script>
