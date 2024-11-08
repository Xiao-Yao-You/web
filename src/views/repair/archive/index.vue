<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="100px"
      :rules="{ ip1: [{ pattern: isIPV4, message: 'IP 格式不正确' }] }"
    >
      <el-form-item label="设备名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入设备名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="设备编码" prop="code">
        <el-input
          v-model="queryParams.code"
          placeholder="请输入设备编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="设备类型" prop="deviceType">
        <el-select
          v-model="queryParams.deviceType"
          placeholder="请选择设备类型"
          clearable
          value-key="value"
          class="!w-240px"
        >
          <el-option
            v-for="item in repairStore.deviceOptions"
            :key="item.value"
            :label="item.label"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属公司" prop="company">
        <el-select
          v-model="queryParams.company"
          placeholder="请选择所属公司"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="opt in CompanyOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="设备型号" prop="model">
        <el-input
          v-model="queryParams.model"
          placeholder="请输入设备型号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="二维码标签" prop="labelCode">
        <el-input
          v-model="queryParams.labelCode"
          placeholder="请输入二维码标签"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="资产编码" prop="assetNumber">
        <el-input
          v-model="queryParams.assetNumber"
          placeholder="请输入资产编码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="IP 地址1" prop="ip1">
        <el-input
          v-model="queryParams.ip1"
          placeholder="请输入 IP1"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="MAC 地址1" prop="macAddress1">
        <el-input
          v-model="queryParams.macAddress1"
          placeholder="请输入 MAC 地址1"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button type="primary" plain @click="openForm('create')">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <!-- <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button> -->
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      stripe
      show-overflow-tooltip
      @filter-change="onFilterChange"
    >
      <el-table-column type="index" align="center" width="40" fixed="left" />
      <el-table-column label="设备名称" align="center" prop="name" width="100" fixed="left" />
      <el-table-column
        label="设备状态"
        align="center"
        prop="status"
        column-key="status"
        width="100"
        fixed="left"
        :filter-multiple="false"
        :filters="filterOptions"
      >
        <template #default="{ row: { status } }">
          <el-text :type="status ? (status == 1 ? 'success' : 'danger') : 'warning'">
            {{ t(`usingStatus.${UsingStatus[status]}`) }}
          </el-text>
        </template>
      </el-table-column>
      <el-table-column label="设备编码" align="center" prop="code" />
      <el-table-column label="设备类型" align="center" prop="deviceTypeName" />
      <el-table-column label="设备型号" align="center" prop="model" />
      <el-table-column label="所属公司" align="center" prop="company" width="150">
        <template #default="{ row: { company } }">
          {{ t(`company.${CompanyEnum[company]}`) }}
        </template>
      </el-table-column>
      <el-table-column label="所在地点" align="center" prop="address" width="100">
        <template #default="{ row: { address } }">
          {{ address || '暂未分配' }}
        </template>
      </el-table-column>
      <el-table-column label="设备位置" align="center" prop="location" width="100">
        <template #default="{ row: { location } }">
          {{ location || '暂未分配' }}
        </template>
      </el-table-column>
      <el-table-column label="使用部门" align="center" prop="deptName" width="100">
        <template #default="{ row: { deptName } }">
          {{ deptName || '暂未分配' }}
        </template>
      </el-table-column>
      <el-table-column label="IP 1" align="center" prop="ip1" width="130">
        <template #default="{ row: { ip1 } }">
          {{ ip1 || '暂未分配' }}
        </template>
      </el-table-column>
      <el-table-column label="MAC 地址1" align="center" prop="macAddress1" width="160" />
      <el-table-column label="二维码标签号" align="center" prop="labelCode" width="120" />
      <el-table-column label="影响程度" align="center" prop="effectLevel">
        <template #default="{ row: { effectLevel } }">
          <dict-tag :type="DICT_TYPE.LEVEL" :value="effectLevel" />
        </template>
      </el-table-column>
      <el-table-column label="资产编号" align="center" prop="assetNumber" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" fixed="right" min-width="250">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row.id)"> 详情 </el-button>
          <el-button link type="primary" @click="openForm('update', row.id)"> 编辑 </el-button>
          <el-button
            link
            type="primary"
            @click="openDistributeForm(row)"
            :disabled="row.status === UsingStatus.Scrap"
          >
            分配
          </el-button>
          <el-button link type="primary" @click="openScrapForm(row)">
            <!-- :disabled="row.status === UsingStatus.Scrap" -->
            报废
          </el-button>
          <el-button link type="danger" @click="handleDelete(row.id)"> 删除 </el-button>
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

  <!-- 详情表单 -->
  <ArchiveDetail ref="detailRef" />

  <!-- 新增、编辑表单 -->
  <ArchiveForm ref="formRef" @success="getList" />

  <!-- 报废表单 -->
  <ScrapForm ref="scrapRef" @success="getList" />

  <!-- 分配表单 -->
  <DistributeForm ref="distributeRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { useRepairStoreWithOut } from '@/store/modules/repair'
