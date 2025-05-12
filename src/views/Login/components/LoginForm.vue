<template>
  <el-form
    v-show="getShow"
    ref="formLogin"
    :model="loginData.loginForm"
    :rules="LoginRules"
    class="login-form"
    label-position="top"
    label-width="120px"
    size="large"
  >
    <el-row style="margin-right: -10px; margin-left: -10px">
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item>
          <LoginFormTitle style="width: 100%" />
        </el-form-item>
      </el-col>
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item prop="username" :error="invalidName">
          <el-input
            v-model="loginData.loginForm.username"
            :placeholder="t('login.usernamePlaceholder')"
            :prefix-icon="iconAvatar"
            clearable
            @change="onUserNameChange"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item prop="password">
          <el-input
            v-model="loginData.loginForm.password"
            :placeholder="t('login.passwordPlaceholder')"
            :prefix-icon="iconLock"
            show-password
            type="password"
            @keyup.enter="getCode()"
          />
        </el-form-item>
      </el-col>
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item v-if="loginData.tenantEnable === 'true'" prop="tenantName">
          <el-select
            v-model="loginData.loginForm.tenantName"
            placeholder="请选择租户平台"
            clearable
            filterable
            :loading="tenantLoading"
          >
            <template #prefix><icon-officle /></template>
            <template #loading>
              <svg class="circular" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="20" fill="none" />
              </svg>
            </template>
            <el-option
              v-for="item in tenantList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col
        :span="24"
        style="padding-right: 10px; padding-left: 10px; margin-top: -12px; margin-bottom: -20px"
      >
        <el-form-item>
          <el-row justify="space-between" style="width: 100%">
            <el-col :span="6">
              <el-checkbox v-model="loginData.loginForm.rememberMe">
                {{ t('login.remember') }}
              </el-checkbox>
            </el-col>
            <el-col :offset="6" :span="12">
              <el-link style="float: right" type="primary">{{ t('login.forgetPassword') }}</el-link>
            </el-col>
          </el-row>
        </el-form-item>
      </el-col>
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item>
          <XButton
            :loading="loginLoading"
            :title="t('login.login')"
            class="w-[100%]"
            type="primary"
            @click="getCode()"
          />
        </el-form-item>
      </el-col>
      <Verify
        ref="verify"
        :captchaType="captchaType"
        :imgSize="{ width: '400px', height: '200px' }"
        mode="pop"
        @success="handleLogin"
      />

      <!-- 暂时隐藏 -->
      <!-- <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item>
          <el-row :gutter="5" justify="space-between" style="width: 100%">
            <el-col :span="8">
              <XButton
                :title="t('login.btnMobile')"
                class="w-[100%]"
                @click="setLoginState(LoginStateEnum.MOBILE)"
              />
            </el-col>
            <el-col :span="8">
              <XButton
                :title="t('login.btnQRCode')"
                class="w-[100%]"
                @click="setLoginState(LoginStateEnum.QR_CODE)"
              />
            </el-col>
            <el-col :span="8">
              <XButton
                :title="t('login.btnRegister')"
                class="w-[100%]"
                @click="setLoginState(LoginStateEnum.REGISTER)"
              />
            </el-col>
          </el-row>
        </el-form-item>
      </el-col>
      <el-divider content-position="center">{{ t('login.otherLogin') }}</el-divider>
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item>
          <div class="w-[100%] flex justify-between">
            <Icon
              v-for="(item, key) in socialList"
              :key="key"
              :icon="item.icon"
              :size="30"
              class="anticon cursor-pointer"
              color="#999"
              @click="doSocialLogin(item.type)"
            />
          </div>
        </el-form-item>
      </el-col>
      <el-divider content-position="center">萌新必读</el-divider>
      <el-col :span="24" style="padding-right: 10px; padding-left: 10px">
        <el-form-item>
          <div class="w-[100%] flex justify-between">
            <el-link href="https://doc.iocoder.cn/" target="_blank">📚开发指南</el-link>
            <el-link href="https://doc.iocoder.cn/video/" target="_blank">🔥视频教程</el-link>
            <el-link href="https://www.iocoder.cn/Interview/good-collection/" target="_blank">
              ⚡面试手册
            </el-link>
            <el-link href="http://static.yudao.iocoder.cn/mp/Aix9975.jpeg" target="_blank">
              🤝外包咨询
            </el-link>
          </div>
        </el-form-item>
      </el-col> -->
    </el-row>
  </el-form>
