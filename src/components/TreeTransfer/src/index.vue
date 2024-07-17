<script setup lang="ts">
import { pull, remove } from 'lodash-es'
import { useIcon } from '@/hooks/web/useIcon'
import type { ElTree } from 'element-plus'
import type { TreeOptionProps } from 'element-plus/es/components/tree/src/tree.type.d.ts'

defineOptions({
  name: 'TreeTransfer',
  inheritAttrs: false
})

const props = withDefaults(
  defineProps<{
    props: TreeOptionProps
  }>(),
  {}
)

const emit = defineEmits<{
  change: [keys: number[]]
}>()

const CloseIcon = useIcon({ icon: 'ep:circle-close' })

const treeRef = ref<InstanceType<typeof ElTree>>()
const selectedMembers = ref([] as Tree[])

const memberKeys = computed(() => selectedMembers.value.map((m) => m.id))

const setcustomClass = (data: Tree) => {
  return data.isLeaf ? 'member' : 'dept'
}

// 点击节点复选框之后触发
const onCheck = (currNode: Tree, { checkedKeys }) => {
  if (!currNode.isLeaf) return // 部门跳过，仅保留人员（叶子节点）id

  if (checkedKeys.includes(currNode.id)) {
    selectedMembers.value.push(currNode)
  } else {
    pull(selectedMembers.value, currNode)
  }
}

const onRemove = (id: number) => {
  remove(selectedMembers.value, (m) => m.id === id)
  treeRef.value?.setCheckedKeys(memberKeys.value)
}

watchEffect(() => {
  emit('change', memberKeys.value)
})
</script>

<template>
  <div class="tree-transfer w-full flex">
    <!-- 左侧树形选择区域 -->
    <el-scrollbar max-height="200px" class="tree-container flex-1 h-full py-8px">
      <div max-height="200px" class="tree-container flex-1 h-full py-8px">
        <el-tree
          ref="treeRef"
          v-bind="$attrs"
          :props="{ class: setcustomClass, ...props.props }"
          @check="onCheck"
        >
          <template #default="{ node, data }">
            <slot :node="node" :data="data"></slot>
          </template>
          <template #empty>
            <slot name="empty"></slot>
          </template>
        </el-tree>
      </div>
    </el-scrollbar>

    <el-divider direction="vertical" class="min-h-220px" />

    <!-- 右侧选中区域 -->
    <el-scrollbar max-height="200px" class="selected-container flex-1 py-8px pr-8px">
      <ul>
        <li
          v-for="item in selectedMembers"
          :key="item.id"
          class="member flex justify-between items-center !px-8px"
        >
          {{ item.name }}
          <el-icon class="close-icon cursor-pointer" @click="onRemove(item.id)">
            <CloseIcon />
          </el-icon>
        </li>
      </ul>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
ul,
li {
  padding: 0;
  margin: 0;
}

.tree-transfer {
  min-height: 220px;
  border: 1px solid #e4e7ed;
  border-radius: var(--el-border-radius-base);

  .tree-container {
    // 隐藏部门的复选框
    :deep(.el-tree-node.dept > .el-tree-node__content label.el-checkbox) {
      display: none;
    }
  }

  .selected-container {
    li.member {
      border-bottom: 1px solid #ebeef5;

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
}
</style>
