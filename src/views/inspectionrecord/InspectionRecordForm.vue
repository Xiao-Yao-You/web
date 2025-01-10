<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="设备编码" prop="deviceCode">
        <el-input v-model="formData.deviceCode" placeholder="请输入设备编码" />
      </el-form-item>
      <el-form-item label="设备名称" prop="deviceName">
        <el-input v-model="formData.deviceName" placeholder="请输入设备名称" />
      </el-form-item>
      <el-form-item label="设备id	" prop="deviceId">
        <el-input v-model="formData.deviceId" placeholder="请输入设备id	" />
      </el-form-item>
      <el-form-item label="设备型号" prop="deviceModel">
        <el-input v-model="formData.deviceModel" placeholder="请输入设备型号" />
      </el-form-item>
      <el-form-item label="设备型号id" prop="deviceModelId">
        <el-input v-model="formData.deviceModelId" placeholder="请输入设备型号id" />
      </el-form-item>
      <el-form-item label="设备序列号" prop="deviceSerial">
        <el-input v-model="formData.deviceSerial" placeholder="请输入设备序列号" />
      </el-form-item>
      <el-form-item label="设备二维码" prop="deviceLabelCode">
        <el-input v-model="formData.deviceLabelCode" placeholder="请输入设备二维码" />
      </el-form-item>
      <el-form-item label="设备资产编号" prop="deviceAssetNum">
        <el-input v-model="formData.deviceAssetNum" placeholder="请输入设备资产编号" />
      </el-form-item>
      <el-form-item label="设备地点Id" prop="deviceAddressId">
        <el-input v-model="formData.deviceAddressId" placeholder="请输入设备地点Id" />
      </el-form-item>
      <el-form-item label="设备地点" prop="deviceAddrss">
        <el-input v-model="formData.deviceAddrss" placeholder="请输入设备地点" />
      </el-form-item>
      <el-form-item label="设备位置" prop="deviceLocation">
        <el-input v-model="formData.deviceLocation" placeholder="请输入设备位置" />
      </el-form-item>
      <el-form-item label="任务状态" prop="taskStatus">
        <el-radio-group v-model="formData.taskStatus">
          <el-radio label="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="计划巡检日期" prop="checkPlanTime">
        <el-date-picker
          v-model="formData.checkPlanTime"
          type="date"
          value-format="x"
          placeholder="选择计划巡检日期"
        />
      </el-form-item>
      <el-form-item label="实际完成日期" prop="completeTime">
        <el-date-picker
          v-model="formData.completeTime"
          type="date"
          value-format="x"
          placeholder="选择实际完成日期"
        />
      </el-form-item>
      <el-form-item label="巡检人" prop="checkExecutor">
        <el-input v-model="formData.checkExecutor" placeholder="请输入巡检人" />
      </el-form-item>
      <el-form-item label="巡检人姓名" prop="checkExecutorName">
        <el-input v-model="formData.checkExecutorName" placeholder="请输入巡检人姓名" />
      </el-form-item>
      <el-form-item label="巡检结果" prop="checkResult">
        <el-input v-model="formData.checkResult" placeholder="请输入巡检结果" />
      </el-form-item>
      <el-form-item label="附件" prop="filePath">
        <el-input v-model="formData.filePath" placeholder="请输入附件" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="formData.remark" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { InspectionRecordApi, InspectionRecordVO } from '@/api/inspectionrecord'

/** 设备巡检记录 表单 */
defineOptions({ name: 'InspectionRecordForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  deviceCode: undefined,
  deviceName: undefined,
  deviceId: undefined,
  deviceModel: undefined,
  deviceModelId: undefined,
  deviceSerial: undefined,
  deviceLabelCode: undefined,
  deviceAssetNum: undefined,
  deviceAddressId: undefined,
  deviceAddrss: undefined,
  deviceLocation: undefined,
  taskStatus: undefined,
  checkPlanTime: undefined,
  completeTime: undefined,
  checkExecutor: undefined,
  checkExecutorName: undefined,
  checkResult: undefined,
  filePath: undefined,
  remark: undefined,
})
const formRules = reactive({
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
      formData.value = await InspectionRecordApi.getInspectionRecord(id)
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
    const data = formData.value as unknown as InspectionRecordVO
    if (formType.value === 'create') {
      await InspectionRecordApi.createInspectionRecord(data)
      message.success(t('common.createSuccess'))
    } else {
      await InspectionRecordApi.updateInspectionRecord(data)
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
    deviceCode: undefined,
    deviceName: undefined,
    deviceId: undefined,
    deviceModel: undefined,
    deviceModelId: undefined,
    deviceSerial: undefined,
    deviceLabelCode: undefined,
    deviceAssetNum: undefined,
    deviceAddressId: undefined,
    deviceAddrss: undefined,
    deviceLocation: undefined,
    taskStatus: undefined,
    checkPlanTime: undefined,
    completeTime: undefined,
    checkExecutor: undefined,
    checkExecutorName: undefined,
    checkResult: undefined,
    filePath: undefined,
    remark: undefined,
  }
  formRef.value?.resetFields()
}
</script>
