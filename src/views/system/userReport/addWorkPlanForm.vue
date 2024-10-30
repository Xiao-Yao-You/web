<template>
  <el-drawer
    v-model="drawer"
    :direction="direction"
    addProgressFormRef
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <template #header="{ close, titleId, titleClass }">
      <h4 :id="titleId" :class="titleClass">添加工作计划</h4>
      <el-button @click="handleClose(close)">取消</el-button>
      <el-button v-if="controlType != 'view'" type="primary" @click="submit">确认</el-button>
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
        <el-form-item label="预计工时" prop="estimatedTime">
          <el-input
            type="textarea"
            v-model="planData.estimatedTime"
            placeholder="请输入预计工时"
            maxlength="500"
            show-word-limit
            :rows="10"
            :disabled="controlType == 'view'"
          />
        </el-form-item>
        <el-form-item label="资源需求" prop="needSource">
          <el-input
            type="textarea"
            v-model="planData.needSource"
            placeholder="请输入资源需求"
            maxlength="500"
            show-word-limit
            :rows="10"
            :disabled="controlType == 'view'"
          />
        </el-form-item>
      </el-form>
    </template>
  </el-drawer>
</template>
<script setup lang="ts">
import { type workPlan } from '@/api/system/userReport'
import { cloneDeep } from 'lodash-es'
import type { DrawerProps, DialogBeforeCloseFn, FormInstance } from 'element-plus'

/** 工作进度 表单 */
defineOptions({ name: 'AddWorkPlanForm' })

const message = useMessage() // 消息弹窗

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const direction = ref<DrawerProps['direction']>('rtl')
const drawer = ref(false)
const addPlanFormRef = ref<FormInstance>()

const emits = defineEmits<{
  addplan: [addPlan: workPlan]
  updateplan: [updatePlan: workPlan]
}>()

const planData = ref<workPlan>({
  content: '',
  estimatedTime: '',
  needSource: ''
})

/** 操作类型 */
const controlType = ref('')

/**提交表单 */
const submit = async () => {
  // 校验表单
  await addPlanFormRef.value!.validate()
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
  resetForm()
  if (type === 'update' || type === 'view') {
    planData.value = cloneDeep(plan)
  }
  controlType.value = type
  drawer.value = true
}
defineExpose({ open })

/**
 * @description 重置表单
 * 在 open 时，ref 还无法获取 form 实例，不能使用 resetFields()等方法，只能手动重置
 */
const resetForm = () => {
  planData.value = {
    content: '',
    estimatedTime: '',
    needSource: ''
  }
}

const planRules = reactive({
  content: [{ required: true, message: '工作内容不能为空', trigger: 'blur' }],
  estimatedTime: [{ required: true, message: '完成情况不能为空', trigger: 'blur' }]
})

/** 关闭抽屉 */
const handleClose: DialogBeforeCloseFn = async (done) => {
  if (planData.value.content || planData.value.estimatedTime) {
    await message.confirm('系统可能不会保存您所做的更改，确认关闭？')
  }
  addPlanFormRef.value!.clearValidate()
  done()
}
</script>
