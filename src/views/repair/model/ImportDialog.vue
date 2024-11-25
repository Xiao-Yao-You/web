<template>
  <Dialog v-model="dialogVisible" title="用户导入" width="500">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="importUrl + '?updateSupport=' + updateSupport"
      :auto-upload="false"
      :disabled="formLoading"
      :headers="uploadHeaders"
      :limit="1"
      :on-success="onSubmitSuccess"
      :on-error="onSubmitError"
      :on-exceed="onFileExceed"
      accept=".xlsx, .xls"
      drag
    >
      <!-- excel 上传 -->
      <Icon icon="ep:upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>

      <!-- 模板下载 -->
      <template #tip>
        <div class="el-upload__tip text-center">
          <div class="el-upload__tip">
            <el-checkbox v-model="updateSupport" />
            是否更新已经存在的用户数据
          </div>
          <span>仅允许导入 xls、xlsx 格式文件。</span>
          <el-link
            class="align-baseline text-xs"
            :underline="false"
            type="primary"
            @click="importExcelTemp"
          >
            下载模板
          </el-link>
        </div>
      </template>
    </el-upload>

    <!-- 操作栏 -->
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import {
  ElMessageBox,
  type UploadInstance,
  type UploadProps,
  type UploadUserFile
} from 'element-plus'
import download from '@/utils/download'
import { getAccessToken, getTenantId } from '@/utils/auth'
import { getModelExcelTemp } from '@/api/repair'

defineOptions({ name: 'RepairModalImport' })

const message = useMessage()

// #region 对话框初始化
const dialogVisible = ref(false)
const open = () => {
  dialogVisible.value = true
  updateSupport.value = 0
  fileList.value = []
  resetForm()
}
defineExpose({ open })
// #endregion

// #region 提交 excel 表单
const resetForm = async () => {
  formLoading.value = false
  await nextTick()
  uploadRef.value?.clearFiles()
}

// 手动出发 upload 上传
const submitForm = () => {
  if (!fileList.value.length) return message.error('请上传文件')
  setUploadHeaders()
  formLoading.value = true
  uploadRef.value!.submit()
}
// #endregion

// #region 文件上传与下载
// prettier-ignore
const importUrl = import.meta.env.VITE_BASE_URL + import.meta.env.VITE_API_URL + '/operation-device-model/import-excel'
const uploadHeaders = ref({}) // 上传的请求头部
const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadUserFile[]>([])
const updateSupport = ref(0) // 是否更新已经存在的用户数据
const formLoading = ref(false)

// 配置上传请求头
const setUploadHeaders = () => {
  uploadHeaders.value = {
    Authorization: 'Bearer ' + getAccessToken(),
    'tenant-id': getTenantId()
  }
}

const emits = defineEmits(['success'])
// 手动触发 submitForm() 成功后执行
const onSubmitSuccess: UploadProps['onSuccess'] = (response, uploadFile, uploadFiles) => {
  if (response.code) {
    message.error(response.msg)
    formLoading.value = false
    return
  }
  const { createList, failureList, updateList } = response.data
  ElMessageBox.alert(
    `<p>上传成功：${createList.length} 条</p>
      <p>更新成功：${Object.keys(failureList).length} 条</p>
      <p>更新失败：${updateList.length} 条</p>`,
    '上传信息',
    { dangerouslyUseHTMLString: true }
  )
  formLoading.value = false
  dialogVisible.value = false

  emits('success')
}

const onSubmitError: UploadProps['onError'] = () => {
  message.error('上传失败，请重新上传！')
  formLoading.value = false
}

const onFileExceed: UploadProps['onExceed'] = () => message.error('最多只能上传一个文件！')

const importExcelTemp = async () => {
  const res = await getModelExcelTemp()
  download.excel(res, '设备型号导入模版.xls')
}
// #endregion
</script>
