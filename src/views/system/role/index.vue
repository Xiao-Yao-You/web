<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="角色名称" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
          clearable
          placeholder="请输入角色名称"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="角色标识" prop="code">
        <el-input
          v-model="queryParams.code"
          class="!w-240px"
          clearable
          placeholder="请输入角色标识"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="开启/关闭">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
        <el-button
          v-hasPermi="['system:role:create']"
          plain
          type="primary"
          @click="openForm('create')"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
        <el-button
          v-hasPermi="['system:role:export']"
          :loading="exportLoading"
          plain
          type="success"
          @click="handleExport"
        >
          <Icon class="mr-5px" icon="ep:download" />
          导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <el-table-column align="center" label="角色编号" prop="id" width="85" />
      <el-table-column align="center" label="角色名称" prop="name" />
      <el-table-column label="角色类型" align="center" prop="type" width="85">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.SYSTEM_ROLE_TYPE" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色标识" prop="code" />
      <el-table-column align="center" label="显示顺序" prop="sort" width="85" />
      <el-table-column align="center" label="备注" prop="remark" />
      <el-table-column align="center" label="状态" prop="status" width="70">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column :width="200" align="center" label="操作" fixed="right">
        <template #default="scope">
          <div class="flex items-center justify-evenly">
            <el-button
              v-hasPermi="['system:role:update']"
              link
              type="primary"
              @click="openForm('update', scope.row.id)"
            >
              编辑
            </el-button>
            <el-dropdown
              @command="(command) => handleCommand(command, scope.row)"
              v-hasPermi="[
                'system:permission:assign-role-menu',
                'system:permission:assign-role-wechat-menu',
                'system:permission:assign-role-data-scope'
              ]"
            >
              <el-button type="primary" link><Icon icon="ep:d-arrow-right" /> 权限</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    command="menu"
                    v-if="checkPermi(['system:permission:assign-role-menu'])"
                  >
                    <Icon icon="ep:menu" />菜单权限
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="wechat"
                    v-if="checkPermi(['system:permission:assign-role-wechat-menu'])"
                  >
                    <Icon icon="ep:chat-dot-round" />小程序权限
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="data"
                    v-if="checkPermi(['system:permission:assign-role-data-scope'])"
                  >
                    <Icon icon="ep:coin" />数据权限
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button
              v-hasPermi="['system:role:delete']"
              link
              type="danger"
              @click="handleDelete(scope.row.id)"
            >
              删除
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <RoleForm ref="formRef" @success="getList" />
  <!-- 表单弹窗：菜单权限 -->
  <RoleAssignMenuForm ref="assignMenuFormRef" @success="getList" />
  <!-- 表单弹窗：数据权限 -->
  <RoleDataPermissionForm ref="dataPermissionFormRef" @success="getList" />
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import * as RoleApi from '@/api/system/role'
import RoleForm from './RoleForm.vue'
import RoleAssignMenuForm from './RoleAssignMenuForm.vue'
import RoleDataPermissionForm from './RoleDataPermissionForm.vue'
import { checkPermi } from '@/utils/permission'

defineOptions({ name: 'SystemRole' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  code: '',
  name: '',
  status: undefined,
  createTime: ''
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询角色列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await RoleApi.getRolePage(queryParams)
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

/** 权限操作 */
const handleCommand = (command: string, row: RoleApi.RoleVO) => {
  switch (command) {
    case 'data':
      openDataPermissionForm(row)
      break
    case 'menu':
      openAssignMenuForm(row, 'web')
      break
    case 'wechat':
      openAssignMenuForm(row, 'wechat')
      break
    default:
      break
  }
}
/** 数据权限 */
const dataPermissionFormRef = ref()
const openDataPermissionForm = async (row: RoleApi.RoleVO) => {
  dataPermissionFormRef.value.open(row)
}
/** 菜单权限 */
const assignMenuFormRef = ref()
const openAssignMenuForm = async (row: RoleApi.RoleVO, type: 'web' | 'wechat') => {
  assignMenuFormRef.value.open(row, type)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await RoleApi.deleteRole(id)
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
    const data = await RoleApi.exportRole(queryParams)
    download.excel(data, '角色列表.xls')
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
