<template>
  <el-dialog
    v-model="dialogVisible"
    :title="t('strengthenPwd.title')"
    width="500px"
    append-to-body
    @close="handleClose"
  >
    <div class="flex flex-col items-center justify-center">
      <el-icon :size="50" color="#F56C6C" class="mb-4">
        <Warning />
      </el-icon>
      <p class="mb-2 text-lg font-medium">{{ t('strengthenPwd.title') }}</p>
      <p class="text-sm text-gray-500">{{ t('strengthenPwd.description') }}</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleConfirm">{{
          t('strengthenPwd.confirm')
        }}</el-button>
        <el-button @click="handleCancel">{{ t('strengthenPwd.cancel') }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { Warning } from '@element-plus/icons-vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useRouter } from 'vue-router'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { type Score } from '@zxcvbn-ts/core'

defineOptions({
  name: 'StrengthenPwdDialog'
})

const { push, currentRoute } = useRouter()
const { t } = useI18n()
const { wsCache } = useCache()

const dialogVisible = defineModel<boolean>('visible', { default: false })

// 监听路由变化，检查密码强度
watch(
  () => currentRoute.value,
  (_to, from) => {
    // 如果是从登录页跳转而来，并且密码强度小于3，则显示提示对话框
    if (from?.path === '/login') {
      const pwdStrength: Score = wsCache.get(CACHE_KEY.PWD_STRENGTH)
      if (pwdStrength < 3) {
        nextTick(() => {
          dialogVisible.value = true
        })
      }
    }
  },
  { immediate: true }
)

const handleConfirm = () => {
  handleClose()
  push('/user/profile')
}

const handleCancel = () => {
  handleClose()
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped></style>
