<template>
  <el-drawer v-model="drawer" :direction="direction" :before-close="handleClose" append-to-body>
    <template #header>
      <h4>添加工作进度</h4>
    </template>
    <template #default>
      <el-form
        ref="addProgressFormRef"
        :model="progressData"
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
            disabled
            :rows="10"
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
            disabled
          />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelClick">返 回</el-button>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts">
import { type workProgress } from '@/api/system/userReport'
import { UserReportApi } from '../../../api/system/userReport/index'

/** 工作进度 表单 */
defineOptions({ name: 'ViewWorkProgressForm' })

const { t } = useI18n() // 国际化
const direction = ref<DrawerProps['direction']>('rtl')
const drawer = ref(false)

const progressData = ref({} as workProgress)

/** 打开弹窗 */
const open = async (id: number) => {
  const data = await UserReportApi.getFollowRecord(id)
  if (data != null) {
    progressData.value = data
  }
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