</template>

<script lang="ts" setup>
import { ElLoading } from 'element-plus'
import LoginFormTitle from './LoginFormTitle.vue'
import { useIcon } from '@/hooks/web/useIcon'
import { usePermissionStore } from '@/store/modules/permission'
import { LoginStateEnum, useFormValid, useLoginState } from './useLogin'
import * as authUtil from '@/utils/auth'
import * as LoginApi from '@/api/login'
import { queryUserTenantByName } from '@/api/system/tenant'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { FormRules } from 'element-plus'
import { debounce } from 'min-dash'

defineOptions({ name: 'LoginForm' })

const { t } = useI18n()
// const message = useMessage()
const iconOfficle = useIcon({ icon: 'ep:office-building' })
const iconAvatar = useIcon({ icon: 'ep:avatar' })
const iconLock = useIcon({ icon: 'ep:lock' })
const formLogin = ref()
const { validForm } = useFormValid(formLogin)
const { /* setLoginState, */ getLoginState } = useLoginState()
const { currentRoute, push } = useRouter()
const permissionStore = usePermissionStore()
const redirect = ref<string>('')
const loginLoading = ref(false)
const verify = ref()
const captchaType = ref('blockPuzzle') // blockPuzzle 滑块 clickWord 点击文字
const tenantList = ref<{ value: string; label: string }[]>([])
const invalidName = ref('') // 无效用户名时，验证错误信息的显示内容

const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN)

const LoginRules = reactive<FormRules<typeof loginData.loginForm>>({
  username: [
    required,
    {
      // 输入用户名后，获取对应的租户平台，如果没有，则说明该用户名无效
      asyncValidator: debounce((_rule: any, value: string, cb: (...arg: any[]) => void) => {
        // 更换用户名，清空原租户平台
        if (loginData.loginForm.tenantName) {
          loginData.loginForm.tenantName = ''
        }
        queryTenantList(value)
          .then(() => {
            cb()
          })
          .catch((e) => {
            cb(new Error(e.msg))
          })
      }, 500),
      trigger: 'change'
    }
  ],
  password: [{ ...required, trigger: 'blur' }],
  tenantName: [
    {
      required: true,
      message: '输入有效用户名后，选择租户平台'
    }
  ]
})
const loginData = reactive({
  isShowPassword: false,
  captchaEnable: import.meta.env.VITE_APP_CAPTCHA_ENABLE,
  tenantEnable: import.meta.env.VITE_APP_TENANT_ENABLE,
  loginForm: {
    username: '',
    password: '',
    tenantName: '',
    captchaVerification: '',
    rememberMe: true // 默认记录我。如果不需要，可手动修改
  }
})

// #region 三方登录方式
// const socialList = [
//   { icon: 'ant-design:wechat-filled', type: 30 },
//   { icon: 'ant-design:dingtalk-circle-filled', type: 20 },
//   { icon: 'ant-design:github-filled', type: 0 },
//   { icon: 'ant-design:alipay-circle-filled', type: 0 }
// ]
// #endregion

// 用户名输入事件
const onUserNameChange = (value: string) => {
  if (!value) loginData.loginForm.password = ''
}

// 获取验证码
const getCode = async () => {
  // 情况一，未开启：则直接登录
  if (loginData.captchaEnable === 'false') {
    await handleLogin({})
  } else {
    // 情况二，已开启：则展示验证码；只有完成验证码的情况，才进行登录
    // 弹出验证码
    verify.value.show()
  }
}

// 获取租户 ID
const getTenantId = async () => {
  if (loginData.tenantEnable === 'true') {
    const res = await LoginApi.getTenantIdByName(loginData.loginForm.tenantName)
    authUtil.setTenantId(res)
  }
}

// 记住我
const getLoginFormCache = () => {
  const loginForm = authUtil.getLoginForm()
  if (loginForm) {
    loginData.loginForm = {
      ...loginData.loginForm,
      username: loginForm.username ? loginForm.username : loginData.loginForm.username,
      password: loginForm.password ? loginForm.password : loginData.loginForm.password,
      rememberMe: loginForm.rememberMe,
      tenantName: loginForm.tenantName ? loginForm.tenantName : loginData.loginForm.tenantName
    }
  }
}

