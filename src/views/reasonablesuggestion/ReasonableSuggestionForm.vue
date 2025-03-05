<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="建议主题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入建议主题"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="建议类型" prop="suggestionType">
        <el-select v-model="formData.suggestionType" placeholder="请选择建议类型">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SUGGESTION_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
        /></el-select>
      </el-form-item>
      <el-form-item label="是否匿名" prop="anonymous">
        <el-radio-group v-model="formData.anonymous">
          <el-radio :label="Anonymous.Yes">是</el-radio>
          <el-radio :label="Anonymous.No">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="isRealName" label="申报人" prop="nickname">
        <el-input v-model="formData.nickname" placeholder="请选择申报人" disabled />
      </el-form-item>
      <el-form-item v-if="isRealName" label="申报人工号" prop="workNum">
        <el-input v-model="formData.workNum" placeholder="请输入申报人工号" disabled />
      </el-form-item>
      <el-form-item label="手机号" prop="phoneNum">
        <el-input v-model="formData.phoneNum" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="建议部门" prop="deptName">
        <el-input
          v-model="formData.deptName"
          placeholder="想给哪个部门提建议？"
          maxlength="30"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="问题描述" prop="problemDescription">
        <el-input
          type="textarea"
          v-model="formData.problemDescription"
          placeholder="请输入问题描述"
          maxlength="200"
          :autosize="{ minRows: 3 }"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="解决方案" prop="solution">
        <el-input
          type="textarea"
          v-model="formData.solution"
          placeholder="请输入解决方案"
          maxlength="200"
          :autosize="{ minRows: 3 }"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="效果预估" prop="effectEstimation">
        <el-input
          type="textarea"
          v-model="formData.effectEstimation"
          placeholder="请输入效果预估"
          maxlength="200"
          :autosize="{ minRows: 3 }"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="图片附件" prop="fileList">
        <BatchPicturesUploader
          v-model:fileList="formData.fileList"
          :limit-size="{ size: 5, unit: 'MB' }"
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
import {
  Anonymous,
  ReasonableSuggestionApi,
  ReasonableSuggestionVO
} from '@/api/reasonablesuggestion'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { BatchPicturesUploader } from '@/components/BatchPicturesUploader'
import { UserVO } from '@/store/modules/user'
import { ElMessageBox, type Action, type UploadFiles } from 'element-plus'

/** 合理化建议 表单 */
defineOptions({ name: 'ReasonableSuggestionForm' })

const { t } = useI18n()
const message = useMessage()
const emit = defineEmits(['query', 'success'])

const props = defineProps({
  userInfo: {
    type: Object as PropType<UserVO>,
    required: true
  }
})

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  title: '',
  suggestionType: undefined,
  nickname: '',
  workNum: '',
  phoneNum: undefined,
  deptName: '',
  problemDescription: '',
  solution: '',
  effectEstimation: '',
  status: undefined,
  anonymous: Anonymous.No, //默认不匿名
  filePath: undefined,
  fileList: [] as UploadFiles
} as unknown as ReasonableSuggestionVO)

const formRules = reactive({
  title: [{ required: true, message: '建议主题不能为空', trigger: 'blur' }],
  suggestionType: [{ required: true, message: '建议类型不能为空', trigger: 'change' }],
  deptName: [{ required: true, message: '部门不能为空', trigger: 'change' }],
  problemDescription: [{ required: true, message: '问题描述不能为空', trigger: 'blur' }],
  solution: [{ required: true, message: '解决方案不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

const isRealName = computed(() => formData.value.anonymous === Anonymous.No)

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  if (id) {
    // 编辑
    formLoading.value = true
    try {
      const info = await ReasonableSuggestionApi.get(id)
      Object.assign(formData.value, info)
    } catch (e) {
      ElMessageBox.alert('查询失败，请确认建议是否存在或已删除。', '系统提示', {
        confirmButtonText: '刷新列表',
        type: 'error',
        callback: (action: Action) => {
          if (action === 'confirm') emit('query')
          dialogVisible.value = false
        }
      })
    } finally {
      formLoading.value = false
    }
  } else {
    // 新增
    Object.assign(formData.value, {
      nickname: props.userInfo.nickname,
      workNum: props.userInfo.username,
      phoneNum: props.userInfo.mobile
    })
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const submitForm = async () => {
  await formRef.value.validate()
  formLoading.value = true
  // 处理匿名
  if (!isRealName.value) {
    formData.value.nickname = '匿名'
    formData.value.workNum = '匿名'
  }
  try {
    if (formType.value === 'create') {
      await ReasonableSuggestionApi.create(formData.value)
      message.success(t('common.createSuccess'))
    } else {
      await ReasonableSuggestionApi.update(formData.value)
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
    title: '',
    suggestionType: undefined,
    nickname: '',
    workNum: '',
    phoneNum: undefined,
    deptName: '',
    problemDescription: '',
    solution: '',
    effectEstimation: '',
    status: undefined,
    anonymous: Anonymous.No,
    filePath: undefined,
    fileList: [] as UploadFiles
  } as unknown as ReasonableSuggestionVO

  formRef.value?.resetFields()
}
</script>
