<script setup lang="ts">
import { useIcon } from '@/hooks/web/useIcon'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import type { UploadProps, UploadUserFile, UploadFile } from 'element-plus'

defineOptions({
  name: 'BatchPicturesUploader'
})

const message = useMessage()

const props = withDefaults(
  defineProps<{
    limitSize: { size: number; unit: 'KB' | 'MB' } // 文件大小限制，默认 0，不限制
    disabled?: boolean // 是否禁用
  }>(),
  {
    limitSize: () => ({ size: 0, unit: 'KB' }),
    disabled: false
  }
)

const fileList = defineModel<Array<UploadUserFile | UploadFile>>('fileList', {
  type: Array,
  default: () => [],
  get(value) {
    return value || []
  }
})

const PlusIcon = useIcon({ icon: 'ep:plus', size: 20 })
const { uploadUrl, httpRequest } = useUpload()

const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// 处理文件大小
const handleFileSize = (fileSize: number) => {
  const size =
    props.limitSize.unit === 'KB'
      ? (fileSize / 1024).toFixed(2)
      : (fileSize / 1024 / 1024).toFixed(2)

  if (+size > props.limitSize.size) {
    message.error(`文件大小不能超过 ${props.limitSize.size} ${props.limitSize.unit}！`)
    return false
  } else {
    return true
  }
}

// 文件上传前的操作
const handleBeforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  return handleFileSize(rawFile.size)
}

const handleSuccess: UploadProps['onSuccess'] = (_response, _uploadFile, uploadFiles) => {
  fileList.value = uploadFiles.map((file) => {
    return {
      name: file.name,
      url: (file?.response as IResponse)?.data ?? file?.url
    }
  })
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}
</script>

<template>
  <div class="batch-pictures-uploader relative">
    <!-- disbaled 遮罩层 -->
    <div
      v-if="props.disabled"
      class="absolute top-0 left-0 w-full h-full cursor-not-allowed z-1"
    ></div>

    <!-- 上传组件 -->
    <el-upload
      :file-list="fileList"
      :action="uploadUrl"
      list-type="picture-card"
      :http-request="httpRequest"
      :on-preview="handlePictureCardPreview"
      :on-success="handleSuccess"
      :before-upload="handleBeforeUpload"
      accept=".jpg, .png, .jpeg"
    >
      <PlusIcon />
    </el-upload>

    <!-- 预览 -->
    <el-dialog v-model="dialogVisible">
      <div class="text-center">
        <img width="400" height="auto" :src="dialogImageUrl" alt="Preview Image" />
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.disabled {
  &:hover {
    cursor: not-allowed;
  }
}
</style>
