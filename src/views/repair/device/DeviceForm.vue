<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :disabled="formType === 'detail'"
    >
      <el-form-item label="设备类型" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入设备类型"
          show-word-limit
          maxlength="20"
        />
      </el-form-item>
      <el-form-item label="设备编码规则" prop="sceneCode">
        <el-select v-model="formData.sceneCode" placeholder="选择编码" filterable>
          <el-option
            v-for="item in sceneCodeOptions"
            :key="item.value"
            value-key="value"
            :label="item.label"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备流水号" prop="currentCode">
        <el-input :model-value="formData.currentCode || '自动生成'" disabled />
      </el-form-item>
      <el-form-item label="标签编码规则" prop="labelSceneCode">
        <el-select v-model="formData.labelSceneCode" placeholder="选择编码" filterable>
          <el-option
            v-for="item in sceneCodeOptions"
            :key="item.value"
            value-key="value"
            :label="item.label"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标签流水号" prop="labelCurrentCode">
        <el-input :model-value="formData.labelCurrentCode || '自动生成'" disabled />
      </el-form-item>
      <el-form-item label="启用状态" prop="status">
        <el-switch v-model="formData.status" :active-value="0" :inactive-value="1" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          placeholder="请输入备注"
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
import {
  createDeviceType,
  getDeviceTypeDetail,
  updateDeviceType,
  type RepairDevice,
  type DevicePayload
} from '@/api/repair'
import { getSceneCodeAll } from '@/api/system/scenecode'
import { CommonStatusEnum } from '@/utils/constants'

/** 会议室管理 表单 */
defineOptions({ name: 'RepairDeviceForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const sceneCodeOptions = ref<OptionItem<number>[]>([])
const formType = ref('') // create-新增, child-添加子类, update-编辑, detail-详情
const formLoading = ref(false)
const formData = ref({
  id: undefined as unknown as number,
  name: '',
  status: CommonStatusEnum.ENABLE,
  remark: '',
  sceneCode: undefined as unknown as OptionItem<number>,
  currentCode: undefined,
  labelSceneCode: undefined as unknown as OptionItem<number>,
  labelCurrentCode: undefined
})
const formRules = reactive({
  name: [{ required: true, message: '设备类型不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

// 打开弹窗
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 根据 id 获取详情
  if (!id) return
  formLoading.value = true
  try {
    const { sceneCodeId, sceneName, labelSceneCodeId, labelSceneName, ...rest } =
      (await getDeviceTypeDetail(id)) || {}
    Object.assign(formData.value, {
      ...rest,
      sceneCode: { value: sceneCodeId, label: sceneName },
      labelSceneCode: { value: labelSceneCodeId, label: labelSceneName }
    })
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

// 判断是新增表单还是编辑表单（类型导航守卫）
function isEditForm(formData: RepairDevice | DevicePayload): formData is RepairDevice {
  return !!(formData as RepairDevice).id
}

// 提交表单
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  if (formType.value === 'detail') return

  await formRef.value.validate()
  formLoading.value = true
  // 处理表单:
  const { sceneCode, labelSceneCode, ...rest } = formData.value
  const data = {
    ...rest,
    sceneCodeId: sceneCode?.value,
    sceneName: sceneCode?.label,
    labelSceneCodeId: labelSceneCode?.value,
    labelSceneName: labelSceneCode?.label
  }
  try {
    if (isEditForm(data)) {
      await updateDeviceType(data)
      message.success(t('common.updateSuccess'))
    } else {
      await createDeviceType(data)
      message.success(t('common.createSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    id: undefined as unknown as number,
    name: '',
    status: CommonStatusEnum.ENABLE,
    remark: '',
    sceneCode: undefined as unknown as OptionItem<number>,
    currentCode: undefined,
    labelSceneCode: undefined as unknown as OptionItem<number>,
    labelCurrentCode: undefined
  }
  formRef.value?.resetFields()
}

onMounted(() => {
  getSceneCodeAll().then((list) => {
    sceneCodeOptions.value = list.map((item) => ({
      label: item.description,
      value: item.id
    }))
  })
})
</script>
