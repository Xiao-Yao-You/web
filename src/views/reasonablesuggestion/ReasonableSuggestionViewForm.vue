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
          disabled
        />
      </el-form-item>
      <el-form-item label="建议类型" prop="suggestionType">
        <el-select v-model="formData.suggestionType" placeholder="请选择建议类型" disabled>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.SUGGESTION_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
        /></el-select>
      </el-form-item>
      <el-form-item label="申报人" prop="nickname" v-if="isanonymous">
        <el-input v-model="formData.nickname" placeholder="请选择申报人" disabled />
      </el-form-item>
      <el-form-item label="申报人工号" prop="workNum" v-if="isanonymous">
        <el-input v-model="formData.workNum" placeholder="请输入申报人工号" disabled />
      </el-form-item>
      <el-form-item label="是否匿名" prop="anonymous">
        <el-radio-group v-model="formData.anonymous" @change="handleRadioChange" disabled>
          <el-radio label="1">是</el-radio>
          <el-radio label="2">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="手机号" prop="phoneNum">
        <el-input v-model="formData.phoneNum" placeholder="请输入手机号" disabled />
      </el-form-item>
      <el-form-item label="申报部门" prop="deptId">
        <el-tree-select
          v-model="formData.deptId"
          :data="depts"
          :props="defaultProps"
          check-strictly
          node-key="id"
          disabled
          placeholder="请选择归属部门"
        />
      </el-form-item>
      <el-form-item label="问题描述" prop="problemDescription">
        <el-input
          type="textarea"
          v-model="formData.problemDescription"
          placeholder="请输入问题描述"
          maxlength="200"
          :autosize="{ minRows: 3 }"
          disabled
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
          disabled
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
          disabled
        />
      </el-form-item>

      <el-form-item label="附件地址" prop="fileList">
        <BatchPicturesUploader
          v-model:fileList="formData.fileList"
          :limit-size="{ size: 5, unit: 'MB' }"
          disabled
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button
        @click="examine(3)"
        v-if="formType == '审核'"
        type="primary"
        :disabled="formLoading"
        >不 采 纳</el-button
      >
      <el-button
        @click="examine(2)"
        v-if="formType == '审核'"
        type="primary"
        :disabled="formLoading"
        >采 纳</el-button
      >
      <el-button @click="dialogVisible = false">返 回</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { ReasonableSuggestionApi, ReasonableSuggestionVO } from '@/api/reasonablesuggestion'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'
import { getDeptsByUserId } from '@/api/system/dept'
import { defaultProps, handleTree } from '@/utils/tree'
import type { UploadFiles } from 'element-plus'
import { BatchPicturesUploader } from '@/components/BatchPicturesUploader'

/** 合理化建议 表单 */
defineOptions({ name: 'ReasonableSuggestionViewForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const isanonymous = ref(true)

const userInfo = useUserStore().getUser
const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改

const depts = ref<Tree[]>([])

const formData = ref({
  id: undefined as unknown as number,
  title: undefined,
  suggestionType: undefined,
  userId: undefined as unknown as number,
  nickname: undefined as unknown as string,
  workNum: undefined as unknown as string,
  phoneNum: undefined as unknown as string,
  deptId: undefined as unknown as number,
  deptName: undefined as unknown as string,
  problemDescription: undefined,
  solution: undefined,
  effectEstimation: undefined,
  status: undefined,
  anonymous: '2', //默认不匿名
  filePath: undefined as unknown as string,
  fileList: []
})
const formRules = reactive({
  title: [{ required: true, message: '建议主题不能为空', trigger: 'blur' }],
  suggestionType: [{ required: true, message: '建议类型不能为空', trigger: 'change' }],
  deptId: [{ required: true, message: '部门不能为空', trigger: 'change' }],
  problemDescription: [{ required: true, message: '问题描述不能为空', trigger: 'blur' }],
  solution: [{ required: true, message: '解决方案不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type
  formType.value = type
  resetForm()
  // 查询当前用户所在的部门列表
  const deptList = await getDeptsByUserId(userInfo.id)
  depts.value = handleTree(deptList)
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await ReasonableSuggestionApi.get(id)
      if (formData.value.anonymous === '1') {
        isanonymous.value = false
      } else {
        isanonymous.value = true
      }
    } finally {
      formLoading.value = false
    }
  } else {
    formData.value.userId = userInfo.id
    formData.value.nickname = userInfo.nickname
    formData.value.workNum = userInfo.username
    formData.value.phoneNum = userInfo.mobile
  }
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

const examine = async (examineType: number) => {
  formLoading.value = true
  try {
    dialogVisible.value = false
    await ReasonableSuggestionApi.examine(formData.value.id, examineType)
    message.success('审核成功')
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as ReasonableSuggestionVO
    if (formType.value === 'create') {
      await ReasonableSuggestionApi.create(data)
      message.success(t('common.createSuccess'))
    } else {
      await ReasonableSuggestionApi.update(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

//单选change事件
const handleRadioChange = (value: string) => {
  isanonymous.value = value == '1' ? false : true
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined as unknown as number,
    title: undefined,
    suggestionType: undefined,
    userId: undefined as unknown as number,
    nickname: undefined as unknown as string,
    workNum: undefined as unknown as string,
    phoneNum: undefined as unknown as string,
    deptId: undefined as unknown as number,
    deptName: undefined as unknown as string,
    problemDescription: undefined,
    solution: undefined,
    effectEstimation: undefined,
    status: undefined,
    anonymous: '2',
    filePath: undefined as unknown as string,
    fileList: []
  }
  formRef.value?.resetFields()
}
</script>
