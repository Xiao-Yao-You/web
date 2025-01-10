<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="设备编码" prop="deviceCode">
        <el-input
          v-model="queryParams.deviceCode"
          placeholder="请输入设备编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="设备名称" prop="deviceName">
        <el-input
          v-model="queryParams.deviceName"
          placeholder="请输入设备名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="设备序列号" prop="deviceSerial">
        <el-input
          v-model="queryParams.deviceSerial"
          placeholder="请输入设备序列号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="设备二维码" prop="deviceLabelCode">
        <el-input
          v-model="queryParams.deviceLabelCode"
          placeholder="请输入设备二维码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="设备资产编号" prop="deviceAssetNum">
        <el-input
          v-model="queryParams.deviceAssetNum"
          placeholder="请输入设备资产编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="任务状态" prop="taskStatus">
        <el-select
          v-model="queryParams.taskStatus"
          placeholder="请选择任务状态"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="计划巡检日期" prop="checkPlanTime">
        <el-date-picker
          v-model="queryParams.checkPlanTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="巡检人姓名" prop="checkExecutorName">
        <el-input
          v-model="queryParams.checkExecutorName"
          placeholder="请输入巡检人姓名"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['hk:inspection-record:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['hk:inspection-record:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="设备编码" align="center" prop="deviceCode" />
      <el-table-column label="设备名称" align="center" prop="deviceName" />
      <el-table-column label="设备id	" align="center" prop="deviceId" />
      <el-table-column label="设备型号" align="center" prop="deviceModel" />
      <el-table-column label="设备型号id" align="center" prop="deviceModelId" />
      <el-table-column label="设备序列号" align="center" prop="deviceSerial" />
      <el-table-column label="设备二维码" align="center" prop="deviceLabelCode" />
      <el-table-column label="设备资产编号" align="center" prop="deviceAssetNum" />
      <el-table-column label="设备地点Id" align="center" prop="deviceAddressId" />
      <el-table-column label="设备地点" align="center" prop="deviceAddrss" />
      <el-table-column label="设备位置" align="center" prop="deviceLocation" />
      <el-table-column label="任务状态" align="center" prop="taskStatus" />
      <el-table-column
        label="计划巡检日期"
        align="center"
        prop="checkPlanTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="实际完成日期"
        align="center"
        prop="completeTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="巡检人" align="center" prop="checkExecutor" />
      <el-table-column label="巡检人姓名" align="center" prop="checkExecutorName" />
      <el-table-column label="巡检结果" align="center" prop="checkResult" />
      <el-table-column label="附件" align="center" prop="filePath" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['hk:inspection-record:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['hk:inspection-record:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <InspectionRecordForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { InspectionRecordApi, InspectionRecordVO } from '@/api/inspectionrecord'
import InspectionRecordForm from './InspectionRecordForm.vue'

/** 设备巡检记录 列表 */
defineOptions({ name: 'InspectionRecord' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<InspectionRecordVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  deviceCode: undefined,
  deviceName: undefined,
  deviceSerial: undefined,
  deviceLabelCode: undefined,
  deviceAssetNum: undefined,
  taskStatus: undefined,
  checkPlanTime: [],
  checkExecutorName: undefined,
  createTime: [],
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await InspectionRecordApi.getInspectionRecordPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await InspectionRecordApi.deleteInspectionRecord(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await InspectionRecordApi.exportInspectionRecord(queryParams)
    download.excel(data, '设备巡检记录.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
