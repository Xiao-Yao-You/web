<template>
  <Dialog
    title="设备分配"
    v-model="dialogVisible"
    scroll
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
      <el-form-item label="设备名称" prop="name">
        <el-input :model-value="formData.name" disabled />
      </el-form-item>
      <el-form-item label="设备编码" prop="code">
        <el-input :model-value="formData.code" disabled />
      </el-form-item>
      <el-form-item label="使用部门" prop="dept">
        <el-select
          v-model="formData.dept"
          placeholder="请选择使用部门"
          value-key="value"
          clearable
          filterable
        >
          <el-option
            v-for="item in deptStore.topDeptOptions"
            :key="item.value"
            :label="item.label"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="使用人" prop="userId">
        <el-select
          v-model="formData.userId"
          placeholder="请选择使用人"
          filterable
          clearable
          :loading="userLoading"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所在地点" prop="addressId">
        <el-tree-select
          v-model="formData.addressId"
          :data="repairStore.locationsTree"
          :props="{
            label: 'addressName',
            value: 'id'
          }"
          check-strictly
          node-key="id"
        />
      </el-form-item>
      <el-form-item label="设备位置" prop="location">
        <el-input
          v-model="formData.location"
          placeholder="请输入设备具体位置"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="IP 地址1" prop="ip1">
        <el-input v-model="formData.ip1" placeholder="请输入 IP 地址1" />
      </el-form-item>
      <el-form-item label="IP 地址2" prop="ip2">
        <el-input v-model="formData.ip2" placeholder="请输入 IP 地址2" />
      </el-form-item>
      <el-form-item label="登记人" prop="registerUser">
        <el-input :model-value="formData.registerUser.nickname" disabled />
      </el-form-item>
      <el-form-item label="登记时间" prop="registerDate">
        <el-input :model-value="formData.registerDate" disabled :suffix-icon="Calendar" />
      </el-form-item>
      <el-form-item label="现场照片" prop="pictureList">
        <BatchPicturesUploader v-model:fileList="formData.pictureList" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { Calendar } from '@element-plus/icons-vue'
import { distributeDevice, getRepairArchive, type DistributePayload } from '@/api/repair'
import { BatchPicturesUploader } from '@/components/BatchPicturesUploader'
import { PictureType } from '@/api/repair/constant'
import { useUserStore } from '@/store/modules/user'
import { useDeptStoreWithOut } from '@/store/modules/department'
import { useRepairStoreWithOut } from '@/store/modules/repair'
import { formatDate } from '@/utils/formatTime'
import { isIPV4 } from '@/utils/is'
import { getAll } from '@/api/system/user'
import type { UploadFiles } from 'element-plus'

/** 分配表单 */
defineOptions({ name: 'DistributeForm' })

const message = useMessage()
const userInfo = useUserStore().getUser
const deptStore = useDeptStoreWithOut()
const repairStore = useRepairStoreWithOut()

const dialogVisible = ref(false)
const userOptions = ref<OptionItem<number>[]>([]) // 使用人选择列表
const userLoading = ref(false)
const formLoading = ref(false)
const formData = ref({
  id: undefined as unknown as number,
  code: '',
  name: '',
  dept: undefined as unknown as OptionItem<number>,
  userId: undefined as unknown as number,
  addressId: undefined as unknown as number,
  location: undefined as unknown as string,
  ip1: '',
  ip2: '',
  registerUser: userInfo,
  registerDate: formatDate(new Date()),
  pictureList: undefined as unknown as UploadFiles
})
const formRules = reactive({
  dept: [{ required: true, message: '使用部门不能为空', trigger: 'blur' }],
  addressId: [{ required: true, message: '所在地点不能为空', trigger: 'blur' }],
  location: [{ required: true, message: '设备位置不能为空', trigger: 'blur' }],
  ip1: [
    { required: true, message: 'IP 地址1不能为空', trigger: 'blur' },
    { pattern: isIPV4, message: 'IP 格式不正确' }
  ],
  ip2: [{ pattern: isIPV4, message: 'IP 格式不正确' }],
  pictureList: [{ required: true, message: '现场图片不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async ({ code, name, id }) => {
  dialogVisible.value = true
  formLoading.value = true
  try {
    const res = await getRepairArchive(id)
    console.log('🚀 ~ res:', res)
    Object.assign(formData.value, {
      id,
      code,
      name
    })
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

// 根据使用部门切换使用人列表
watchEffect(() => {
  if (formData.value.dept) {
    userLoading.value = true
    getAll({ deptId: formData.value.dept.value, nickname: '' })
      .then((res) => {
        userOptions.value = res
      })
      .finally(() => {
        userLoading.value = false
      })
  }
})

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  await formRef.value.validate()
  const { code, name, registerUser, pictureList, dept, ...rest } = formData.value
  const data = {
    ...rest,
    deptId: dept.value,
    deptName: dept.label,
    registerUserId: registerUser.id,
    pictureList: pictureList.map((p) => ({
      name: p.name,
      url: p.url!,
      type: PictureType.Device
    }))
  }
  formLoading.value = true
  try {
    await distributeDevice(data)
    message.success('设备分配成功')
    dialogVisible.value = false
    resetForm()
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined as unknown as number,
    code: '',
    name: '',
    dept: undefined as unknown as OptionItem<number>,
    userId: undefined as unknown as number,
    addressId: undefined as unknown as number,
    location: undefined as unknown as string,
    ip1: '',
    ip2: '',
    registerUser: userInfo,
    registerDate: formatDate(new Date()),
    pictureList: undefined as unknown as UploadFiles
  }
  formRef.value?.resetFields()
}

onMounted(() => {
  deptStore.fetchDeptList()
  repairStore.fetchLocationsAll()
})
</script>
