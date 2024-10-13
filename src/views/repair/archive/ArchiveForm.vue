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
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="设备编码" prop="code">
        <el-input v-model="formData.code" placeholder="自动生成" disabled />
      </el-form-item>
      <el-form-item label="设备名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入设备名称"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="设备类型" prop="deviceType">
        <el-select
          v-model="formData.deviceType"
          placeholder="请选择设备类型"
          clearable
          value-key="value"
        >
          <el-option
            v-for="item in repairStore.deviceOptions"
            :key="item.value"
            :label="item.label"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备型号" prop="model">
        <el-input
          v-model="formData.model"
          placeholder="请输入型号"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="序列号" prop="serialNumber">
        <el-input
          v-model="formData.serialNumber"
          placeholder="请输入序列号"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="编码规则" prop="numberName">
        <el-select v-model="formData.numberName" placeholder="请选择编码规则" clearable>
          <el-option
            v-for="item in numberNameOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="MAC 地址1" prop="macAddress1">
        <el-input
          v-model="formData.macAddress1"
          placeholder="请输入 MAC 地址1"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="MAC 地址2" prop="macAddress2">
        <el-input
          v-model="formData.macAddress2"
          placeholder="请输入MAC 地址2"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="所在厂区" prop="company">
        <el-select v-model="formData.company" placeholder="请选择所在厂区" clearable>
          <el-option
            v-for="opt in CompanyOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="影响程度" prop="effectLevel">
        <el-select v-model="formData.effectLevel" placeholder="请选择影响程度" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.LEVEL)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="资产编号" prop="assetNumber">
        <el-input
          v-model="formData.assetNumber"
          placeholder="请输入资产编号"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="生产日期" prop="manufactureDate">
        <el-date-picker
          v-model="formData.manufactureDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择生产日期"
        />
      </el-form-item>
      <el-form-item label="质保日期" prop="warrantyDate">
        <el-date-picker
          v-model="formData.warrantyDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择质保日期"
        />
      </el-form-item>
      <el-form-item label="是否巡检" prop="needCheckFlag">
        <el-switch v-model="formData.needCheckFlag" :active-value="0" :inactive-value="1" />
      </el-form-item>
      <el-form-item label="设备照片" prop="pictureList">
        <BatchPicturesUploader v-model:fileList="formData.pictureList" />
      </el-form-item>
      <el-form-item label="设备配置" prop="accessoryList">
        <el-table :data="formData.accessoryList" border>
          <el-table-column prop="accessoryDesc" label="配件" />
          <el-table-column prop="model" label="型号" />
          <el-table-column prop="num" label="数量" />
          <el-table-column prop="remark" label="备注" />
          <el-table-column prop="action" label="操作">
            <template #header>
              <el-button type="primary" size="small" @click="configRef?.open()">添加配置</el-button>
            </template>
            <template #default="scope">
              <el-button size="small" type="danger" @click="deleteDeviceConfig(scope.$index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <!-- <el-form-item label="设备类型描述" prop="deviceTypeName">
        <el-input v-model="formData.deviceTypeName" placeholder="请输入设备类型描述" />
      </el-form-item> -->
      <!-- <el-form-item label="标签code" prop="labelCode">
        <el-input v-model="formData.labelCode" placeholder="请输入标签code" />
      </el-form-item> -->
      <!-- <el-form-item label="状态 0:在用,1:闲置,2:报废" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item> -->
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>

  <DeviceConfigForm ref="configRef" @confirm="(value) => void formData.accessoryList.push(value)" />
</template>
<script setup lang="ts">
import DeviceConfigForm from './DeviceConfigForm.vue'
import {
  getRepairArchive,
  createRepairArchive,
  updateRepairArchive
  // ArchivePayload
} from '@/api/repair'
import { BatchPicturesUploader } from '@/components/BatchPicturesUploader'
import { useRepairStoreWithOut } from '@/store/modules/repair'
import { CommonStatusEnum, CommonLevelEnum } from '@/utils/constants'
import { CompanyOptions, PictureType, CompanyEnum, UsingStatus } from '@/api/repair/constant'
import { dateTransfer } from '@/views/system/meeting/subscribe/hook/useMeetingStatus'
import type { AccessoryItem } from '@/api/repair'
import type { UploadFile, UploadFiles } from 'element-plus'
import { getSceneCodeAll } from '@/api/system/scenecode'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

