<template>
  <el-drawer v-model="drawer" :direction="direction" :before-close="handleClose" append-to-body>
    <template #header>
      <h4>添加工作进度</h4>
    </template>
    <template #default>
      <el-form
        ref="addProgressFormRef"
        :model="progressData"
        :rules="progressRules"
        label-position="right"
        label-width="80px"
      >
        <el-form-item label="工作内容" prop="content">
          <el-input
            v-model="progressData.content"
            placeholder="请输入工作内容"
            maxlength="500"
            show-word-limit
            type="textarea"
            :rows="10"
            :disabled="controlType == 'view'"
          />
        </el-form-item>
        <el-form-item label="完成情况" prop="situation">
          <el-input
            type="textarea"
            v-model="progressData.situation"
            placeholder="请输入完成情况"
            maxlength="500"
            show-word-limit
            :rows="10"
            :disabled="controlType == 'view'"
          />
        </el-form-item>
        <el-form-item label="跟进事项" prop="connectId" v-if="controlType != 'view'">
          <el-select
            v-model="progressData.connectId"
            placeholder="请选择需要关联的事项"
            style="width: 100%"
            :disabled="controlType == 'view'"
            @change="selectConnect"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="跟进事项" prop="connectContent" v-if="controlType == 'view'">
          <el-input
            type="textarea"
            v-model="progressData.connectContent"
            placeholder="暂无跟进事项"
            maxlength="500"
            show-word-limit
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
import { cloneDeep } from 'lodash-es'
import { type workProgress } from '@/api/system/userReport'
import { UserReportApi } from '../../../api/system/userReport/index'

/** 工作进度 表单 */
defineOptions({ name: 'AddWorkProgressForm' })

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const direction = ref('rtl')
const drawer = ref(false)
const addProgressFormRef = ref()
const emits = defineEmits<{
  addprogress: [addProgress: workProgress]
  updateprogress: [updateProgress: workProgress]
}>()

const options = ref([] as any)

const progressData = ref({} as workProgress)

/** 操作类型 */
const controlType = ref('')
const progressRules = reactive({
  content: [{ required: true, message: '工作内容不能为空', trigger: 'blur' }],
  situation: [{ required: true, message: '完成情况不能为空', trigger: 'blur' }]
})

/**改变选择 */
const selectConnect = async (value: any) => {
  const selectedLabel = options.value.find((option) => option.value === value).label
  progressData.value.connectContent = selectedLabel
}

/**提交表单 */
const submit = async () => {
  // 校验表单
  await addProgressFormRef.value.validate()
  // 提交请求
  formLoading.value = true

  if (controlType.value == 'add') {
    emits('addprogress', progressData.value)
  } else {
    emits('updateprogress', progressData.value)
  }
  progressData.value = {} as workProgress
  drawer.value = false
}

/** 打开弹窗 */
const open = async (type: string, process: workProgress) => {
  if (type === 'update' || type === 'view') {
    progressData.value = cloneDeep(process)
  }
  const data = await UserReportApi.getReportFollowUpUndo(process.connectId)
  options.value = data.map((item) => {
    return { value: item.id, label: item.content }
  })
  controlType.value = type
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
