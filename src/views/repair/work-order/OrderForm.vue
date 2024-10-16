<template>
  <Dialog
    :title="dialogTitle"
    v-model="dialogVisible"
    scroll
    maxHeight="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
      :disabled="formType === 'detail'"
    >
      <el-form-item label="工单编号" prop="code">
        <el-input v-model="formData.code" placeholder="自动生成" disabled />
      </el-form-item>
      <el-form-item label="工单标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入标题"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="二维码标签号" prop="labelCode" ref="labelRef">
        <el-input
          v-model="formData.labelCode"
          placeholder="请输入二维码标签号"
          maxlength="20"
          show-word-limit
          clearable
          @change="onLabelChange"
        />
      </el-form-item>
      <el-form-item label="设备名称" prop="deviceName">
        <el-input
          v-model="formData.deviceName"
          :placeholder="disabled ? '正在查询二维码信息' : '请输入设备名'"
          maxlength="20"
          show-word-limit
          :disabled="disabled"
        />
      </el-form-item>
      <el-form-item label="设备所在地点" prop="addressId">
        <el-tree-select
          v-model="formData.addressId"
          :data="repairStore.locationsTree"
          :props="{
            label: 'addressName',
            value: 'id'
          }"
          check-strictly
          node-key="id"
          placeholder="请选择设备所在地点"
          disabled
        />
      </el-form-item>
      <el-form-item label="设备具体位置" prop="location">
        <el-input
          v-model="formData.location"
          placeholder="请输入设备具体位置"
          maxlength="20"
          show-word-limit
          disabled
        />
      </el-form-item>
      <el-form-item label="报修人" prop="submitUserId">
        <el-select
          v-model="formData.submitUserId"
          filterable
          remote
          :remote-method="searchRemoteUser"
          :loading="userLoading"
          placeholder="输入姓名搜索"
        >
          <el-option
            v-for="item in userList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="报修人电话" prop="submitUserMobile">
        <el-input
          v-model="formData.submitUserMobile"
          placeholder="请输入报修人电话"
          maxlength="11"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="请求类型" prop="requestType">
        <el-select v-model="formData.requestType" placeholder="请求类型">
          <el-option
            v-for="item in IssueTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
      <el-form-item label="紧急程度" prop="level">
        <el-select v-model="formData.level" placeholder="请选紧急程度" clearable class="!w-140px">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.LEVEL)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="问题描述" prop="description">
        <el-input
          v-model="formData.description"
          placeholder="请输入问题描述"
          type="textarea"
          :rows="4"
          show-word-limit
          maxlength="500"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { useRepairStoreWithOut } from '@/store/modules/repair'
import { IssueTypeOptions, IssueTypeEnum, OperateMethod } from '@/api/repair/constant'
import { defaultProps } from '@/utils/tree'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { getAll } from '@/api/system/user'
import { createRepairOrder, getRepairOrder, getArchiveByLabelCode } from '@/api/repair'
import { isMobilePhone } from '@/utils/is'
import { CommonLevelEnum } from '@/utils/constants'
import type { ElFormItem, FormInstance } from 'element-plus'

defineOptions({
  name: 'OrderForm'
})

const { t } = useI18n()
const message = useMessage()
const repairStore = useRepairStoreWithOut()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const formLoading = ref(false)
const formType = ref('') // create、detail
const formData = ref({
  id: undefined,
  code: '',
  title: '',
  labelCode: '',
  deviceName: '',
  deviceId: undefined as unknown as number,
  addressId: undefined as unknown as number,
  location: undefined as unknown as string,
  submitUserId: undefined as unknown as number,
  submitUserMobile: undefined as unknown as string,
  requestType: undefined as unknown as IssueTypeEnum,
  questionType: undefined as unknown as number,
  level: undefined as unknown as CommonLevelEnum,
  description: ''
})
const formRules = reactive({
  title: [{ required: true, message: '工单标题不能为空', trigger: 'blur' }],
  labelCode: [{ required: true, message: '二维码标签不能为空', trigger: 'blur' }],
  deviceName: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
  addressId: [{ required: true, message: '设备地点不能为空', trigger: 'blur' }],
  location: [{ required: true, message: '设备位置不能为空', trigger: 'blur' }],
  submitUserId: [{ required: true, message: '报修人不能为空', trigger: 'blur' }],
  submitUserMobile: [
    { required: true, message: '报修人电话不能为空', trigger: 'blur' },
    { pattern: isMobilePhone, message: '电话格式不正确', trigger: 'blur' }
  ],
  requestType: [{ required: true, message: '请求类型不能为空', trigger: 'blur' }],
  questionType: [{ required: true, message: '问题类型不能为空', trigger: 'blur' }],
  level: [{ required: true, message: '紧急程度不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '问题描述不能为空', trigger: 'blur' }]
})

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type) + '运维工单'
  formType.value = type
  resetForm()
  if (id) {
    formLoading.value = true
    try {
      const { level, questionType, ...rest } = await getRepairOrder(id)
      Object.assign(formData.value, {
        ...rest,
        level: Number(level),
        questionType: Number(questionType)
      })
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

/** 根据二维码标签号自动获取其设备名称 */
const labelRef = ref<InstanceType<typeof ElFormItem>>()
const disabled = ref(false)
const onLabelChange = async (value: string) => {
  formData.value.deviceName = ''
  formData.value.deviceId = undefined as unknown as number
  labelRef.value?.clearValidate()

  if (value) {
    disabled.value = true
    try {
      const info = await getArchiveByLabelCode(value)
      if (!info) throw new Error('not found')
      Object.assign(formData.value, {
        deviceName: info.name,
        deviceId: info.id,
        addressId: info.addressId,
        location: info.location
      })
      formRef.value?.validateField('deviceName')
    } catch (e) {
      disabled.value = false
      labelRef.value!.validateMessage = '当前二维码不存在'
      labelRef.value!.validateState = 'error'
    }
  } else {
    disabled.value = false
  }
}

/** 远程搜索人员 */
const userLoading = ref(false)
const userList = ref<OptionItem<number>[]>([])
const searchRemoteUser = async (query: string) => {
  if (query) {
    userLoading.value = true
    try {
      const data = await getAll(query)
      userList.value = data.map((user) => ({
        value: user.id,
        label: `${user.nickname} — ${user.username}`
      }))
    } finally {
      userLoading.value = false
    }
  }
}

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value?.validate()
  const { code, ...data } = formData.value
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await createRepairOrder({
        ...data,
        operateMethod: OperateMethod.Create
      })
      message.success(t('common.createSuccess'))
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
    code: '',
    title: '',
    labelCode: '',
    deviceName: '',
    deviceId: undefined as unknown as number,
    addressId: undefined as unknown as number,
    location: undefined as unknown as string,
    submitUserId: undefined as unknown as number,
    submitUserMobile: undefined as unknown as string,
    requestType: undefined as unknown as IssueTypeEnum,
    questionType: undefined as unknown as number,
    level: undefined as unknown as CommonLevelEnum,
    description: ''
  }
  formRef.value?.resetFields()
}
</script>
