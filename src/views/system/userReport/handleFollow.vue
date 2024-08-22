<template>
  <el-drawer v-model="drawer" :direction="direction" :before-close="handleClose" addProgressFormRef>
    <template #header>
      <h4>添加关注</h4>
    </template>
    <template #default>
      <el-form
        ref="addPlanFormRef"
        :model="planData"
        :rules="planRules"
        label-position="right"
        label-width="80px"
      >
        <el-form-item label="工作计划" prop="content">
          <el-input
            v-model="planData.content"
            placeholder="请输入工作计划"
            maxlength="500"
            show-word-limit
            type="textarea"
            :rows="10"
            :disabled="controlType == 'view'"
          />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">取消</el-button>
        <el-button type="primary" @click="submit" v-if="controlType != 'view'">确认</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts">
import { type workPlan } from '@/api/system/userReport'
import { cloneDeep } from 'lodash-es'

/** 工作进度 表单 */
defineOptions({ name: 'AddWorkPlanForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const direction = ref<DrawerProps['direction']>('rtl')
const drawer = ref(false)
const addPlanFormRef = ref()

const emits = defineEmits<{
  addplan: [addPlan: workPlan]
  updateplan: [updatePlan: workPlan]
}>()

const planData = ref({} as workPlan)
/** 操作类型 */
const controlType = ref('')

/**提交表单 */
const submit = async () => {
  // 校验表单
  await addPlanFormRef.value.validate()
  // 提交请求
  formLoading.value = true
  if (controlType.value == 'add') {
    emits('addplan', planData.value)
  } else {
    emits('updateplan', planData.value)
  }
  planData.value = {} as workPlan
  drawer.value = false
}

/** 打开弹窗 */
const open = async (type: string, plan: workPlan) => {
  if (type === 'update' || type === 'view') {
    planData.value = cloneDeep(plan)
  }
  controlType.value = type
  drawer.value = true
}

const planRules = reactive({
  content: [{ required: true, message: '工作内容不能为空', trigger: 'blur' }],
  estimatedTime: [{ required: true, message: '完成情况不能为空', trigger: 'blur' }]
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
