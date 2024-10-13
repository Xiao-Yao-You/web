<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="125px"
      v-loading="formLoading"
      :disabled="formType === 'detail'"
    >
      <el-form-item label="地点名称" prop="addressName">
        <el-input
          v-model="formData.addressName"
          placeholder="请输入地点名称"
          show-word-limit
          maxlength="20"
        />
      </el-form-item>
      <el-form-item label="上级地点" prop="parentAddressId">
        <el-tree-select
          v-model="formData.parentAddressId"
          :data="repairStore.locationsMenu"
          :default-expanded-keys="[0]"
          :props="{
            label: 'addressName',
            value: 'id'
          }"
          check-strictly
          node-key="id"
          :disabled="formType === 'create'"
        />
      </el-form-item>
      <el-form-item label="区域硬件负责人" prop="hardwareUser">
        <el-select
          v-model="formData.hardwareUser"
          placeholder="请选择区域硬件负责人"
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
      <el-form-item label="区域软件负责人" prop="softUser">
        <el-select
          v-model="formData.softUser"
          placeholder="请选择区域软件负责人"
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
  createLocation,
  getLocationDetail,
  updateLocation,
  type RepairLocation,
  type LocationPayload
} from '@/api/repair'
import { useRepairStoreWithOut } from '@/store/modules/repair'
import { useEmployeeStoreWithOut } from '@/store/modules/employee'
import { CommonStatusEnum } from '@/utils/constants'
import { type UserVO } from '@/api/system/user'

/** 会议室管理 表单 */
defineOptions({ name: 'RepairLocationForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const repairStore = useRepairStoreWithOut()
const employeeStore = useEmployeeStoreWithOut()

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formType = ref('') // create-新增, child-添加子分类, update-编辑, detail-详情
const formLoading = ref(false)
const formData = ref({
  id: undefined as unknown as number,
  addressName: '',
  parentAddressId: 0,
  softUser: undefined as unknown as UserVO,
  hardwareUser: undefined as unknown as UserVO,
  status: CommonStatusEnum.ENABLE,
  remark: ''
})
const formRules = reactive({
  addressName: [{ required: true, message: '地点不能为空', trigger: 'blur' }],
  softUser: [{ required: true, message: '软件负责人不能为空', trigger: 'blur' }],
  hardwareUser: [{ required: true, message: '硬件负责人不能为空', trigger: 'blur' }]
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
    const { hardwareUserId, hardwareUserNickName, softUserId, softUserNickName, ...rest } =
      (await getLocationDetail(id)) || {}
    switch (formType.value) {
      case 'detail':
      case 'update':
        Object.assign(formData.value, {
          ...rest,
          softUser: { id: softUserId, nickname: softUserNickName },
          hardwareUser: { id: hardwareUserId, nickname: hardwareUserNickName }
        })
        break
      case 'child':
        Object.assign(formData.value, {
          parentAddressId: rest.id,
          softUser: { id: softUserId, nickname: softUserNickName },
          hardwareUser: { id: hardwareUserId, nickname: hardwareUserNickName }
        })
        break
      default:
        break
    }
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

// 判断是新增表单还是编辑表单（类型导航守卫）
function isEditForm(formData: RepairLocation | LocationPayload): formData is RepairLocation {
  return !!(formData as RepairLocation).id
}

// 提交表单
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  if (formType.value === 'detail') return
  await formRef.value.validate()
  const { softUser, hardwareUser, ...rest } = formData.value
  const data = {
    softUserId: softUser.id,
    softUserNickName: softUser.nickname,
    hardwareUserId: hardwareUser.id,
    hardwareUserNickName: hardwareUser.nickname,
    ...rest
  }

  formLoading.value = true
  try {
    if (isEditForm(data)) {
      await updateLocation(data)
      message.success(t('common.updateSuccess'))
    } else {
      await createLocation(data)
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
    addressName: '',
    parentAddressId: 0,
    softUser: undefined as unknown as UserVO,
    hardwareUser: undefined as unknown as UserVO,
    status: CommonStatusEnum.ENABLE,
    remark: ''
  }
  formRef.value?.resetFields()
}

onMounted(() => {
  employeeStore.fetchInfoEmployees()
})
</script>
