<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="园区" prop="zoneType">
        <el-select v-model="formData.zoneType" disabled>
          <el-option label="恒科" value="00" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择类型" @change="onTypeChange">
          <el-option
            v-for="opt in categoryOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="地点名" prop="description">
        <el-input v-model="formData.description" placeholder="请输入地点名" clearable />
      </el-form-item>
      <el-form-item label="GPS 经度" prop="longitude">
        <el-input v-model="formData.longitude" placeholder="请输入 WGS84 坐标系经度" />
      </el-form-item>
      <el-form-item label="GPS 纬度" prop="latitude">
        <el-input v-model="formData.latitude" placeholder="请输入 WGS84 坐标系纬度" />
      </el-form-item>
      <el-form-item prop="sort" class="sort-item">
        <template #label>
          {{ '排序权重' }}
          <el-tooltip effect="dark" content="不填则按默认排序" placement="top-start">
            <Icon class="sort-tooltip" />
          </el-tooltip>
        </template>
        <el-input v-model="formData.sort" clearable class="!w-100px sort-input">
          <template #prefix>{{ sortPrefix }}</template>
        </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { updateMapPoint, createMapPoint, getMapPoint, type MapPoint } from '@/api/system/map'
import { pickBy } from 'lodash-es'
import { useIcon } from '@/hooks/web/useIcon'

/** 厂区地图定位详细信息 表单 */
defineOptions({ name: 'MapForm' })

withDefaults(defineProps<{ categoryOptions: Array<{ label: string; value: string | number }> }>(), {
  categoryOptions: () => []
})

const Icon = useIcon({ icon: 'ep:question-filled' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const sortPrefix = ref('') // 权重前缀（地点类型）
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref<Partial<MapPoint>>({
  id: undefined,
  zoneType: '00',
  type: undefined,
  sort: undefined,
  description: '',
  longitude: undefined,
  latitude: undefined
})
const formRef = ref() // 表单 Ref
const formRules = reactive({
  type: [{ required: true, message: '地点类型不能为空' }],
  description: [{ required: true, message: '地点名不能为空' }],
  sort: [
    { pattern: /^(0|[1-9]\d*)$/, message: '必须是大于或等于0的整数' },
    {
      validator(_rule, _value, cb: Function) {
        if (formData.value.type) return cb()
        cb(new Error('请先选择类型'))
      }
    }
  ],
  longitude: [
    { required: true, message: '经度不能为空' },
    { pattern: /^(-?\d{1,2}|1[0-7]\d|\d)(\.\d+)?$/, message: '经度格式不正确' }
  ],
  latitude: [
    { required: true, message: '纬度不能为空' },
    { pattern: /^(-?\d{1,2}|[0-8]\d)(\.\d+)?$/, message: '纬度格式不正确' }
  ]
})

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
    const data = formData.value as unknown as MapPoint
    if (formType.value === 'create') {
      const formData = pickBy(data, (_value, key) => key !== 'id') as Omit<MapPoint, 'id'>
      if (formData.sort) formData.sort = Number(formData.sort)
      await createMapPoint(formData)
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
    zoneType: '00',
    type: undefined,
    sort: undefined,
    description: undefined,
    longitude: undefined,
    latitude: undefined
  }
  formRef.value?.resetFields()
  sortPrefix.value = ''
}
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
</style>
