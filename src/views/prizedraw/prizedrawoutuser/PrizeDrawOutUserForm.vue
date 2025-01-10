<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="姓名" prop="nickname">
        <el-input v-model="formData.nickname" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="部门名称" prop="dept">
        <el-input v-model="formData.dept" placeholder="请输入部门名称" />
      </el-form-item>
      <el-form-item label="工号" prop="workNum">
        <el-input v-model="formData.workNum" placeholder="请输入工号" />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="中奖状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio label="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="奖品等级" prop="prizeLevel">
        <el-input v-model="formData.prizeLevel" placeholder="请输入奖品等级" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { PrizeDrawOutUserApi, PrizeDrawOutUserVO } from '@/api/prizedraw/prizedrawoutuser'

/** 场外参与人员 表单 */
defineOptions({ name: 'PrizeDrawOutUserForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  nickname: undefined,
  dept: undefined,
  workNum: undefined,
  mobile: undefined,
  status: undefined,
  prizeLevel: undefined
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
      formData.value = await PrizeDrawOutUserApi.getPrizeDrawOutUser(id)
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
    const data = formData.value as unknown as PrizeDrawOutUserVO
    if (formType.value === 'create') {
      await PrizeDrawOutUserApi.createPrizeDrawOutUser(data)
      message.success(t('common.createSuccess'))
    } else {
      await PrizeDrawOutUserApi.updatePrizeDrawOutUser(data)
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
    nickname: undefined,
    dept: undefined,
    workNum: undefined,
    mobile: undefined,
    status: undefined,
    prizeLevel: undefined
  }
  formRef.value?.resetFields()
}
</script>
