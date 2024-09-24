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
      <el-form-item label="问题名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入问题名称"
          show-word-limit
          maxlength="20"
        />
      </el-form-item>
      <el-form-item label="父级问题" prop="parentId">
        <el-select
          v-model="formData.parentId"
          placeholder="选择父级问题"
          :disabled="formType === 'child'"
        >
          <el-option
            v-for="item in issueOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="问题类型" prop="type">
        <el-select
          v-model="formData.type"
          placeholder="选择问题类型"
          :disabled="formType === 'child'"
        >
          <el-option
            v-for="item in IssueTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关联设备" prop="capacity">
        <!-- <el-select v-model="formData.type" placeholder="选择问题类型" :disabled="formType === 'child'">
          <el-option
            v-for="item in IssueTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select> -->
      </el-form-item>
      <el-form-item label="问题描述" prop="status">
        <el-input
          v-model="formData.description"
          placeholder="请输入问题描述"
          type="textarea"
          :rows="4"
          show-word-limit
          maxlength="500"
        />
      </el-form-item>
      <el-form-item label="解决方案" prop="remark">
        <Editor v-model="formData.solution" height="150px" :readonly="formType === 'detail'" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia'
import {
  createIssue,
  getIssueDetail,
  updateIssue,
  type RepairIssue,
  type IssuePayload
} from '@/api/repair'
import { IssueTypeOptions, IssueTypeEnum } from '@/api/repair/constant'
import { useRepairStoreWithOut } from '@/store/modules/repair'

/** 会议室管理 表单 */
defineOptions({ name: 'RepairIssueForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const repairStore = useRepairStoreWithOut()
const { issueOptions } = storeToRefs(repairStore)

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formType = ref('') // create-新增, child-添加子类, update-编辑, detail-详情
const formLoading = ref(false)
const formData = ref({
  id: -1,
  name: '', // 问题名称
  parentId: undefined as undefined | number, // 父级问题
  type: IssueTypeEnum.Hardware, // 问题类型
  device: '', // 关联设备
  description: '', // 问题描述
  solution: '' // 解决方案
})
const formRules = reactive({
  name: [{ required: true, message: '问题名称不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '问题类型不能为空', trigger: 'blur' }],
  device: [{ required: true, message: '关联设备不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

// 判断是新增表单还是编辑表单（类型导航守卫）
function isEditForm(formData: RepairIssue | IssuePayload): formData is RepairIssue {
  return (formData as RepairIssue).id > 0
}

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
    const detail = (await getIssueDetail(id)) || {}
    switch (formType.value) {
      case 'detail':
      case 'update':
        Object.assign(formData.value, detail)
        break
      case 'child':
        Object.assign(formData.value, {
          parentId: detail.parentId,
          type: detail.type,
          device: detail.device
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

// 提交表单
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  if (formType.value === 'detail') return

  await formRef.value.validate()
  formLoading.value = true
  try {
    if (isEditForm(formData.value)) {
      await updateIssue(formData.value)
      message.success(t('common.updateSuccess'))
    } else {
      await createIssue(formData.value)
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
    id: -1,
    name: '',
    parentId: undefined,
    type: IssueTypeEnum.Hardware,
    device: '',
    description: '',
    solution: ''
  }
  formRef.value?.resetFields()
}

onMounted(() => {
  repairStore.fetchIssuesAll()
})
</script>