import {
  getRepairArchivePage,
  deleteRepairArchive,
  // exportRepairArchive,
  type RepairArchive
} from '@/api/repair'
import { UsingStatus, CompanyOptions, CompanyEnum, UsingStatusOptions } from '@/api/repair/constant'
import ArchiveForm from './ArchiveForm.vue'
import ScrapForm from './ScrapForm.vue'
import DistributeForm from './DistributeForm.vue'
import ArchiveDetail from './ArchiveDetail.vue'
import { isIPV4 } from '@/utils/is'
import { DICT_TYPE } from '@/utils/dict'
// import download from '@/utils/download'

/** 运维设备档案 列表 */
defineOptions({ name: 'RepairArchive' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const repairStore = useRepairStoreWithOut()

const loading = ref(true) // 列表的加载中
const list = ref<RepairArchive[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryFormRef = ref() // 搜索的表单
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  code: undefined,
  model: undefined,
  labelCode: undefined,
  assetNumber: undefined,
  ip1: undefined,
  macAddress1: undefined,
  company: undefined,
  deviceType: undefined as undefined | OptionItem<number>,
  status: undefined as undefined | string
})
// const exportLoading = ref(false) // 导出的加载中

/** 表格过滤 */
const filterOptions = UsingStatusOptions.map((item) => ({
  text: item.label,
  value: item.value.toString()
}))
const onFilterChange = ({ status }: any) => {
  queryParams.status = status[0]
  handleQuery()
}

/** 查询列表 */
const getList = async () => {
  await queryFormRef.value.validate()
  loading.value = true
  try {
    const { deviceType, ...rest } = queryParams
    const data = await getRepairArchivePage({
      ...rest,
      deviceType: deviceType?.value,
      deviceTypeName: deviceType?.label
    })
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
  await message.delConfirm()
  await deleteRepairArchive(id)
  message.success(t('common.delSuccess'))
  await getList()
}

/** 导出按钮操作 */
// const handleExport = async () => {
//   try {
//     // 导出的二次确认
//     await message.exportConfirm()
//     // 发起导出
//     exportLoading.value = true
//     const data = await exportRepairArchive(queryParams)
//     download.excel(data, '运维设备档案.xls')
//   } catch {
//   } finally {
//     exportLoading.value = false
//   }
// }

/** 详情 */
const detailRef = ref()
const openDetail = (id: number) => {
  detailRef.value.open(id)
}

/** 报废 */
const scrapRef = ref()
const openScrapForm = ({ code, name, id, status }: RepairArchive) => {
  scrapRef.value.open({ code, name, id, status })
}

/** 分配 */
const distributeRef = ref()
const openDistributeForm = ({ code, name, id }: RepairArchive) => {
  distributeRef.value.open({ code, name, id })
}

/** 初始化 **/
onMounted(() => {
  repairStore.fetchDevicesAll()
  getList()
})
</script>
