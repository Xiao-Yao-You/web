<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      v-loading="formLoading"
      label-width="90px"
    >
      <el-form-item prop="groupId" label="运维小组">
        <el-select v-model="formData.groupId" placeholder="请选择请求类型对应的运维小组">
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.REPAIR_REQUEST_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="小组成员" prop="userIds">
        <el-select
          v-model="formData.userIds"
          placeholder="请选择小组成员"
          filterable
          multiple
          clearable
        >
          <el-option
            v-for="item in employeeStore.infoEmployees"
            :key="item.id"
            :label="item.nickname"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading" :loading="loading">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import {
  getMemberGroup,
  createMemberGroup,
  updateMemberGroup,
  type MemberGroupVO
} from '@/api/repair'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { useEmployeeStoreWithOut } from '@/store/modules/employee'

/** 成员分组 表单 */
defineOptions({ name: 'MemberGroupForm' })

const { t } = useI18n()
const message = useMessage()
const employeeStore = useEmployeeStoreWithOut()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userIds: [],
  groupId: undefined
})
const formRules = reactive({
  groupId: [{ required: true, message: '运维小组不能为空', trigger: 'blur' }],
  userIds: [{ required: true, message: '小组成员不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await getMemberGroup(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

/** 提交表单 */
const emit = defineEmits(['success'])
const loading = ref(false)
const submitForm = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    const data = formData.value as unknown as MemberGroupVO
    if (formType.value === 'create') {
      await createMemberGroup(data)
      message.success(t('common.createSuccess'))
    } else {
      await updateMemberGroup(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    loading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    userIds: [],
    groupId: undefined
  }
  formRef.value?.resetFields()
}
</script>
