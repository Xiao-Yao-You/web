<script setup lang="ts">
import { useIcon } from '@/hooks/web/useIcon'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import type { UploadProps, UploadUserFile } from 'element-plus'

defineOptions({
  name: 'BatchPicturesUploader'
})

const fileList = defineModel<UploadUserFile[]>('fileList', { type: Array, default: () => [] })

const PlusIcon = useIcon({ icon: 'ep:plus', size: 20 })
const { uploadUrl, httpRequest } = useUpload()

const dialogImageUrl = ref('')
const dialogVisible = ref(false)

const handleSuccess: UploadProps['onSuccess'] = (_response, _uploadFile, uploadFiles) => {
  fileList.value = uploadFiles.map((file) => ({
    name: file.name,
    url: (file.response as IResponse).data
  }))
}

const handlePictureCardPreview: UploadProps['onPreview'] = (uploadFile) => {
  dialogImageUrl.value = uploadFile.url!
  dialogVisible.value = true
}
</script>

<template>
  <div class="batch-pictures-uploader">
    <el-upload
      :file-list="fileList"
      :action="uploadUrl"
      list-type="picture-card"
      :http-request="httpRequest"
      :on-preview="handlePictureCardPreview"
      :on-success="handleSuccess"
      accept=".jpg, .png, .jpeg"
    >
      <PlusIcon />
    </el-upload>

    <el-dialog v-model="dialogVisible">
      <div class="text-center">
        <img width="400" height="auto" :src="dialogImageUrl" alt="Preview Image" />
      </div>
    </el-dialog>
  </div>
</template>
