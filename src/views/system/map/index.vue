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
      <el-form-item label="园区" prop="zoneType">
        <el-select
          v-model="queryParams.zoneType"
          disabled
          placeholder="请选择园区"
          class="!w-100px"
        >
          <el-option label="恒科" value="00" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable class="!w-150px">
          <el-option
            v-for="opt in categoryOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="地点名" prop="description">
        <el-input
          v-model="queryParams.description"
          placeholder="请输入地点名"
          clearable
          @keyup.enter="handleQuery"
          class="!w-160px"
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
        <el-button type="primary" plain @click="openForm('create')">
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <!-- <el-button type="success" plain @click="handleExport" :loading="exportLoading">
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button> -->
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="园区" align="center" prop="zoneType">
        <template #default=""> 恒科 </template>
      </el-table-column>
      <el-table-column label="地点 ID" align="center" prop="id" />
      <el-table-column label="地点名" align="center" prop="description" />
      <el-table-column label="类型" align="center" prop="type">
        <template #default="{ row: { type } }">
          <el-tag :type="tagType[type]">
            {{ categoryEnums[type] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="权重" align="center" prop="sort">
        <template #default="{ row: { type, sort } }">
          {{ `${Number(type)}-${sort}` }}
        </template>
      </el-table-column>
      <el-table-column label="GPS 经度" align="center" prop="longitude" />
      <el-table-column label="GPS 纬度" align="center" prop="latitude" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('update', scope.row.id)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(scope.row.id)"> 删除 </el-button>
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
  <MapForm ref="formRef" :category-options="categoryOptions" @success="getList" />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import MapForm from './components/MapForm.vue'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import {
  getMapList,
  deleteMapPoint,
  exportMapList,
  type MapPoint,
  type MapQuery
} from '@/api/system/map'
import { useMapStoreWithOut } from '@/store/modules/map'

defineOptions({ name: 'SystemMap' })

const tagType = {
  '00': 'primary',
  '01': 'success',
  '02': 'danger',
  '03': 'warning',
  '04': 'info'
}

const mapStore = useMapStoreWithOut()
const { categoryEnums, categoryOptions } = storeToRefs(mapStore)
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<MapPoint[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive<MapQuery>({
  pageNo: 1,
  pageSize: 10,
  zoneType: '00',
  type: undefined,
  description: undefined,
  createTime: [undefined, undefined]
  // image: undefined,
  // longitude: undefined,
  // latitude: undefined,
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

const query = async () => {
  await mapStore.fetchCategoryEnums()
  await getList()
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await getMapList(queryParams)
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
    await deleteMapPoint(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
// const handleExport = async () => {
//   try {
//     // 导出的二次确认
//     await message.exportConfirm()
//     // 发起导出
//     exportLoading.value = true
//     const data = await exportMapList(queryParams)
//     download.excel(data, '厂区地图定位详细信息.xls')
//   } catch {
//   } finally {
//     exportLoading.value = false
//   }
// }

/** 初始化 **/
onMounted(() => {
  query()
})
</script>
