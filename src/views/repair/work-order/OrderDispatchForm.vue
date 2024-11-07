<template>
  <Dialog title="工单指派" v-model="dialogVisible" :fullscreen="false" :draggable="false">
    <el-form ref="formRef" :model="formData" :rules="formRules" v-loading="loading">
      <el-form-item label="工单编号" prop="code">
        <el-input v-model="formData.code" disabled />
      </el-form-item>
      <el-form-item label="指派对象" prop="repairer">
        <el-select
          v-model="formData.repairer"
          placeholder="请选择指派对象"
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
      <el-button @click="onConfirm" type="primary">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useEmployeeStoreWithOut } from '@/store/modules/employee'
import { handleRepairOrder, type AccessoryItem } from '@/api/repair'
import { OperateMethod } from '@/api/repair/constant'
import { type UserVO } from '@/api/system/user'

defineOptions({
  name: 'OrderDispatchForm'
})

const employeeStore = useEmployeeStoreWithOut()
const message = useMessage()

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()
const formData = ref({
  id: undefined as unknown as number,
  code: undefined as unknown as string,
  repairer: undefined as unknown as UserVO,
  remark: ''
})
const formRules = reactive({
  user: [{ required: true, message: '指派对象不能为空', trigger: 'blur' }]
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
    repairer: undefined as unknown as UserVO,
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
    userId: repairer.id,
    userNickName: repairer.nickname,
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
</script>
