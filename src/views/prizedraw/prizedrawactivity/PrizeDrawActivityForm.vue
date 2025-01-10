<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="活动名称" prop="activityName">
        <el-input v-model="formData.activityName" placeholder="请输入活动名称" />
      </el-form-item>
      <el-form-item label="开始时间" prop="beginTime">
        <el-date-picker
          v-model="formData.beginTime"
          format="YYYY-MM-DD HH:mm:ss"
          type="datetime"
          placeholder="选择开始时间"
        />
      </el-form-item>
      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
          v-model="formData.endTime"
          format="YYYY-MM-DD HH:mm:ss"
          type="datetime"
          placeholder="选择结束时间"
        />
      </el-form-item>
      <el-form-item label="参与人数" prop="participantsQuantity">
        <el-input-number
          v-model="formData.participantsQuantity"
          :min="1"
          :precision="0"
          :step="1"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { PrizeDrawActivityApi, PrizeDrawActivityVO } from '@/api/prizedraw/prizedrawactivity'

/** 抽奖活动 表单 */
defineOptions({ name: 'PrizeDrawActivityForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  activityName: undefined,
  beginTime: undefined,
  endTime: undefined,
  participantsQuantity: undefined
})
const formRules = reactive({})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await PrizeDrawActivityApi.getPrizeDrawActivity(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as PrizeDrawActivityVO
    if (formType.value === 'create') {
      await PrizeDrawActivityApi.createPrizeDrawActivity(data)
      message.success(t('common.createSuccess'))
    } else {
      await PrizeDrawActivityApi.updatePrizeDrawActivity(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    activityName: undefined,
    beginTime: undefined,
    endTime: undefined,
    participantsQuantity: undefined
  }
  formRef.value?.resetFields()
}
</script>
