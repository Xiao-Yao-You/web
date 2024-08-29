<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="400px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="转交对象" prop="replyUserId">
        <el-select
          v-model="formData.replyUserId"
          filterable
          remote
          reserve-keyword
          placeholder="请输转交对象"
          :remote-method="remoteMethod"
          :loading="loading"
          ref="selectObj"
        >
          <el-option
            v-for="item in reportObjects"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="transferRemark">
        <el-input
          v-model="formData.transferRemark"
          placeholder="请输入备注"
          maxlength="500"
          show-word-limit
          type="textarea"
          :rows="5"
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
import { UserReportApi, type transfer } from '@/api/system/userReport'
import { getAll } from '@/api/system/user'

/** 用户汇报 表单 */
defineOptions({ name: 'TransferForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const selectObj = ref()
const formData = ref({} as transfer)
const formRules = reactive({
  replyUserId: [{ required: true, message: '转交对象不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

const depts = ref<Tree[]>([])
const reportObjects = ref<any[]>([])
const loading = ref(false)
const list = ref<any[]>([])

/**过滤重复数据 */
const filterDuplicateObjects = (arr: any[]) => {
  const seen = new Set()
  return arr.filter((item) => {
    const serializedKey = JSON.stringify(item['value'])
    return seen.has(serializedKey) ? false : seen.add(serializedKey)
  })
}

/**查询汇报对象 */
const remoteMethod = async (query: string) => {
  if (query) {
    loading.value = true
    const users = await getAll(query)
    const userMap = users.map((item) => {
      return { value: item.id, label: `${item.nickname}-${item.username}` }
    })
    list.value = list.value.concat(userMap)
    nextTick(() => {
      const tempUser = filterDuplicateObjects(list.value)
      setTimeout(() => {
        loading.value = false
        reportObjects.value = tempUser.filter((item) => {
          return item.label.includes(query)
        })
      }, 200)
    })
  }
}

/** 打开弹窗 */
const open = async (row?: any) => {
  dialogTitle.value = '转交'
  resetForm()
  formData.value.id = row.id
  dialogVisible.value = true
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
    const data = formData.value as unknown as transfer
    await UserReportApi.transfer(data)
    message.success(t('common.createSuccess'))
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {} as transfer
  formRef.value?.resetFields()
}
</script>
