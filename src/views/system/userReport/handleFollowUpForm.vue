<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1200px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-divider content-position="left">关联事项</el-divider>
      <el-form-item label="关联事项" prop="content">
        <el-input
          type="textarea"
          v-model="formData.connectContent"
          maxlength="300"
          show-word-limit
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-divider content-position="left">领导批复</el-divider>
      <el-form-item label="领导批复" prop="reply">
        <el-input
          type="textarea"
          v-model="formData.reply"
          maxlength="300"
          show-word-limit
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-divider content-position="left">工作跟进</el-divider>
      <el-form-item label="工作内容" prop="content">
        <el-input
          type="textarea"
          v-model="formData.content"
          placeholder="请输入工作内容"
          maxlength="300"
          show-word-limit
          :rows="5"
        />
      </el-form-item>
      <el-form-item label="完成情况" prop="situation">
        <el-input
          type="textarea"
          v-model="formData.situation"
          placeholder="完成情况"
          maxlength="300"
          show-word-limit
          :rows="5"
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
import { UserReportApi, UserReportVO, type workProgress } from '@/api/system/userReport'
import { getDeptsByUserId } from '@/api/system/dept'
import { useUserStore } from '@/store/modules/user'
import { defaultProps, handleTree } from '@/utils/tree'
import dayjs from 'dayjs'
import { isArray } from '../../../utils/is'
import { formatDate } from '../../../utils/formatTime'
import { reportAttention } from '../../../api/system/userReport/index'

/** 用户汇报 表单 */
defineOptions({ name: 'HandleFollowUpForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const selectObj = ref()
const userInfo = useUserStore().getUser
const formData = ref({} as workProgress)
const formRules = reactive({
  userNickName: [{ required: true, message: '汇报人不能为空', trigger: 'blur' }],
  reportObject: [{ required: true, message: '汇报对象不能为空', trigger: 'blur' }],
  deptId: [{ required: true, message: '部门不能为空', trigger: 'blur' }],
  dateReport: [{ required: true, message: '汇报日期不能为空', trigger: 'blur' }],
  checkStatus: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '类型不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const loading = ref(false)
const list = ref<any[]>([])

/** 打开弹窗 */
const open = async (row: reportAttention) => {
  formData.value.reply = row.reply
  formData.value.connectContent = row.content
  formData.value.id = row.id
  formData.value.connectId = row.id
  formData.value.deptId = row.deptId
  formData.value.deptName = row.deptName
  dialogVisible.value = true
  dialogTitle.value = '工作跟进'

  /**查询当前用户所在的部门列表 */
  resetForm()
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
    const data = formData.value as unknown as workProgress
    UserReportApi.createFollow(data)
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formRef.value?.resetFields()
}
</script>
