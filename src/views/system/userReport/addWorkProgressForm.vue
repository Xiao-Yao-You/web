<template>
  <el-drawer
    v-model="drawer"
    :direction="direction"
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <template #header="{ close, titleId, titleClass }">
      <h4 :id="titleId" :class="titleClass">添加工作进度</h4>
      <el-button @click="handleClose(close)">取消</el-button>
      <el-button v-if="controlType != 'view'" type="primary" @click="submit">确认</el-button>
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
            clearable
            @change="selectConnect"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
              :disabled="item.disabled"
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
  </el-drawer>
</template>
<script setup lang="ts">
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'
import { UserReportApi } from '../../../api/system/userReport/index'
// import { isFunction } from '@/utils/is'
import { type workProgress } from '@/api/system/userReport'
import type { DrawerProps, DialogBeforeCloseFn, FormInstance } from 'element-plus'

/** 工作进度 表单 */
defineOptions({ name: 'AddWorkProgressForm' })

type FormType = Partial<
  Pick<workProgress, 'content' | 'situation' | 'connectId' | 'connectContent'>
>

const message = useMessage()
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const direction = ref<DrawerProps['direction']>('rtl')
const drawer = ref(false)
const addProgressFormRef = ref<FormInstance>()
const emits = defineEmits<{
  addprogress: [addProgress: FormType]
  updateprogress: [updateProgress: FormType]
}>()

const options = ref([] as any)

const progressData = ref<FormType>({
  content: '',
  situation: '',
  connectId: undefined,
  connectContent: ''
})

/** 操作类型 */
const controlType = ref('')
const progressRules = reactive({
  content: [{ required: true, message: '工作内容不能为空', trigger: 'blur' }],
  situation: [{ required: true, message: '完成情况不能为空', trigger: 'blur' }]
})

/**改变选择 */
const selectConnect = async (value: number | undefined) => {
  if (value) {
    const selectedLabel = options.value.find((option) => option.value === value).label
    progressData.value.connectContent = selectedLabel
  } else {
    progressData.value.connectContent = ''
    progressData.value.connectId = undefined
  }
}

/**提交表单 */
const submit = async () => {
  // 校验表单
  await addProgressFormRef.value!.validate()
  // 提交请求
  formLoading.value = true

  if (controlType.value == 'add') {
    emits('addprogress', progressData.value)
  } else {
    emits('updateprogress', progressData.value)
  }
  drawer.value = false
}

/** 打开弹窗 */
const open = async (type: string, process: workProgress) => {
  resetForm()
  if (type === 'update' || type === 'view') {
    progressData.value = cloneDeep(process)
  }
  const data = await UserReportApi.getReportFollowUpUndo(process.connectId)
  options.value = data.map((item) => {
    return {
      value: item.id,
      label: item.content,
      disabled: !dayjs().isAfter(dayjs(item.dateReport.join('-'), 'YYYY-M-D'), 'day')
    }
  })
  controlType.value = type
  drawer.value = true
}

/** 关闭抽屉 */
const handleClose: DialogBeforeCloseFn = async (done) => {
  if (progressData.value.content || progressData.value.situation) {
    await message.confirm('系统可能不会保存您所做的更改，确认关闭？')
  }
  addProgressFormRef.value!.clearValidate()
  done()
}

/**
 * @description 重置表单
 * 在 open 时，ref 还无法获取 form 实例，不能使用 resetFields()等方法，只能手动重置
 */
const resetForm = () => {
  progressData.value = {
    content: '',
    situation: '',
    connectId: undefined,
    connectContent: ''
  }
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗
</script>
