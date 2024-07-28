<template>
  <el-drawer v-model="drawer" :direction="direction" :before-close="handleClose" append-to-body>
    <template #header>
      <h4>添加工作进度</h4>
    </template>
    <template #default>
      <el-form :model="progressData" :rules="progressRules" label-position="right" label-width="80px">
        <el-form-item label="工作内容" prop="workContent">
          <el-input v-model="progressData.workContent" placeholder="请输入工作内容" maxlength="500" show-word-limit type="textarea" :rows="10" />
        </el-form-item>
        <el-form-item label="完成情况" prop="completeSituation">
          <el-input type="textarea" v-model="progressData.completeSituation" placeholder="请输入完成情况" maxlength="500" show-word-limit :rows="10" />
        </el-form-item>
        <el-form-item label="关联事项" prop="relatedMatter">
          <el-select v-model="progressData.relatedMatter" filterable placeholder="请选择需要关联的事项" style="width: 100%">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
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
import { object } from 'vue-types';


/** 工作进度 表单 */
defineOptions({ name: 'AddWorkProgressForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const direction = ref<DrawerProps['direction']>('rtl')
const drawer = ref(false)
const addProgressFormRef = ref()
const emits = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()

const options = ref([
  {
    value: 'Option1',
    label: 'Option1',
  },
  {
    value: 'Option2',
    label: 'Option2',
  }
])

const progressData = ref({
  workContent: undefined,
  completeSituation: undefined,
  relatedMatter: undefined
})

const progressRules = reactive({
  workContent: [{ required: true, message: '工作内容不能为空', trigger: 'blur' }],
  completeSituation: [{ required: true, message: '完成情况不能为空', trigger: 'blur' }],
})

const submit = async () => {
  props.addProcess()
}

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
