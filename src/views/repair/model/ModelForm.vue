<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      v-loading="formLoading"
    >
      <el-form-item label="设备型号" prop="model">
        <el-input
          v-model="formData.model"
          placeholder="请输入设备型号"
          show-word-limit
          maxlength="50"
        />
      </el-form-item>
      <el-form-item label="设备类型" prop="deviceTypeId">
        <el-select v-model="formData.deviceTypeId" placeholder="请选择设备类型" clearable>
          <el-option
            v-for="item in repairStore.deviceOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="启用状态" prop="status">
        <el-switch
          v-model="formData.status"
          :active-value="CommonStatusEnum.ENABLE"
          :inactive-value="CommonStatusEnum.DISABLE"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { CommonStatusEnum } from '@/utils/constants'
import { getModel, createModel, updateModel, RepairModel } from '@/api/repair'
import { useRepairStoreWithOut } from '@/store/modules/repair'

/** 设备型号 表单 */
defineOptions({ name: 'RepairModelForm' })

const { t } = useI18n()
const message = useMessage()
const repairStore = useRepairStoreWithOut()

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false)
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  model: undefined,
  status: CommonStatusEnum.ENABLE,
  remark: undefined,
  deviceTypeId: undefined
})
const formRules = reactive({
  model: [{ required: true, message: '设备型号不能为空', trigger: 'blur' }],
  deviceTypeId: [{ required: true, message: '设备类型不能为空', trigger: 'blur' }]
})
const formRef = ref()

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type) + '设备型号'
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await getModel(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  try {
    const data = formData.value as unknown as RepairModel
    if (formType.value === 'create') {
      await createModel(data)
      message.success(t('common.createSuccess'))
    } else {
      await updateModel(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    model: undefined,
    status: CommonStatusEnum.ENABLE,
    remark: undefined,
    deviceTypeId: undefined
  }
  formRef.value?.resetFields()
}

onMounted(() => {
  repairStore.fetchDevicesAll()
})
</script>
