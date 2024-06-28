<template>
  <Dialog v-model="dialogVisible" title="绑定租户" width="30%">
    <el-form ref="formRef" v-loading="formLoading" :model="formData" label-width="80px">
      <el-form-item label="租户">
        <el-select v-model="formData.tenantIdList" multiple placeholder="请选择租户">
          <el-option
            v-for="item in tenantList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
            :disabled="!!item.status"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import * as TenantApi from '@/api/system/tenant'
import * as UserApi from '@/api/system/user'

defineOptions({ name: 'SystemUserBindTenantForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref<{ userId: number; tenantIdList: number[] }>({
  userId: -1,
  tenantIdList: []
})
const formRef = ref() // 表单 Ref
const tenantList = ref<TenantApi.TenantVO[]>([]) // 租户列表

/** 打开弹窗 */
const open = async (row: UserApi.UserVO) => {
  dialogVisible.value = true
  resetForm()
  // 获得角色拥有的菜单集合
  formLoading.value = true
  try {
    formData.value.userId = row.id
    const { tenantDOList: list } = await TenantApi.queryUserTenantById({ userId: row.id })
    formData.value.tenantIdList = list.map((item) => item.tenantId)
  } finally {
    formLoading.value = false
  }
  // 获得角色列表
  const { list } = await TenantApi.getTenantPage({
    pageNo: 1,
    pageSize: 100
  })
  tenantList.value = list
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    await TenantApi.updateUserTenant({
      userId: formData.value.userId,
      tenantIdList: formData.value.tenantIdList
    })
    message.success(t('common.updateSuccess'))
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success', true)
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    userId: -1,
    tenantIdList: []
  }
  formRef.value?.resetFields()
}
</script>
