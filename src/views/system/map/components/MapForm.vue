<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :disabled="isDetail"
    >
      <el-form-item v-if="isDetail" label="地点编码" prop="code">
        <el-input v-model="formData.code" />
      </el-form-item>
      <el-form-item label="所属园区" prop="zoneType">
        <el-select v-model="formData.zoneType">
          <el-option :label="t(`map.${ZoneType['00']}`)" :value="ZoneType.NanTong" />
        </el-select>
      </el-form-item>
      <el-form-item label="所属厂区" prop="factoryCode">
        <el-select v-model="formData.factoryCode">
          <el-option
            v-for="opt in FactoryOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="地点类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择类型" @change="onTypeChange">
          <el-option
            v-for="opt in categoryOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="提货地名" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入财务提货单上的地点名称"
          clearable
          show-word-limit
          maxlength="20"
        />
      </el-form-item>
      <el-form-item label="墙标名" prop="markName">
        <el-input
          v-model="formData.markName"
          placeholder="请输入建筑物上标记的名称"
          clearable
          show-word-limit
          maxlength="20"
        />
      </el-form-item>
      <el-form-item label="别名" prop="alias">
        <el-input
          v-model="formData.alias"
          placeholder="请输入地点的常用别名"
          clearable
          show-word-limit
          maxlength="20"
        />
      </el-form-item>
      <el-form-item label="GPS 经度" prop="longitude">
        <el-input v-model="formData.longitude" placeholder="请输入 WGS84 坐标系经度" />
      </el-form-item>
      <el-form-item label="GPS 纬度" prop="latitude">
        <el-input v-model="formData.latitude" placeholder="请输入 WGS84 坐标系纬度" />
      </el-form-item>
      <el-form-item prop="sort" class="sort-item" label="排序权重">
        <el-input v-model="formData.sort" clearable class="!w-100px sort-input">
          <template #prefix>{{ sortPrefix }}</template>
        </el-input>
      </el-form-item>
      <el-form-item label="启用状态" prop="status">
        <el-switch
          v-model="formData.status"
          :active-value="CommonStatusEnum.ENABLE"
          :inactive-value="CommonStatusEnum.DISABLE"
        />
      </el-form-item>
      <el-form-item label="地点图片" prop="image" class="sort-item">
        <el-upload
          :action="uploadUrl"
          :class="['img-uploader', 'relative', 'overflow-hidden', { 'is-disabled': isDetail }]"
          :show-file-list="false"
          :data="imageData"
          :on-change="onImageChange"
          :on-error="onImageError"
          :on-success="onImageSuccess"
          :http-request="httpRequest"
          accept=".jpg, .png, .jpeg"
        >
          <img v-if="formData.image" :src="formData.image" />
          <el-icon v-else class="img-uploader-icon text-center"><PlusIcon /></el-icon>
        </el-upload>
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
  updateMapPoint,
  createMapPoint,
  getMapPoint,
  ZoneType,
  FactoryOptions,
  type MapPoint
} from '@/api/system/map'
import { pickBy } from 'lodash-es'
import { CommonStatusEnum } from '@/utils/constants'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import { useIcon } from '@/hooks/web/useIcon'

/** 厂区地图定位详细信息 表单 */
defineOptions({ name: 'MapForm' })

withDefaults(defineProps<{ categoryOptions: Array<{ label: string; value: string | number }> }>(), {
  categoryOptions: () => []
})

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const sortPrefix = ref('') // 权重前缀（地点类型）
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改；detail - 详情
const formData = ref<Partial<MapPoint>>({
  id: undefined,
  code: undefined,
  zoneType: ZoneType.NanTong,
  factoryCode: undefined,
  type: undefined,
  longitude: undefined,
  latitude: undefined,
  name: '',
  markName: '',
  alias: '',
  status: CommonStatusEnum.ENABLE,
  sort: undefined,
  image: ''
})
const formRef = ref() // 表单 Ref
const formRules = reactive({
  factoryCode: [{ required: true, message: '所属厂区不能为空' }],
  name: [{ required: true, message: '提货地名不能为空' }],
  markName: [{ required: true, message: '墙标名不能为空' }],
  type: [{ required: true, message: '地点类型不能为空' }],
  sort: [
    { required: true, message: '排序不能为空' },
    { pattern: /^(0|[1-9]\d*)$/, message: '必须是大于或等于0的整数' },
    {
      validator(_rule, _value, cb: Function) {
        if (formData.value.type) return cb()
        cb(new Error('请先选择地点类型'))
      }
    }
  ],
  longitude: [
    { required: true, message: '经度不能为空' },
    { pattern: /^(-?\d{1,2}|1[0-7]\d|\d)(\.\d+)?$/, message: '经度格式不正确' },
    { pattern: /^\d+\.\d{0,16}$/, message: '最多16位小数' }
  ],
  latitude: [
    { required: true, message: '纬度不能为空' },
    { pattern: /^(-?\d{1,2}|[0-8]\d)(\.\d+)?$/, message: '纬度格式不正确' },
    { pattern: /^\d+\.\d{0,16}$/, message: '最多16位小数' }
  ]
})

// 是否是查看详情
const isDetail = computed(() => formType.value === 'detail')

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
      const info = await getMapPoint(id)
      formData.value = info
      sortPrefix.value = +info.type + '-'
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

// 地点类型 change 事件
const onTypeChange = (type: string) => {
  sortPrefix.value = `${Number(type)}-`
  formRef.value?.resetFields(['sort'])
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value?.validate()
  // 提交请求
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      const data = pickBy(formData.value, (_value, key) => key !== 'id') as Omit<MapPoint, 'id'>
      if (data.sort) data.sort = Number(data.sort)
      await createMapPoint(data)
      message.success(t('common.createSuccess'))
    } else {
      await updateMapPoint(formData.value as MapPoint)
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
    code: undefined,
    zoneType: ZoneType.NanTong,
    factoryCode: undefined,
    type: undefined,
    name: '',
    markName: '',
    alias: '',
    longitude: undefined,
    latitude: undefined,
    status: CommonStatusEnum.ENABLE,
    sort: undefined,
    image: ''
  }
  formRef.value?.resetFields()
  sortPrefix.value = ''
  imageData.value.path = ''
}

//#region 图片上传
const imageData = ref({ path: '' })
const PlusIcon = useIcon({ icon: 'ep:plus' })
const { uploadUrl, httpRequest } = useUpload()

/** 处理上传的文件发生变化 */
const onImageChange = (file) => {
  imageData.value.path = file.name
}

/** 上传错误提示 */
const onImageError = (): void => {
  formData.value.image = ''
  imageData.value.path = ''
  message.error('上传失败，请您重新上传！')
}

const onImageSuccess = (response: IResponse) => {
  formData.value.image = response.data || ''
  message.success('上传成功')
}
//#endregion
</script>

<style scoped lang="scss">
.sort-item {
  :deep(label > .el-icon) {
    position: relative;
    top: 8px;
    left: 3px;
  }

  .sort-input:deep(.el-input__prefix) {
    color: var(--el-input-text-color, var(--el-text-color-regular));
  }
}

.img-uploader {
  :deep(.el-upload) {
    cursor: pointer;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }

  &.is-disabled :deep(.el-upload) {
    cursor: not-allowed;

    &:hover {
      border-color: var(--el-border-color);
    }
  }

  img {
    width: 120px;
    height: auto;
  }

  .img-uploader-icon.el-icon {
    width: 120px;
    height: 120px;
    font-size: 28px;
    color: #8c939d;
  }
}
</style>
