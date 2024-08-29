<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1000px">
    <el-table :data="formData" style="width: 100%; margin-bottom: 5px" show-overflow-tooltip>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column label="转交人" prop="operatorNickName" width="120" />
      <el-table-column label="转交备注" prop="transferRemark" />
      <el-table-column
        label="转交时间"
        prop="transferTime"
        :formatter="dateFormatter"
        width="240"
      />
    </el-table>
    <template #footer>
      <el-button @click="dialogVisible = false">返 回</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { UserReportApi, type transfer } from '@/api/system/userReport'

/** 用户汇报 表单 */
defineOptions({ name: 'TransferForm' })

const { t } = useI18n() // 国际化
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref([])
import { dateFormatter, dateFormatter2 } from '@/utils/formatTime'
const formRules = reactive({
  replyUserId: [{ required: true, message: '转交对象不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (row?: any) => {
  resetForm()
  const data = await UserReportApi.getTransferRecord(row.id)
  formData.value = data
  dialogVisible.value = true
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 重置表单 */
const resetForm = () => {
  formData.value = []
  formRef.value?.resetFields()
}
</script>
