<template>
  <Dialog title="审核" v-model="dialogVisible" id="suggestion-dialog">
    <el-descriptions border :column="2">
      <el-descriptions-item label="建议主题">
        {{ detail.title }}
      </el-descriptions-item>
      <el-descriptions-item label="建议类型">
        {{ getDictLabel(DICT_TYPE.SUGGESTION_TYPE, detail.suggestionType) }}
      </el-descriptions-item>
      <el-descriptions-item label="申报人">
        {{ detail.nickname }}
      </el-descriptions-item>
      <el-descriptions-item label="申报人工号">
        {{ detail.workNum }}
      </el-descriptions-item>
      <el-descriptions-item label="手机号">
        {{ detail.phoneNum }}
      </el-descriptions-item>
      <el-descriptions-item label="申报部门">
        {{ detail.deptName }}
      </el-descriptions-item>
      <el-descriptions-item label="审核状态" :span="2">
        <dict-tag :type="DICT_TYPE.ADOPTION_STATUS" :value="detail.status" />
      </el-descriptions-item>
      <el-descriptions-item label="评审备注" :span="2">
        {{ detail.remark || '无' }}
      </el-descriptions-item>
      <el-descriptions-item label="问题描述" :span="2">
        {{ detail.problemDescription }}
      </el-descriptions-item>
      <el-descriptions-item label="解决方案" :span="2">
        {{ detail.solution }}
      </el-descriptions-item>
      <el-descriptions-item label="效果预估" :span="2">
        {{ detail.effectEstimation }}
      </el-descriptions-item>
      <el-descriptions-item label="图片附件" :rowspan="2">
        <template v-if="pictures.length">
          <el-image
            v-for="(url, i) in pictures"
            class="mr-10px"
            :key="i"
            style="width: 100px; height: 100px"
            :src="url"
            fit="cover"
            :zoom-rate="1.2"
            :max-scale="7"
            :min-scale="0.2"
            show-progress
            :preview-src-list="pictures"
          />
        </template>
        <span v-else>无</span>
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button type="danger" :disabled="disabled" @click="onReject"> 不采纳 </el-button>
      <el-button type="primary" :disabled="disabled" @click="onResolve"> 采纳 </el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { Anonymous, AdoptionStatus, ReasonableSuggestionApi } from '@/api/reasonablesuggestion'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { checkPermi } from '@/utils/permission'
import { ElMessageBox, ElLoading, type Action } from 'element-plus'

/** 合理化建议 表单 */
defineOptions({ name: 'ReasonableExamine' })

const message = useMessage()

const emit = defineEmits(['query', 'success'])

const dialogVisible = ref(false)
const loading = ref(false)
const detail = ref({
  id: undefined as unknown as number,
  title: undefined,
  suggestionType: undefined,
  userId: undefined as unknown as number,
  nickname: undefined as unknown as string,
  workNum: undefined as unknown as string,
  phoneNum: undefined as unknown as string,
  deptId: undefined as unknown as number,
  deptName: undefined as unknown as string,
  problemDescription: undefined,
  solution: undefined,
  effectEstimation: undefined,
  status: AdoptionStatus.Unread,
  anonymous: undefined as unknown as string,
  filePath: undefined as unknown as string,
  fileList: [],
  remark: ''
})

const pictures = computed(() => {
  return detail.value.filePath?.split(';') || []
})

// 采纳（不采纳）按钮禁用逻辑
const disabled = computed(() => {
  return loading.value || detail.value.status !== AdoptionStatus.Read
})

/** 打开弹窗 */
const open = async (id: number, preStatus: AdoptionStatus) => {
  dialogVisible.value = true
  resetForm()

  await nextTick() // 确保 #suggestion-dialog 存在
  const loadingInstance = ElLoading.service({
    target: '#suggestion-dialog',
    fullscreen: false
  })
  try {
    // 1. 未读的建议自动触发已读功能
    if (preStatus === AdoptionStatus.Unread && checkPermi(['reasonableSuggestion::read'])) {
      await ReasonableSuggestionApi.read(id)
      // 1.1 重新刷新状态
      emit('query')
    }

    // 2. 获取最新详情（已读状态变更后）
    const info = await ReasonableSuggestionApi.get(id)
    Object.assign(detail.value, info)
  } catch (e) {
    ElMessageBox.alert('查询失败，请确认建议是否存在或已删除。', '系统提示', {
      confirmButtonText: '刷新列表',
      type: 'error',
      callback: (action: Action) => {
        if (action === 'confirm') emit('query')
        dialogVisible.value = false
      }
    })
  } finally {
    loadingInstance.close()
  }
}
defineExpose({ open })

// 采纳
const onResolve = () => {
  ElMessageBox.confirm('确定采纳该条建议吗？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        examine(AdoptionStatus.Resolve)
          .then(() => {
            done()
            dialogVisible.value = false
          })
          .finally(() => {
            instance.confirmButtonLoading = false
          })
      } else {
        done()
      }
    }
  })
}

// 不采纳
const onReject = () => {
  ElMessageBox.prompt('请输入不采纳原因', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '原因不能为空',
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        instance.confirmButtonLoading = true
        examine(AdoptionStatus.Reject, instance.inputValue)
          .then(() => {
            done()
            dialogVisible.value = false
          })
          .finally(() => {
            instance.confirmButtonLoading = false
          })
      } else {
        done()
      }
    }
  })
}

// 审核
const examine = async (examineType: AdoptionStatus, remark = '') => {
  loading.value = true
  try {
    await ReasonableSuggestionApi.examine({
      id: detail.value.id,
      examineType,
      remark
    })
    message.success('操作成功')
    emit('success')
  } finally {
    loading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  detail.value = {
    id: undefined as unknown as number,
    title: undefined,
    suggestionType: undefined,
    userId: undefined as unknown as number,
    nickname: undefined as unknown as string,
    workNum: undefined as unknown as string,
    phoneNum: undefined as unknown as string,
    deptId: undefined as unknown as number,
    deptName: undefined as unknown as string,
    problemDescription: undefined,
    solution: undefined,
    effectEstimation: undefined,
    status: AdoptionStatus.Unread,
    anonymous: undefined as unknown as string,
    filePath: undefined as unknown as string,
    fileList: [],
    remark: ''
  }
}
</script>
