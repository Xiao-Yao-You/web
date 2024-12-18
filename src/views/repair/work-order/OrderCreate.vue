<template>
  <Dialog
    :title="dialogTitle"
    v-model="dialogVisible"
    scroll
    maxHeight="500px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-radio-group v-model="radio" class="mb-18px ml-120px" @change="onRadioChange">
      <el-radio :value="RepairType.QR" border>二维码设备标签号报修</el-radio>
      <el-radio :value="RepairType.WithoutQR" border>软件、监控等其他报修</el-radio>
    </el-radio-group>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
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
      <el-form-item
        v-if="radio === RepairType.QR"
        label="二维码标签号"
        prop="labelCode"
        ref="labelRef"
      >
        <el-input
          v-model="formData.labelCode"
          placeholder="请输入二维码标签号"
          maxlength="20"
          show-word-limit
          clearable
          @change="onLabelChange"
        />
      </el-form-item>
      <el-form-item v-if="isQR" label="设备名称" prop="deviceName">
        <el-input v-model="formData.deviceName" placeholder="输入二维码标签号自动查询" disabled />
      </el-form-item>
      <el-form-item v-if="isQR" label="设备所在地点" prop="address">
        <el-input
          v-model="formData.address"
          placeholder="输入二维码标签号自动查询"
          :disabled="isQR"
        />
      </el-form-item>
      <el-form-item v-else label="设备所在地点" prop="addressId">
        <el-cascader
          ref="cascaderRef"
          v-model="formData.addressId"
          :props="{ label: 'addressName', value: 'id' }"
          :options="repairStore.locationsTree"
          placeholder="请选择所在地点"
          @change="onAddressChange"
        />
      </el-form-item>
      <el-form-item label="设备具体位置" prop="location">
        <el-input
          v-model="formData.location"
          :placeholder="isQR ? '输入二维码标签号自动查询' : '请输入设备具体位置'"
          :disabled="isQR"
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
      <el-form-item label="问题照片" prop="picture">
        <BatchPicturesUploader
          v-model:fileList="formData.picture"
          :limit-size="{ size: 5, unit: 'MB' }"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading"> 确 定 </el-button>
      <el-button @click="closeDialog">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { getAll } from '@/api/system/user'
import { createRepairOrder, getArchiveByLabelCode } from '@/api/repair'
import { IssueTypeEnum, OperateMethod, RepairSourceType } from '@/api/repair/constant'
import { isMobilePhone } from '@/utils/is'
import { CommonLevelEnum } from '@/utils/constants'
import { BatchPicturesUploader } from '@/components/BatchPicturesUploader'
import { getPictureName } from './utils'
import { useRepairStoreWithOut } from '@/store/modules/repair'
import type { ElFormItem, FormInstance, UploadUserFile, ElCascader } from 'element-plus'

defineOptions({
  name: 'OrderCreate'
})

const { t } = useI18n()
const message = useMessage()
const repairStore = useRepairStoreWithOut()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const formLoading = ref(false)
const formData = ref({
  id: undefined,
  code: '',
  title: '',
  labelCode: '',
  deviceName: '',
  deviceId: undefined as unknown as number,
  address: '',
  addressId: [] as number[],
  location: '',
  submitUserId: undefined as unknown as number,
  submitUserMobile: undefined as unknown as string,
  requestType: undefined as unknown as IssueTypeEnum,
  questionType: undefined as unknown as number,
  level: undefined as unknown as CommonLevelEnum,
  description: '',
  picture: [] as UploadUserFile[]
})
const formRules = reactive({
  title: [{ required: true, message: '工单标题不能为空', trigger: 'blur' }],
  labelCode: [{ required: true, message: '二维码标签不能为空', trigger: 'blur' }],
  deviceName: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
  address: [{ required: true, message: '设备地点不能为空', trigger: 'blur' }],
  addressId: [{ required: true, message: '设备地点不能为空', trigger: 'change' }],
  location: [{ required: true, message: '设备位置不能为空', trigger: 'blur' }],
  submitUserId: [{ required: true, message: '报修人不能为空', trigger: 'blur' }],
  submitUserMobile: [
    { required: true, message: '报修人电话不能为空', trigger: 'blur' },
    { pattern: isMobilePhone, message: '电话格式不正确', trigger: ['blur', 'change'] }
  ],
  requestType: [{ required: true, message: '请求类型不能为空', trigger: 'blur' }],
  questionType: [{ required: true, message: '问题类型不能为空', trigger: 'blur' }],
  level: [{ required: true, message: '紧急程度不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '问题描述不能为空', trigger: 'blur' }],
  picture: [{ type: 'array', required: true, message: '请上传问题照片', trigger: 'blur' }]
})

/** 打开弹窗 */
const open = async () => {
  dialogVisible.value = true
  dialogTitle.value = '新增运维工单'
  resetForm()
}
defineExpose({ open })

/** 选择不同的报修类型 */
enum RepairType {
  QR = 1, // 二维码报修
  WithoutQR // 没有二维码的报修（软件、监控等）
}
const radio = ref(RepairType.QR)
const isQR = computed(() => radio.value === RepairType.QR)
const onRadioChange = () => {
  Object.assign(formData.value, {
    labelCode: '',
    deviceName: '',
    deviceId: undefined as unknown as number,
    address: '',
    addressId: [],
    location: ''
  })
  formRef.value?.clearValidate()
}

// 地点切换，重置对应地点名信息
const cascaderRef = ref<InstanceType<typeof ElCascader>>()
const onAddressChange = () => {
  const nodes = cascaderRef.value?.getCheckedNodes(false)
  if (nodes) formData.value.address = nodes[0]?.text
}

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
        address: info.address,
        addressId: info.addressId || [],
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

const closeDialog = () => {
  dialogVisible.value = false
}

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  await formRef.value?.validate()
  const { code, labelCode, deviceName, deviceId, addressId, picture, ...data } = formData.value
  formLoading.value = true
  try {
    await createRepairOrder(
      Object.assign(
        {
          ...data,
          addressIdList: addressId,
          operateMethod: OperateMethod.Create,
          sourceType: RepairSourceType.Offline,
          picture: picture
            .map((p) => getPictureName(p.url))
            .filter((p) => p)
            .join(';')
        },
        isQR.value ? { labelCode, deviceName, deviceId } : {}
      )
    )
    message.success(t('common.createSuccess'))
    closeDialog()
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
    address: '',
    addressId: [] as number[],
    location: '',
    submitUserId: undefined as unknown as number,
    submitUserMobile: undefined as unknown as string,
    requestType: undefined as unknown as IssueTypeEnum,
    questionType: undefined as unknown as number,
    level: undefined as unknown as CommonLevelEnum,
    description: '',
    picture: [] as UploadUserFile[]
  }
  formRef.value?.resetFields()
}
</script>
