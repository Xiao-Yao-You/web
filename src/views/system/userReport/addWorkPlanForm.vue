<template>
  <el-drawer v-model="drawer" :direction="direction" :before-close="handleClose" addProgressFormRef>
    <template #header>
      <h4>添加工作进度</h4>
    </template>
    <template #default>
      <el-form :model="planData" :rules="planRules" label-position="right" label-width="80px">
        <el-form-item label="工作计划" prop="workPlan">
          <el-input v-model="planData.workPlan" placeholder="请输入工作计划" maxlength="500" show-word-limit type="textarea" :rows="10" />
        </el-form-item>
        <el-form-item label="预计工时" prop="expectedWorkingHours">
          <el-input type="textarea" v-model="planData.expectedWorkingHours" placeholder="请输入预计工时" maxlength="500" show-word-limit :rows="10" />
        </el-form-item>
        <el-form-item label="资源需求" prop="resourceDemand">
          <el-input type="textarea" v-model="planData.resourceDemand" placeholder="请输入资源需求" maxlength="500" show-word-limit :rows="10" />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">取消</el-button>
        <el-button type="primary">确认</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts">

/** 工作进度 表单 */
defineOptions({ name: 'AddWorkPlanForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const direction = ref<DrawerProps['direction']>('rtl')
const drawer = ref(false)
const addPlanFormRef = ref()

const planData = ref({
  workPlan: undefined,
  expectedWorkingHours: undefined,
  resourceDemand: undefined
})

const planRules = reactive({
  workPlan: [{ required: true, message: '工作内容不能为空', trigger: 'blur' }],
  expectedWorkingHours: [{ required: true, message: '完成情况不能为空', trigger: 'blur' }],
})

/** 打开弹窗 */
const open = async () => {
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
