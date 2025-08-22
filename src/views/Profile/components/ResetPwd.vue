<template>
  <el-form ref="formRef" :model="password" :rules="rules" :label-width="200">
    <el-form-item :label="t('profile.password.oldPassword')" prop="oldPassword">
      <InputPassword v-model="password.oldPassword" />
    </el-form-item>
    <el-form-item :label="t('profile.password.newPassword')" prop="newPassword">
      <InputPassword ref="newPasswordRef" v-model="password.newPassword" strength />
    </el-form-item>
    <el-form-item :label="t('profile.password.confirmPassword')" prop="confirmPassword">
      <InputPassword v-model="password.confirmPassword" strength />
    </el-form-item>
    <el-form-item>
      <XButton
        :title="t('common.save')"
        type="primary"
        :loading="loading"
        @click="submit(formRef)"
      />
      <XButton :title="t('common.reset')" type="danger" @click="reset(formRef)" />
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import { InputPassword } from '@/components/InputPassword'
import { updateUserPassword } from '@/api/system/user/profile'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import type { FormInstance, FormRules } from 'element-plus'

defineOptions({ name: 'ResetPwd' })

const { t } = useI18n()
const message = useMessage()
const { wsCache } = useCache()

const formRef = ref<FormInstance>()
const password = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const newPasswordRef = ref<InstanceType<typeof InputPassword>>()
const loading = ref(false)

// 表单校验
const equalToPassword = (_rule, value, callback) => {
  if (password.newPassword !== value) {
    callback(new Error(t('profile.password.diffPwd')))
  } else {
    callback()
  }
}

const rules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: t('profile.password.oldPwdMsg'), trigger: 'blur' },
    { min: 6, max: 20, message: t('profile.password.pwdRules'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: t('profile.password.newPwdMsg'), trigger: 'blur' },
    { min: 6, max: 20, message: t('profile.password.pwdRules'), trigger: 'blur' },
    {
      validator: () => newPasswordRef.value!.pwdStrength >= 3,
      message: t('strengthenPwd.errorMessage'),
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: t('profile.password.cfPwdMsg'), trigger: 'blur' },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ]
})

const submit = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        await updateUserPassword(password.oldPassword, password.newPassword)
        wsCache.replace(CACHE_KEY.PWD_STRENGTH, newPasswordRef.value!.pwdStrength)
        message.success(t('common.updateSuccess'))
      } finally {
        loading.value = false
      }
    }
  })
}

const reset = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>
