<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="用户id" prop="userId">
        <el-input v-model="formData.userId" placeholder="请输入用户id" />
      </el-form-item>
      <el-form-item label="部门id" prop="deptId">
        <el-input v-model="formData.deptId" placeholder="请输入部门id" />
      </el-form-item>
      <el-form-item label="汇报日期" prop="dateReport">
        <el-input v-model="formData.dateReport" placeholder="请输入汇报日期" />
      </el-form-item>
      <el-form-item label="提交时间" prop="commitTime">
        <el-date-picker
          v-model="formData.commitTime"
          type="date"
          value-format="x"
          placeholder="选择提交时间"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item label="用户昵称" prop="userNikeName">
        <el-input v-model="formData.userNikeName" placeholder="请输入用户昵称" />
      </el-form-item>
      <el-form-item label="领导查看状态(00:未查看,01已查看)" prop="checkSatus">
        <el-input v-model="formData.checkSatus" placeholder="请输入领导查看状态(00:未查看,01已查看)" />
      </el-form-item>
      <el-form-item label="类型(00:正常,01:补交,02:缺)" prop="type">
        <el-select v-model="formData.type" placeholder="请选择类型(00:正常,01:补交,02:缺)">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { UserReportApi, UserReportVO } from '@/api/hk/userreport'

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
})
const formRules = reactive({
  userId: [{ required: true, message: '用户id不能为空', trigger: 'blur' }],
  deptId: [{ required: true, message: '部门id不能为空', trigger: 'blur' }],
  dateReport: [{ required: true, message: '汇报日期不能为空', trigger: 'blur' }],
  checkSatus: [{ required: true, message: '领导查看状态(00:未查看,01已查看)不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '类型(00:正常,01:补交,02:缺)不能为空', trigger: 'change' }],
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
  }
  formRef.value?.resetFields()
}
</script>
