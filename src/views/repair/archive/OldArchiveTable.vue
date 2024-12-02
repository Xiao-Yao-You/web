<template>
  <div class="old-archive-table">
    <el-table
      v-loading="loading"
      :data="archiveList"
      stripe
      show-overflow-tooltip
      @filter-change="onFilterChange"
    >
      <el-table-column label="序号" type="index" align="center" width="60" fixed="left" />
      <el-table-column
        label="设备名称"
        align="center"
        prop="resourcename"
        width="100"
        fixed="left"
      />
      <el-table-column
        label="设备状态"
        align="center"
        prop="stateid"
        column-key="stateid"
        width="100"
        fixed="left"
        :filter-multiple="false"
        :filters="statusOptions"
      >
        <template #default="{ row: { stateid } }">
          {{ getDictLabel(DICT_TYPE.REPAIR_OLD_DEVICE_STATE, stateid) }}
        </template>
      </el-table-column>
      <el-table-column label="设备编码" align="center" prop="ciid" />
      <el-table-column label="设备型号" align="center" prop="productname" width="120" />
      <el-table-column label="二维码标签号" align="center" prop="barcode" width="120" />
      <el-table-column label="所属公司" align="center" prop="corporationname" width="150" />
      <el-table-column label="所在地点" align="center" prop="locationex" width="100">
        <template #default="{ row: { locationex } }">
          {{ locationex || '暂未分配' }}
        </template>
      </el-table-column>
      <el-table-column label="设备位置" align="center" prop="location" width="100">
        <template #default="{ row: { location } }">
          {{ location || '暂未分配' }}
        </template>
      </el-table-column>
      <el-table-column label="使用部门" align="center" prop="departmentname" width="100">
        <template #default="{ row: { departmentname } }">
          {{ departmentname || '暂未分配' }}
        </template>
      </el-table-column>
      <el-table-column label="IP 1" align="center" prop="ipaddresses1" width="130">
        <template #default="{ row: { ipaddresses1 } }">
          {{ ipaddresses1 || '暂未分配' }}
        </template>
      </el-table-column>
      <el-table-column label="MAC 地址1" align="center" prop="macaddress1" width="160" />
      <el-table-column label="影响程度" align="center" prop="impactid">
        <template #default="{ row: { impactid } }">
          <dict-tag :type="DICT_TYPE.LEVEL" :value="OldLevelTransfer[impactid]" />
        </template>
      </el-table-column>
      <el-table-column label="资产编号" align="center" prop="assettag" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="registerdate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" fixed="right" width="80">
        <template #default="{ row }">
          <el-button link type="primary" @click="openDetail(row.ciid)"> 详情 </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="totalCount"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { getOldDevicePage, type OldRepairArchive, type OldArchiveParams } from '@/api/repair'
import { OldLevelTransfer, OldCompanyTransfer } from '@/api/repair/constant'
import { useEmitt } from '@/hooks/web/useEmitt'
import { isNumber } from '@/utils/is'
import { DICT_TYPE, getDictLabel, getStrDictOptions } from '@/utils/dict'
import type { QueryParams } from './index.vue'

defineOptions({
  name: 'OldArchiveTable'
})

// #region 列表搜索
const loading = ref(true)
const archiveList = ref<OldRepairArchive[]>([])
const totalCount = ref(0)
const queryParams = reactive<OldArchiveParams>({
  pageNo: 1,
  pageSize: 10,
  resourcename: undefined, // 设备名称
  ciid: undefined, // 设备编码
  citype: undefined, // 设备类型
  corporationid: undefined, // 所属公司
  productname: undefined, // 设备型号 name
  barcode: undefined, // 二维码标签
  assettag: undefined, // 资产编码
  ipaddresses1: undefined, // ip1
  macaddress1: undefined // mac1
})
// 新老系统查询参数字段映射
const mappingParams = (params: QueryParams) => {
  Object.assign(queryParams, {
    pageNo: params.pageNo,
    pageSize: params.pageSize,
    resourcename: params.name,
    ciid: params.code,
    citype: params.deviceType?.label,
    corporationid: isNumber(params.company) ? OldCompanyTransfer[params.company] : undefined,
    productname: params.model,
    barcode: params.labelCode,
    assettag: params.assetNumber,
    ipaddresses1: params.ip1,
    macaddress1: params.macAddress1
  })
}

// 切换 tab 触发的查询
const { emitter } = useEmitt()
emitter.on('queryOldPage', async (params: QueryParams) => {
  if (params) mappingParams(params)
  handleQuery()
})

// 设备状态过滤筛查
const statusOptions = getStrDictOptions(DICT_TYPE.REPAIR_OLD_DEVICE_STATE).map((d) => ({
  text: d.label,
  value: d.value as string
}))
const onFilterChange = ({ stateid }: any) => {
  queryParams.stateid = stateid[0]
  handleQuery()
}

// 查询
const getList = async () => {
  loading.value = true
  try {
    const { list, total } = await getOldDevicePage(queryParams)
    totalCount.value = total
    archiveList.value = list
  } finally {
    loading.value = false
  }
}
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}
// #endregion

// #region 详情
const emit = defineEmits<{
  openDetail: [ciid: number]
}>()
const openDetail = (ciid: number) => emit('openDetail', ciid)
// #endregion
</script>