/** 运维设备档案 表单 */
defineOptions({ name: 'RepairArchiveForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const repairStore = useRepairStoreWithOut()

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const numberNameOptions = ref<OptionItem[]>([]) // 编码规则选择项
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined as unknown as number,
  code: undefined as unknown as string,
  name: '',
  deviceType: undefined as unknown as OptionItem<number>,
  model: '',
  serialNumber: '',
  numberName: '',
  macAddress1: '',
  macAddress2: '',
  company: undefined as unknown as CompanyEnum,
  effectLevel: undefined as unknown as CommonLevelEnum,
  assetNumber: '',
  manufactureDate: '',
  warrantyDate: '',
  needCheckFlag: CommonStatusEnum.ENABLE,
  pictureList: undefined as unknown as UploadFiles,
  accessoryList: [] as AccessoryItem[]
  // labelCode: undefined,
})
const formRules = reactive({
  name: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
  deviceType: [{ required: true, message: '设备类型不能为空', trigger: 'change' }],
  model: [{ required: true, message: '设备型号不能为空', trigger: 'blur' }],
  serialNumber: [{ required: true, message: '序列号不能为空', trigger: 'blur' }],
  numberName: [{ required: true, message: '编码规则不能为空', trigger: 'blur' }],
  macAddress1: [{ required: true, message: 'mac地址1不能为空', trigger: 'blur' }],
  manufactureDate: [{ required: true, message: '生产日期不能为空', trigger: 'blur' }],
  company: [{ required: true, message: '所在厂区不能为空', trigger: 'change' }],
  effectLevel: [{ required: true, message: '影响程度不能为空', trigger: 'change' }],
  warrantyDate: [{ required: true, message: '质保日期不能为空', trigger: 'blur' }],
  assetNumber: [{ required: true, message: '资产编号不能为空', trigger: 'blur' }],
  pictureList: [{ required: true, message: '设备照片不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const configRef = ref()

// 删除设备配置项
const deleteDeviceConfig = async (index: number) => {
  await message.confirm('确定要删除该项设备配置吗?')
  formData.value.accessoryList.splice(index, 1)
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type) + '设备档案'
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const {
        manufactureDate,
        warrantyDate,
        deviceType,
        deviceTypeName,
        effectLevel,
        pictureList,
        ...rest
      } = await getRepairArchive(id)

      formData.value = {
        manufactureDate: dateTransfer(manufactureDate).format('YYYY-MM-DD'),
        warrantyDate: dateTransfer(warrantyDate).format('YYYY-MM-DD'),
        deviceType: {
          value: deviceType,
          label: deviceTypeName
        },
        effectLevel: Number(effectLevel),
        pictureList: pictureList.map((p) => ({ url: p.url, name: p?.name }) as UploadFile),
        ...rest
      }
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  await formRef.value.validate()
  const { deviceType, pictureList, ...rest } = formData.value
  const data = {
    ...rest,
    deviceType: deviceType.value,
    deviceTypeName: deviceType.label,
    pictureList: pictureList.map((p) => ({
      name: p.name,
      url: p.url!,
      type: PictureType.Device
    })),
    status: UsingStatus.Idle
  }
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await createRepairArchive(data)
      message.success(t('common.createSuccess'))
    } else {
      await updateRepairArchive(data)
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
    id: undefined as unknown as number,
    code: undefined as unknown as string,
    name: '',
    deviceType: undefined as unknown as OptionItem<number>,
    model: '',
    serialNumber: '',
    numberName: '',
    macAddress1: '',
    macAddress2: '',
    company: undefined as unknown as CompanyEnum,
    effectLevel: undefined as unknown as CommonLevelEnum,
    assetNumber: '',
    manufactureDate: '',
    warrantyDate: '',
    needCheckFlag: CommonStatusEnum.ENABLE,
    pictureList: [] as UploadFiles,
    accessoryList: [] as AccessoryItem[]
  }
  formRef.value?.resetFields()
}

onMounted(() => {
  getSceneCodeAll().then((list) => {
    numberNameOptions.value = list.map((item) => ({
      label: item.description,
      value: item.id
    }))
  })
})
</script>
