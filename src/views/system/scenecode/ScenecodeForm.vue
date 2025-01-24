<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="编码编号" prop="keyCode">
        <el-input v-model="formData.keyCode" placeholder="请输入编码编号" />
      </el-form-item>
      <el-form-item label="编码名称" prop="description">
        <el-input v-model="formData.description" placeholder="请输入编码名称" />
      </el-form-item>
      <el-form-item label="编码类型" prop="codeType">
        <el-select v-model="formData.codeType" placeholder="请选择建议类型">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.CODE_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
        /></el-select>
      </el-form-item>
      <el-form-item label="前缀" prop="prefix">
        <el-input v-model="formData.prefix" placeholder="请输入编码前缀" />
      </el-form-item>
      <el-form-item label="中缀" prop="infix">
        <el-select v-model="formData.infix" placeholder="请输入编码中缀">
          <el-option
            v-for="item in FixOptions.infixOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="后缀" prop="suffix">
        <el-select v-model="formData.suffix" placeholder="请输入编码后缀">
          <el-option
            v-for="item in FixOptions.suffixOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="编码规则" prop="type">
        <el-select v-model="formData.type" placeholder="请选择编码规则">
          <el-option
            v-for="item in FixOptions.sceneType"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="起始值" prop="start">
        <el-input-number v-model="formData.start" :min="1" />
      </el-form-item>
      <el-form-item label="步长" prop="step">
        <el-input-number v-model="formData.step" :min="1" />
      </el-form-item>
      <el-form-item label="是否启用" prop="status">
        <el-switch
          v-model="formData.status"
          :active-value="FixOptions.EnableEnums.enable"
          :inactive-value="FixOptions.EnableEnums.disable"
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
import { SceneCodeApi, SceneCodeVO } from '@/api/system/scenecode'
import * as FixOptions from './constant'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

/** 单据编码类型配置 表单 */
defineOptions({ name: 'SceneCodeForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  keyCode: undefined,
  description: undefined,
  prefix: undefined,
  codeType: undefined,
  infix: FixOptions.infixOptions[0].value,
  suffix: FixOptions.suffixOptions[0].value,
  type: FixOptions.sceneType[2].value,
  start: 1,
  step: 1,
  status: FixOptions.EnableEnums.enable
} as unknown as SceneCodeVO)
const formRules = reactive({
  keyCode: [{ required: true, message: '编码编号不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '编码名称不能为空', trigger: 'blur' }],
  prefix: [{ required: true, message: '编码前缀不能为空', trigger: 'blur' }],
  codeType: [{ required: true, message: '编码类型不能为空', trigger: 'blur' }]
})
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
      formData.value = await SceneCodeApi.getSceneCodeById(id)
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
    const data = formData.value
    if (formType.value === 'create') {
      await SceneCodeApi.createSceneCode(data)
      message.success(t('common.createSuccess'))
    } else {
      await SceneCodeApi.updateSceneCode(data)
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
    keyCode: undefined,
    description: undefined,
    prefix: undefined,
    codeType: undefined,
    infix: FixOptions.infixOptions[0].value,
    suffix: FixOptions.suffixOptions[0].value,
    type: FixOptions.sceneType[2].value,
    start: 1,
    step: 1,
    status: FixOptions.EnableEnums.enable
  } as unknown as SceneCodeVO

  formRef.value?.resetFields()
}
</script>
