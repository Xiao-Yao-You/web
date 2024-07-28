<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="汇报人" prop="userNikeName">
        <el-input v-model="formData.userNikeName" placeholder="请输入用户昵称" />
      </el-form-item>
      <el-form-item label="部门" prop="deptId">
        <el-input v-model="formData.deptId" placeholder="请输入部门id" />
      </el-form-item>
      <el-form-item label="汇报日期" prop="dateReport">
        <el-input v-model="formData.dateReport" placeholder="请输入汇报日期" />
      </el-form-item>
      <el-form-item label="汇报对象" prop="reportObject">
        <el-input v-model="formData.reportObject" placeholder="请输入汇报对象" />
      </el-form-item>
      <el-form-item label="工作进度" prop="workProgress">
        <el-table :data="formData.workProgress" style="width: 100%; margin-bottom: 5px">
          <el-table-column type="index +1" label="序号" />
          <el-table-column prop="workContent" label="工作内容" />
          <el-table-column prop="completeSituation" label="完成情况" />
          <el-table-column prop="relatedMatter" label="关联事项" />
        </el-table>
        <el-button color="#626aef" size="small" @click="openProgressDrawer()">+</el-button>
        <el-button color="red" size="small">-</el-button>
      </el-form-item>
      <el-form-item label="工作计划" prop="workPlan">
        <el-table :data="formData.workPlan" style="width: 100%; margin-bottom: 5px">
          <el-table-column type="index +1" label="序号" />
          <el-table-column prop="planContent" label="计划内容" />
          <el-table-column prop="expectedWorkingHours" label="预计工时" />
          <el-table-column prop="resourceDemand" label="资源需求" />
        </el-table>
        <el-button color="#626aef" size="small">+</el-button>
        <el-button color="red" size="small">-</el-button>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input type="textarea" v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
    <AddWorkProgressForm ref="addProgressFormRef" />
  </Dialog>
</template>
<script setup lang="ts">
import { UserReportApi, UserReportVO } from '@/api/system/userReport'
import AddWorkProgressForm from './addWorkProgressForm.vue'

/** 用户汇报 表单 */
defineOptions({ name: 'UserReportForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  userId: undefined,
  deptId: undefined,
  dateReport: undefined,
  commitTime: undefined,
  remark: undefined,
  userNikeName: undefined,
  checkSatus: undefined,
  type: undefined,

  workProgress: [
    {
      workContent: undefined,
      completeSituation: undefined,
      relatedMatter: undefined
    }
  ],
  workPlan: [
    {
      planContent: undefined,
      expectedWorkingHours: undefined,
      resourceDemand: undefined
    }
  ],
  reportObject: undefined
})
const formRules = reactive({
  userId: [{ required: true, message: '汇报人不能为空', trigger: 'blur' }],
  deptId: [{ required: true, message: '部门不能为空', trigger: 'blur' }],
  dateReport: [{ required: true, message: '汇报日期不能为空', trigger: 'blur' }],
  checkSatus: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '类型不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const addProgressFormRef = ref()
const openProgressDrawer = () => {
  addProgressFormRef.value.open()
}

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
      formData.value = await UserReportApi.getUserReport(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as UserReportVO
    if (formType.value === 'create') {
      await UserReportApi.createUserReport(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserReportApi.updateUserReport(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    userId: undefined,
    deptId: undefined,
    dateReport: undefined,
    commitTime: undefined,
    remark: undefined,
    userNikeName: undefined,
    checkSatus: undefined,
    type: undefined,
    workProgress: [
      {
        workContent: undefined,
        completeSituation: undefined,
        relatedMatter: undefined
      }
    ],
    workPlan: [
      {
        planContent: undefined,
        expectedWorkingHours: undefined,
        resourceDemand: undefined
      }
    ],
    reportObject: undefined
  }
  formRef.value?.resetFields()
}
</script>
