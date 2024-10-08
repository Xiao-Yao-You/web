<!-- 部门人员选择器 -->
<script setup lang="ts">
import { ElTree, ElTable, ElMessageBox } from 'element-plus'
import { getSimpleDeptList } from '@/api/system/dept'
import { getUserPage, type UserVO } from '@/api/system/user'
import { handleTree } from '@/utils/tree'
import { useIcon } from '@/hooks/web/useIcon'
import { remove } from 'lodash-es'
import { isUnDef } from '@/utils/is'
import { TOP_DEPARTMENT_ID } from '@/utils/constants'

interface QueryParams extends PageParam {
  nickname: undefined | string
  deptId: undefined | number
}

defineOptions({ name: 'UserSelector' })

const props = withDefaults(
  defineProps<{
    title: string
    defaultSelectedList: UserVO[]
  }>(),
  {
    title: '人员选择',
    defaultSelectedList: () => []
  }
)

const emits = defineEmits<{
  selected: [selectedUsers: UserVO[]]
}>()

const CloseIcon = useIcon({ icon: 'ep:circle-close' })

//#region 部门树相关
const deptName = ref('')
const expandedKeys = ref([TOP_DEPARTMENT_ID])
const checkedKeys = ref([TOP_DEPARTMENT_ID])
const treeRef = ref<InstanceType<typeof ElTree>>()
const deptList = ref<Tree[]>([]) // 树形结构
const queryParams = reactive<QueryParams>({
  pageNo: 1,
  pageSize: 30,
  nickname: undefined,
  deptId: undefined
})

// 监听并过滤部门
watch(deptName, (val) => {
  treeRef.value!.filter(val)
})

/** 获得部门树 */
const getTree = async () => {
  const res = await getSimpleDeptList()
  deptList.value = []
  deptList.value.push(...handleTree(res))
}

/** 基于名字过滤 */
const filterNode = (name: string, data: Tree) => {
  if (!name) return true
  return data.name.includes(name)
}

// 部门点击事件
const httpController = ref<AbortController | null>(null)
const onNodeClick = async ({ id }: { [key: string]: any }) => {
  if (id === queryParams.deptId) return // 避免重复请求

  httpController.value?.abort() // 取消上一次进行中的请求
  queryParams.deptId = id
  queryParams.nickname = undefined
  if (queryParams.pageNo !== 1) {
    // 重置页码后，会在 watch 中自动请求
    queryParams.pageNo = 1
  } else {
    getMembers()
  }
}

onMounted(() => {
  getTree()
})
//#endregion

//#region 人员表格相关
const tableRef = ref<InstanceType<typeof ElTable>>()
const tableLoading = ref(false)
const memberList = ref([] as UserVO[])
const memberTotal = ref(0)
const selectedList = ref([] as UserVO[]) // 选中的人员

// 监听页码变化
watch(
  () => queryParams.pageNo,
  () => {
    getMembers()
  }
)

// 查询对应部门的人员
const getMembers = async () => {
  // 每次需重新创建唯一的 signal
  const controller = markRaw(new AbortController())
  httpController.value = controller
  tableLoading.value = true
  try {
    const { list, total } = await getUserPage(queryParams, controller.signal)
    memberList.value = list
    memberTotal.value = total
  } finally {
    tableLoading.value = false
  }
}

// 用户手动勾选 Checkbox 时触发的事件
const onSelect = (selectedRows: UserVO[]) => {
  selectedList.value = selectedRows
}

// 移除右侧选中人员
const onRemove = (id: number) => {
  const filters = remove(selectedList.value, (m) => m.id === id)
  // 与表格双向绑定（取消移除人员的选中状态）
  toggleSelection(filters, false)
}

const onClear = () => {
  selectedList.value = []
  toggleSelection()
}

/**
 * @description 处理表格选中事件
 * @param rows 当前需要修改状态的行的数据
 * @param selected 状态 true：选中，false: 取消
 */
const toggleSelection = (rows?: UserVO[], selected = true) => {
  if (rows) {
    rows.forEach((row) => {
      tableRef.value?.toggleRowSelection(row, selected)
    })
  } else {
    tableRef.value?.clearSelection()
  }
}

// 确认选中（确认后退出，不清空状态，保留操作数据，以便后续打开继续操作）
const onConfirm = () => {
  emits('selected', selectedList.value)
  dialogVisible.value = false
}
//#endregion

//#region 对话框相关
const dialogVisible = ref(false) // 弹窗是否展示

const open = () => {
  dialogVisible.value = true

  // 设置初始的 deptId，获取对应人员列表
  if (isUnDef(queryParams.deptId)) {
    queryParams.deptId = TOP_DEPARTMENT_ID
    getMembers()
  }

  nextTick(() => {
    // 同步已选择的人员列表，更新表格选中状态
    if (props.defaultSelectedList.length) {
      selectedList.value = props.defaultSelectedList
    }
    toggleSelection(selectedList.value, true)

    // 过滤初始部门
    if (deptName.value) {
      treeRef.value!.filter(deptName.value)
    }
  })
}