// 根据域名，获得租户信息
const getTenantByWebsite = async () => {
  const website = location.host
  const res = await LoginApi.getTenantByWebsite(website)
  if (res) {
    loginData.loginForm.tenantName = res.name
    authUtil.setTenantId(res.id)
  }
}

// 根据用户名，获取租户列表
const tenantLoading = ref(false)
const queryTenantList = async (userName: string) => {
  try {
    tenantLoading.value = true
    const { tenantDOList: list } = await queryUserTenantByName({ userName })
    tenantList.value = list.map(({ tenantName: name }) => ({ label: name, value: name }))
    loginData.loginForm.tenantName = tenantList.value[0]?.value
  } catch (error) {
    if (tenantList.value.length) {
      tenantList.value = []
    }
    if (loginData.loginForm.tenantName) {
      loginData.loginForm.tenantName = ''
    }
    return Promise.reject(error)
  } finally {
    tenantLoading.value = false
  }
}

const loading = ref() // ElLoading.service 返回的实例
// 登录
const handleLogin = async (params) => {
  const data = await validForm()
  if (!data) return
  try {
    await getTenantId()
    loginLoading.value = true
    loginData.loginForm.captchaVerification = params.captchaVerification
    const res = await LoginApi.login(loginData.loginForm)
    if (!res) return

    loading.value = ElLoading.service({
      lock: true,
      text: '正在加载系统中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    if (loginData.loginForm.rememberMe) {
      authUtil.setLoginForm(loginData.loginForm)
    } else {
      authUtil.removeLoginForm()
    }
    authUtil.setToken(res)
    if (!redirect.value) {
      redirect.value = '/'
    }
    // 判断是否为SSO登录
    if (redirect.value.indexOf('sso') !== -1) {
      window.location.href = window.location.href.replace('/login?redirect=', '')
    } else {
      push({ path: redirect.value || permissionStore.addRouters[0].path })
    }
  } finally {
    loginLoading.value = false
    loading.value?.close()
  }
}

// #region 社交登录
// const doSocialLogin = async (type: number) => {
//   if (type === 0) {
//     message.error('此方式未配置')
//   } else {
//     loginLoading.value = true
//     if (loginData.tenantEnable === 'true') {
//       // 尝试先通过 tenantName 获取租户
//       await getTenantId()
//       // 如果获取不到，则需要弹出提示，进行处理
//       if (!authUtil.getTenantId()) {
//         try {
//           const data = await message.prompt('请输入租户名称', t('common.reminder'))
//           if (data?.action !== 'confirm') throw 'cancel'
//           const res = await LoginApi.getTenantIdByName(data.value)
//           authUtil.setTenantId(res)
//         } catch (error) {
//           if (error === 'cancel') return
//         } finally {
//           loginLoading.value = false
//         }
//       }
//     }
//     // 计算 redirectUri
//     // tricky: type、redirect需要先encode一次，否则钉钉回调会丢失。
//     // 配合 Login/SocialLogin.vue#getUrlValue() 使用
//     const redirectUri =
//       location.origin +
//       '/social-login?' +
//       encodeURIComponent(`type=${type}&redirect=${redirect.value || '/'}`)

//     // 进行跳转
//     const res = await LoginApi.socialAuthRedirect(type, encodeURIComponent(redirectUri))
//     window.location.href = res
//   }
// }
// #endregion 社交登录

watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)

onBeforeMount(() => {
  // 提前准备 form 表单初始值（避免 validator change 带来的表单校验）
  getLoginFormCache()
})

onMounted(() => {
  getTenantByWebsite()

  // 提前获取用户对应的租户平台列表
  if (loginData.loginForm.username) {
    queryTenantList(loginData.loginForm.username)
  }
})
</script>

<style lang="scss" scoped>
:deep(.anticon) {
  &:hover {
    color: var(--el-color-primary) !important;
  }
}

.login-code {
  float: right;
  width: 100%;
  height: 38px;

  img {
    width: 100%;
    height: auto;
    max-width: 100px;
    vertical-align: middle;
    cursor: pointer;
  }
}

.circular {
  display: inline;
  width: 30px;
  height: 30px;
  animation: loading-rotate 2s linear infinite;
}

.path {
  animation: loading-dash 1.5s ease-in-out infinite;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  stroke-width: 2;
  stroke: var(--el-color-primary);
  stroke-linecap: round;
}
</style>
