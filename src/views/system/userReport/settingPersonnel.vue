<template>
  <Dialog title="汇报人员名单" v-model="dialogVisible" width="700px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="110px"
      v-loading="formLoading"
    >
      <el-card shadow="never" class="join-user w-full" :body-style="{ padding: '8px 20px' }">
        <template #header>
          <div class="flex justify-between">
            <span style="color: var(--el-disabled-text-color)">
              点击右侧按钮，选择需要汇报的人员
            </span>
            <el-button type="primary" @click="openMemberSelector"> 选择 </el-button>
          </div>
        </template>
        <template v-if="formData.joinUserList.length">
          <el-tag
            v-for="user in formData.joinUserList"
            class="mr-5px"
            :key="user.userId"
            type="info"
            effect="plain"
            closable
            @close="onMemberRemove(user)"
          >
            {{ user.userNickName }}
          </el-tag>
        </template>
        <div v-else class="text-center" style="color: var(--el-disabled-text-color)">
          暂无数据
        </div>
      </el-card>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>

  <!-- 内部人员选择组件 -->
  <MemberSelector
    ref="memberRef"
    title="内部与会人员选择"
    :default-selected-list="originalMemberData"
    @selected="onMemberSelected"
  />
</template>
<script setup lang="ts">
import { UserReportApi } from '@/api/system/userReport'
import { useUserStore } from '@/store/modules/user'
import { type UserVO } from '@/api/system/user'
import { type JoinUser } from '@/api/system/meeting'
import { remove } from 'lodash-es'
const MemberSelector = defineAsyncComponent(() => import('@/components/UserSelector/index.vue'))

/** 用户汇报 表单 */
defineOptions({ name: 'SettingPersonnelForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用

const userInfo = useUserStore().getUser
const formData = ref({
  joinUserList: [] as JoinUser[]
})
const formRef = ref()

const formRules = reactive({
  joinUserList: [{ required: true, message: '设置人员数不能为空', trigger: 'change' }]
})

// #region 与会人员相关
const memberItemRef = ref()
const memberRef = ref()
const originalMemberData = ref([] as UserVO[]) // 与 UserSelector 双向绑定的原始数据
const openMemberSelector = () => {
  memberRef.value?.open()
}
// 同步与会人员
const onMemberSelected = (userList: UserVO[]) => {
  originalMemberData.value = userList
  formData.value.joinUserList = userList.map((u) => ({ userNickName: u.nickname, userId: u.id }))
  memberItemRef.value?.validate?.('change')
}
// 移除与会人员
const onMemberRemove = (user: JoinUser) => {
  remove(formData.value.joinUserList, (u) => u.userId === user.userId)
  remove(originalMemberData.value, (u) => u.id === user.userId)
  memberItemRef.value?.validate?.('change')
}
// watch(
//   [() => formData.value.joinUserList, () => formData.value.otherAttend],
//   ([internalUsers, externalUsers]) => {
//     formData.value.capacity = internalUsers.length + externalUsers.length
//   },
//   { deep: true }
// )

const open = async () => {
  dialogVisible.value = true
  resetForm()
  formLoading.value = true
  try {
    const res = await UserReportApi.getAllReportUser()

    formData.value.joinUserList = res.map((item) => {
      return {
        userId: item.reportUserId,
        userNickName: item.reportUserNickName
      }
    })
    originalMemberData.value = res.map((item) => {
      return {
        id: item.reportUserId,
        nickname: item.reportUserNickName
      }
    })
  } finally {
    formLoading.value = false
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
    // const data = formData.value
    // let data = [] as reportObjectSaveReqVOs[]
    const data = formData.value.joinUserList.map((item) => {
      return {
        reportUserId: item.userId,
        reportUserNickName: `${item.userNickName}`,
        userId: userInfo.id,
        userNickName: userInfo.nickname
      }
    })

    await UserReportApi.createReportUsers(data)
    message.success('设置成功')
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
    joinUserList: [] as JoinUser[]
  }
  formRef.value?.resetFields()
}
</script>
