<template>
  <el-drawer v-model="drawer" :direction="direction" :before-close="handleClose" append-to-body>
    <template #header>
      <h4>汇报详情</h4>
    </template>
    <template #default>
      <el-form
        ref="addProgressFormRef"
        :model="summaryData"
        :rules="progressRules"
        label-position="right"
        label-width="80px"
      >
        <el-form-item label="汇报人" prop="userNickName">
          <el-input v-model="summaryData.userNickName" disabled />
        </el-form-item>
        <el-form-item label="工作内容" prop="content">
          <el-input
            v-model="summaryData.content"
            placeholder="请输入工作内容"
            maxlength="500"
            show-word-limit
            type="textarea"
            :rows="5"
            disabled
          />
        </el-form-item>
        <el-form-item label="完成情况" prop="situation">
          <el-input
            type="textarea"
            v-model="summaryData.situation"
            placeholder="请输入完成情况"
            maxlength="500"
            show-word-limit
            :rows="5"
            disabled
          />
        </el-form-item>
        <el-form-item label="跟进事项" prop="connectContent">
          <el-input
            type="textarea"
            v-model="summaryData.connectContent"
            maxlength="500"
            show-word-limit
            :rows="5"
            disabled
          />
        </el-form-item>
        <el-divider content-position="left">领导批复</el-divider>
        <el-form-item label="批复" prop="reply">
          <el-input
            type="textarea"
            v-model="summaryData.reply"
            maxlength="500"
            show-word-limit
            :rows="5"
            disabled
          />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">返回</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts">
import { cloneDeep } from 'lodash-es'
import { type reportAttention } from '@/api/system/userReport'

/** 工作进度 表单 */
defineOptions({ name: 'SummaryDetail' })

const { t } = useI18n() // 国际化

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const direction = ref<DrawerProps['direction']>('rtl')
const drawer = ref(false)
const addProgressFormRef = ref()
const emits = defineEmits<{}>()

const options = ref([
  {
    value: '1',
    label: 'Option1'
  },
  {
    value: '2',
    label: 'Option2'
  }
])

const summaryData = ref({} as reportAttention)
/** 操作类型 */
const controlType = ref('')
const progressRules = reactive({
  content: [{ required: true, message: '工作内容不能为空', trigger: 'blur' }],
  situation: [{ required: true, message: '完成情况不能为空', trigger: 'blur' }]
})

/** 打开弹窗 */
const open = async (process: reportAttention) => {
  summaryData.value = process
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
  console.log(process)
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
  drawer.value = true
}

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
