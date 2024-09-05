<template>
  <el-drawer v-model="drawer" :direction="direction" :before-close="handleClose" addProgressFormRef>
    <template #header>
      <h4>添加关注</h4>
    </template>
    <template #default>
      <el-form
        ref="handleFollowRef"
        :model="formData"
        :rules="attentionRules"
        label-position="right"
        label-width="80px"
      >
        <el-form-item label="工作内容" prop="content">
          <el-input
            v-model="formData.content"
            placeholder="请输入工作内容"
            maxlength="500"
            show-word-limit
            type="textarea"
            :rows="5"
            disabled
          />
        </el-form-item>
        <el-form-item label="工作进度" prop="situation">
          <el-input
            v-model="formData.situation"
            placeholder="请输入工作进度"
            maxlength="500"
            show-word-limit
            type="textarea"
            :rows="5"
            disabled
          />
        </el-form-item>
        <el-form-item label="批复" prop="reply">
          <el-input
            v-model="formData.reply"
            placeholder="请输入批复内容"
            maxlength="500"
            show-word-limit
            type="textarea"
            :rows="10"
          />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts">
import { type reportAttention, UserReportApi } from '@/api/system/userReport'
/** 工作进度 表单 */
defineOptions({ name: 'HandleFollow' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const direction = ref<DrawerProps['direction']>('rtl')
const drawer = ref(false)
const handleFollowRef = ref()
/** 提交表单 */
const emit = defineEmits(['success', 'resetData']) // 定义 success 事件，用于操作成功后的回调

const formData = ref({} as reportAttention)

/**提交表单 */
const submit = async () => {
  // 校验表单
  await handleFollowRef.value.validate()
  // 提交请求
  const data = formData.value as unknown as reportAttention
  data.type = 0
  data.jobId = formData.value.reportScheduleId
  await UserReportApi.createReportAttention(data)
  message.success('关注成功')
  formLoading.value = true
  emit('success')
  emit('resetData')
  formData.value = {} as reportAttention
  drawer.value = false
}

/** 打开抽屉 */
const open = async (row: any, type: number) => {
  formData.value = row
  if (type == 2) {
    formData.value.reportScheduleId = row.id
  }
  drawer.value = true
}

const attentionRules = reactive({
  content: [{ required: true, message: '工作内容不能为空', trigger: 'blur' }],
  situation: [{ required: true, message: '工作进度不能为空  ', trigger: 'blur' }],
  reply: [{ required: true, message: '批复内容不能为空  ', trigger: 'blur' }]
})

/** 取消按钮 */
const cancelClick = async () => {
  drawer.value = false
}

/** 关闭抽屉 */
const handleClose = async (done: () => void) => {
  ElMessageBox.confirm('确定关闭当前页面?')
    .then(() => {
      drawer.value = false
      done()
    })
    .catch(() => {
      // catch error
    })
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>
