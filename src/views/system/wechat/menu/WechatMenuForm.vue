<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="上级菜单">
        <el-tree-select
          v-model="formData.parentId"
          :data="menuTree"
          :default-expanded-keys="[0]"
          :props="defaultProps"
          check-strictly
          node-key="id"
        />
      </el-form-item>
      <el-form-item label="菜单名称" prop="name">
        <el-input v-model="formData.name" clearable placeholder="请输入菜单名称" />
      </el-form-item>
      <el-form-item label="菜单类型" prop="type">
        <el-radio-group v-model="formData.type">
          <el-radio-button
            v-for="dict in getIntDictOptions(DICT_TYPE.SYSTEM_MENU_TYPE)"
            :key="dict.label"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" label="菜单图标">
        <el-input v-model="formData.icon" clearable maxlength="30" style="width: 200px">
          <template #append>
            <el-tooltip effect="dark" content="点击查看 icon 图标" placement="top-start">
              <el-button :icon="SearchIcon" @click="toUrl" />
            </el-tooltip>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="formData.type === 2" label="路由地址" prop="path">
        <template #label>
          <Tooltip message="小程序的页面路由，以 / 开头" title="路由地址" />
        </template>
        <el-input v-model="formData.path" clearable placeholder="例如说：/pages/home/index" />
      </el-form-item>
      <!-- <el-form-item v-if="formData.type === 2" label="组件地址" prop="component">
        <el-input v-model="formData.component" clearable placeholder="例如说：system/user/index" />
      </el-form-item>
      <el-form-item v-if="formData.type === 2" label="组件名字" prop="componentName">
        <el-input v-model="formData.componentName" clearable placeholder="例如说：SystemUser" />
      </el-form-item> -->
      <el-form-item v-if="formData.type !== 1" label="权限标识" prop="permission">
        <template #label>
          <Tooltip message="例：system:user:list" title="权限标识" />
        </template>
        <el-input v-model="formData.permission" clearable placeholder="请输入权限标识" />
      </el-form-item>
      <el-form-item label="显示排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" clearable controls-position="right" />
      </el-form-item>
      <el-form-item label="菜单状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.label"
            :label="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" label="显示状态" prop="visible">
        <template #label>
          <Tooltip message="选择隐藏时，路由将不会出现在主页，但仍然可以访问" title="显示状态" />
        </template>
        <el-radio-group v-model="formData.visible">
          <el-radio key="true" :label="true" border>显示</el-radio>
          <el-radio key="false" :label="false" border>隐藏</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="formData.type !== 3" label="背景色" prop="bgcolor">
        <template #label>
          <Tooltip message="主页菜单的背景色，例：#ffffff" title="背景色" />
        </template>
        <el-input
          v-model="formData.bgcolor"
          clearable
          placeholder="例：#ffffff"
          style="width: 200px"
        />
      </el-form-item>
      <!-- <el-form-item v-if="formData.type !== 3" label="总是显示" prop="alwaysShow">
        <template #label>
          <Tooltip
            message="选择不是时，当该菜单只有一个子菜单时，不展示自己，直接展示子菜单"
            title="总是显示"
          />
        </template>
        <el-radio-group v-model="formData.alwaysShow">
          <el-radio key="true" :label="true" border>总是</el-radio>
          <el-radio key="false" :label="false" border>不是</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <!-- <el-form-item v-if="formData.type === 2" label="缓存状态" prop="keepAlive">
        <template #label>
          <Tooltip
            message="选择缓存时，则会被 `keep-alive` 缓存，必须填写「组件名称」字段"
            title="缓存状态"
          />
        </template>
        <el-radio-group v-model="formData.keepAlive">
          <el-radio key="true" :label="true" border>缓存</el-radio>
          <el-radio key="false" :label="false" border>不缓存</el-radio>
        </el-radio-group>
      </el-form-item> -->
    </el-form>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { CommonStatusEnum, SystemMenuTypeEnum } from '@/utils/constants'
import { defaultProps, handleTree } from '@/utils/tree'
import { useIcon } from '@/hooks/web/useIcon'
import {
  getWechatMenusLevels,
  getWechatMenu,
  createWechatMenu,
  updateWechatMenu
} from '@/api/system/menu-wechat'
import type { MenuVO } from '@/api/system/menu'

defineOptions({ name: 'SystemWechatMenuForm' })

const { wsCache } = useCache()
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const SearchIcon = useIcon({ icon: 'ep:search' })

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: '',
  permission: '',
  type: SystemMenuTypeEnum.DIR,
  sort: Number(undefined),
  parentId: 0,
  path: '',
  icon: '',
  component: '',
  componentName: '',
  status: CommonStatusEnum.ENABLE,
  visible: true,
  keepAlive: false,
  alwaysShow: true,
  bgcolor: '#40a9ff'
})
const formRules = reactive({
  name: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
  sort: [{ required: true, message: '菜单顺序不能为空', trigger: 'blur' }],
  path: [{ required: true, message: '路由地址不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
  bgcolor: [
    { pattern: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, message: '颜色格式不正确', trigger: 'blur' }
  ]
})
const formRef = ref() // 表单 Ref

const toUrl = () => {
  window.open('https://uviewui.com/components/icon.html', '_target')
}

/** 打开弹窗 */
const open = async (type: string, id?: number, parentId?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (parentId) {
    formData.value.parentId = parentId
  }
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await getWechatMenu(id)
    } finally {
      formLoading.value = false
    }
  }
  // 获得菜单列表
  await getTree()
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
    if (formData.value.type === SystemMenuTypeEnum.MENU) {
      if (formData.value.path.charAt(0) !== '/') return message.error('路径必须以 / 开头')
    }
    const data = formData.value as unknown as MenuVO
    if (formType.value === 'create') {
      await createWechatMenu(data)
      message.success(t('common.createSuccess'))
    } else {
      await updateWechatMenu(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
    // 清空，从而触发刷新
    wsCache.delete(CACHE_KEY.ROLE_ROUTERS)
  }
}

/** 获取下拉框[上级菜单]的数据  */
const menuTree = ref<Tree[]>([]) // 树形结构
const getTree = async () => {
  menuTree.value = []
  const res = await getWechatMenusLevels()
  let menu: Tree = { id: 0, name: '主类目', children: [] }
  menu.children = handleTree(res)
  menuTree.value.push(menu)
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: '',
    permission: '',
    type: SystemMenuTypeEnum.DIR,
    sort: Number(undefined),
    parentId: 0,
    path: '',
    icon: '',
    component: '',
    componentName: '',
    status: CommonStatusEnum.ENABLE,
    visible: true,
    keepAlive: false,
    alwaysShow: true,
    bgcolor: '#40a9ff'
  }
  formRef.value?.resetFields()
}

/** 判断 path 是不是外部的 HTTP 等链接 */
const isExternal = (path: string) => {
  return /^(https?:|mailto:|tel:)/.test(path)
}
</script>