const onClose = (done: () => void) => {
  ElMessageBox.confirm('系统可能不会保存您所做的更改，确认关闭？', '提示', {
    confirmButtonText: '离开',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    resetData() // 没有确认保存的退出，将不会保留状态
    done()
  })
}

// 数据重置
const resetData = () => {
  Object.assign(queryParams, {
    pageNo: 1,
    pageSize: 30,
    nickname: undefined,
    deptId: undefined
  })
  deptName.value = ''
  memberList.value = []
  selectedList.value = []
  // deptList.value = [] 部门不用频繁更新，先不清空
}

defineExpose({ open, clear: resetData })
//#endregion
</script>

<template>
  <Dialog
    v-model="dialogVisible"
    :title="props.title"
    class="member-modal"
    width="50%"
    :before-close="onClose"
  >
    <div class="wrapper flex w-full">
      <!-- 左侧部门选择树 -->
      <div class="left py-8px">
        <el-input
          v-model="deptName"
          class="mb-10px pl-8px"
          clearable
          placeholder="请输入部门名称"
          maxlength="20"
        >
          <template #prefix>
            <Icon icon="ep:search" />
          </template>
        </el-input>
        <el-scrollbar max-height="340px">
          <el-tree
            ref="treeRef"
            node-key="id"
            :data="deptList"
            accordion
            highlight-current
            :props="{ label: 'name', children: 'children' }"
            :filter-node-method="filterNode"
            :default-expanded-keys="expandedKeys"
            :default-checked-keys="checkedKeys"
            @node-click="onNodeClick"
          >
            <template #empty>
              <el-empty description="暂无数据" />
            </template>
          </el-tree>
        </el-scrollbar>
      </div>

      <el-divider direction="vertical" class="!h-auto" />

      <!-- 右侧对应部门下的人员 table -->
      <div class="center py-8px">
        <el-input
          v-model="queryParams.nickname"
          class="mb-10px pl-8px"
          clearable
          placeholder="输入人员名称，按回车搜索"
          maxlength="20"
          @change="getMembers"
        >
          <template #prefix>
            <Icon icon="ep:search" />
          </template>
        </el-input>
        <!-- table height = 400(wrapper 的总高) - 顶部 input 的高(50) - 底部 pagination 的高(32) -->
        <el-table
          ref="tableRef"
          row-key="id"
          :data="memberList"
          height="310px"
          class="w-full"
          v-loading="tableLoading"
          @select="onSelect"
          @select-all="onSelect"
        >
          <el-table-column type="selection" align="center" reserve-selection width="30" />
          <el-table-column label="用户名称" align="center" prop="nickname" />
          <el-table-column label="部门" align="center" prop="deptName" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.deptList.map((d) => d.name || '').join('、') }}
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          size="small"
          :total="memberTotal"
          v-model:current-page="queryParams.pageNo"
          :page-size="queryParams.pageSize"
          layout="prev, pager, next"
          hide-on-single-page
          :pager-count="5"
        />
      </div>

      <el-divider direction="vertical" class="!h-auto" />

      <!-- 选中的与会人员 -->
      <div class="right relative">
        <!-- max-height 的值 = 400(wrapper 的总高) - 底部 .action 的高 -->
        <el-scrollbar max-height="364px" class="pr-8px">
          <ul class="selected-list">
            <li
              v-for="item in selectedList"
              :key="item.id"
              class="member flex justify-between items-center"
            >
              {{ item.nickname }}
              <el-icon class="close-icon cursor-pointer" @click="onRemove(item.id)">
                <CloseIcon />
              </el-icon>
            </li>
          </ul>
        </el-scrollbar>
        <div class="action absolute text-right text-xs py-4px pr-8px">
          <span class="mr-5px text-slate-400">共 {{ selectedList.length }} 人</span>
          <el-button size="small" :disabled="!selectedList.length" @click="onClear">
            清空
          </el-button>
          <el-button size="small" type="primary" @click="onConfirm"> 确认 </el-button>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<style scoped lang="scss">
:global(.com-dialog.member-modal) {
  min-width: 800px;
}

.wrapper {
  min-height: 400px;
  border: 1px solid #e4e7ed;
}

.left {
  flex: 3;
}

.center {
  flex: 4;
}

.right {
  flex: 2;
}

ul,
li {
  padding: 0;
  margin: 0;
}

ul.selected-list {
  li.member {
    padding: 8px 8px 8px 6px;
    border-bottom: 1px solid #ebeef5;

    &:last-child {
      border-bottom: unset;
    }

    &:hover {
      background-color: #f5f7fa;
    }

    i.close-icon {
      color: #909399;

      &:hover {
        color: #606266;
      }
    }
  }
}

.action {
  right: 0;
  bottom: 0;
  left: 0;
  line-height: 24px;
  border-top: 1px solid #ebeef5;
}
</style>
