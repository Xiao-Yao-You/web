<template>
  <Dialog
    :title="`设备报废${isScrapped ? '信息' : ''}`"
    v-model="dialogVisible"
    scroll
    :close-on-click-modal="isScrapped"
    :close-on-press-escape="isScrapped"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :disabled="isScrapped"
    >
      <el-form-item label="设备名称" prop="name">
        <el-input :model-value="formData.name" disabled />
      </el-form-item>
      <el-form-item label="设备编码" prop="code">
        <el-input :model-value="formData.code" disabled />
      </el-form-item>
      <el-form-item label="报废处理人" prop="scrapUser">
        <el-input :model-value="formData.scrapUser.nickname" disabled />
      </el-form-item>
      <el-form-item label="报废时间" prop="scrapDate">
        <el-date-picker
          v-model="formData.scrapDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择报废日期"
          :clearable="false"
        />
      </el-form-item>
      <el-form-item label="报废类型" prop="scrapType">
        <el-select v-model="formData.scrapType" placeholder="请选择报废类型" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.REPAIR_DEVICE_SCRAP_TYPE)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="处理方式" prop="scrapDealType">
        <el-select v-model="formData.scrapDealType" placeholder="请选择处理方式" clearable>
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.REPAIR_DEVICE_SCRAP_METHOD)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="报废说明" prop="scrapRemark">
        <el-input
          v-model="formData.scrapRemark"
          type="textarea"
          :rows="2"
          placeholder="请输入报废说明"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="报废照片" prop="pictureList">
        <BatchPicturesUploader
          v-model:fileList="formData.pictureList"
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
import { scrapDevice, getRepairArchive } from '@/api/repair'
import { BatchPicturesUploader } from '@/components/BatchPicturesUploader'
import { PictureType, UsingStatus } from '@/api/repair/constant'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'
import { formatDate } from '@/utils/formatTime'
import { dateTransfer } from '@/views/system/meeting/subscribe/hook/useMeetingStatus'
import type { UserVO } from '@/store/modules/user'
import type { UploadFiles } from 'element-plus'

/** 报废表单 */
defineOptions({ name: 'ScrapForm' })

const message = useMessage() // 消息弹窗
const userInfo = useUserStore().getUser

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const isScrapped = ref()
const formData = ref({
  id: undefined as unknown as number,
  code: '',
  name: '',
  scrapDate: formatDate(new Date(), 'YYYY-MM-DD'),
  scrapType: undefined as unknown as number,
  scrapUser: undefined as unknown as UserVO,
  scrapDealType: undefined as unknown as number,
  scrapRemark: '',
  pictureList: undefined as unknown as UploadFiles
})
const formRules = reactive({
  scrapType: [{ required: true, message: '报废类型不能为空', trigger: 'blur' }],
  scrapDealType: [{ required: true, message: '处理方式不能为空', trigger: 'blur' }],
  scrapRemark: [{ required: true, message: '报废说明不能为空', trigger: 'blur' }],
  pictureList: [{ required: true, message: '报废图片不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async ({ code, name, id, status }) => {
  resetForm()
  dialogVisible.value = true
  isScrapped.value = status === UsingStatus.Scrap
  Object.assign(formData.value, {
    id,
    code,
    name,
    scrapUser: {
      id: userInfo.id,
      nickname: userInfo.nickname
    }
  })
  // 已报废则回显报废信息
  if (isScrapped.value) {
    try {
      const res = await getRepairArchive(id)
      Object.assign(formData.value, {
        scrapDate: dateTransfer(res.scrapDate),
        scrapType: +res.scrapType,
        scrapUser: { id: res.scrapUserId, nickname: res.scrapUserName },
        scrapDealType: +res.scrapDealType,
        scrapRemark: res.scrapRemark,
        pictureList: res.scrapPictureList
      })
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  await formRef.value.validate()
  const { code, name, scrapUser, pictureList, ...rest } = formData.value
  const data = {
    ...rest,
    scrapUserId: scrapUser.id,
    pictureList: pictureList.map((p) => ({
      name: p.name,
      url: p.url!,
      type: PictureType.Scrap
    }))
  }
  formLoading.value = true
  try {
    await scrapDevice(data)
    message.success('设备报废成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined as unknown as number,
    code: '',
    name: '',
    scrapDate: formatDate(new Date(), 'YYYY-MM-DD'),
    scrapType: undefined as unknown as number,
    scrapUser: undefined as unknown as UserVO,
    scrapDealType: undefined as unknown as number,
    scrapRemark: '',
    pictureList: undefined as unknown as UploadFiles
  }
  formRef.value?.resetFields()
}
</script>
