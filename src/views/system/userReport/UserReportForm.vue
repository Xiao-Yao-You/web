<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1200px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row>
        <el-col :lg="12">
          <el-form-item label="汇报人" prop="userNickName">
            <el-input v-model="formData.userNickName" placeholder="请输入用户昵称" disabled />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="部门" prop="deptId">
            <el-tree-select
              v-model="formData.deptId"
              :data="depts"
              :props="defaultProps"
              check-strictly
              node-key="id"
              placeholder="请选择归属部门"
              :disabled="formType === 'view'"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :lg="12">
          <el-form-item label="汇报日期" prop="dateReport">
            <el-date-picker
              v-model="formData.dateReport"
              type="date"
              placeholder="请选择汇报日期"
              :disabled-date="disabledDate"
              value-format="YYYY-MM-DD"
              style="width: 100%"
              :disabled="formType === 'view'"
            />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="汇报对象" prop="reportObject">
            <el-select
              v-model="formData.reportObject"
              multiple
              filterable
              remote
              reserve-keyword
              placeholder="请输汇报对象姓名"
              :remote-method="remoteMethod"
              :loading="loading"
              ref="selectObj"
              :disabled="formType === 'view'"
            >
              <el-option
                v-for="item in reportObjects"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="工作进度" prop="workProgress">
        <el-table
          :data="formData.reportJobScheduleDOList"
          style="width: 100%; margin-bottom: 5px"
          show-overflow-tooltip
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="content" label="工作内容" />
          <el-table-column prop="situation" label="完成情况" />
          <el-table-column prop="connectId" label="关联事项" />
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button
                link
                type="primary"
                @click="openViewProgressDrawer(scope.$index)"
                v-if="formType == 'view'"
              >
                详情
              </el-button>
              <el-button
                link
                type="primary"
                @click="openUpdateProgressDrawer(scope.$index)"
                v-if="formType != 'view'"
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                @click="deleteProgress(scope.$index)"
                v-if="formType != 'view'"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          color="#626aef"
          size="small"
          @click="openAddProgressDrawer()"
          v-if="formType != 'view'"
          >添加一项进度</el-button
        >
        <!-- <el-button color="red" size="small">-</el-button> -->
      </el-form-item>
      <el-form-item label="工作计划" prop="workPlan">
        <el-table
          :data="formData.reportJobPlanDOList"
          style="width: 100%; margin-bottom: 5px"
          show-overflow-tooltip
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="content" label="计划内容" />
          <el-table-column prop="estimatedTime" label="预计工时" />
          <el-table-column prop="needSource" label="资源需求" />
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button
                link
                type="primary"
                @click="openViewPlanDrawer(scope.$index)"
                v-if="formType == 'view'"
              >
                详情
              </el-button>
              <el-button
                link
                type="primary"
                @click="openUpdatePlanDrawer(scope.$index)"
                v-if="formType != 'view'"
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                @click="deletePlan(scope.$index)"
                v-if="formType != 'view'"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button
          color="#626aef"
          size="small"
          @click="openAddPlanDrawer()"
          v-if="formType != 'view'"
          >添加一项计划</el-button
        >
        <!-- <el-button color="red" size="small">-</el-button> -->
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input
          type="textarea"
          v-model="formData.remark"
          placeholder="请输入备注"
          maxlength="300"
          show-word-limit
          :rows="5"
          :disabled="formType === 'view'"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button
        @click="submitForm"
        type="primary"
        :disabled="formLoading"
        v-if="formType != 'view'"
        >确 定</el-button
      >
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
    <AddWorkProgressForm
      ref="addProgressFormRef"
      @addprogress="addWorkProgress"
      @updateprogress="updateWorkProgress"
    />
    <AddWorkPlanForm ref="addPlanFormRef" @addplan="addWorkPlan" @updateplan="updateWorkPlan" />
  </Dialog>
</template>
<script setup lang="ts">
import {
  UserReportApi,
  UserReportVO,
  type workProgress,
  type workPlan
} from '@/api/system/userReport'
import { getDeptsByUserId } from '@/api/system/dept'
import { getAll } from '@/api/system/user'
import AddWorkProgressForm from './addWorkProgressForm.vue'
import AddWorkPlanForm from './addWorkPlanForm.vue'
import { useUserStore } from '@/store/modules/user'
import { defaultProps, handleTree } from '@/utils/tree'
import dayjs from 'dayjs'
import { isArray } from '../../../utils/is'
import { formatDate } from '../../../utils/formatTime'

/** 用户汇报 表单 */
defineOptions({ name: 'UserReportForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const selectObj = ref()
const userInfo = useUserStore().getUser
const formData = ref({
  id: undefined,
  userId: userInfo.id,
  deptId: undefined,
  dateReport: undefined,
  commitTime: undefined,
  remark: undefined,
  userNickName: userInfo.nickname,
  checkStatus: undefined,
  type: undefined,
  reportJobScheduleDOList: [] as workProgress[],
  reportJobPlanDOList: [] as workPlan[],
  reportObject: undefined
})
const formRules = reactive({
  userNickName: [{ required: true, message: '汇报人不能为空', trigger: 'blur' }],
  reportObject: [{ required: true, message: '汇报对象不能为空', trigger: 'blur' }],
  deptId: [{ required: true, message: '部门不能为空', trigger: 'blur' }],
  dateReport: [{ required: true, message: '汇报日期不能为空', trigger: 'blur' }],
  checkStatus: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '类型不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const addProgressFormRef = ref()
const addPlanFormRef = ref()

/**限制可选汇报日期 */
const disabledDate = (data: Date) => {
  return data.getTime() > new Date().getTime()
}
/** 新增一行progress */
const openAddProgressDrawer = () => {
  addProgressFormRef.value.open('add', {} as workProgress)
}
/**查看一行progress */
const openViewProgressDrawer = (index: number) => {
  progressIndex.value = index
  addProgressFormRef.value.open(
    'view',
    formData.value.reportJobScheduleDOList[index] as workProgress
  )
}
/**编辑一行progress */
const openUpdateProgressDrawer = (index: number) => {
  progressIndex.value = index
  addProgressFormRef.value.open(
    'update',
    formData.value.reportJobScheduleDOList[index] as workProgress
  )
}
/**删除一行progress */
const deleteProgress = (index: number) => {
  formData.value.reportJobScheduleDOList.splice(index, 1)
}

/** 新增一行plan */
const openAddPlanDrawer = () => {
  addPlanFormRef.value.open('add', {} as workPlan)
}
/**查看一行plan */
const openViewPlanDrawer = (index: number) => {
  progressIndex.value = index
  addPlanFormRef.value.open('view', formData.value.reportJobPlanDOList[index] as workPlan)
}
/**编辑一行plan */
const openUpdatePlanDrawer = (index: number) => {
  progressIndex.value = index
  addPlanFormRef.value.open('update', formData.value.reportJobPlanDOList[index] as workPlan)
}
/**删除一行plan */
const deletePlan = (index: number) => {
  formData.value.reportJobPlanDOList.splice(index, 1)
}

const depts = ref<Tree[]>([])
const reportObjects = ref<any[]>([])
const loading = ref(false)
const list = ref<any[]>([])
/** 编辑progress的index */
const progressIndex = ref()

/**添加工作进度 */
const addWorkProgress = (progress: workProgress) => {
  formData.value.reportJobScheduleDOList.push(progress)
}

/**更新工作进度 */
const updateWorkProgress = (progress: workProgress) => {
  formData.value.reportJobScheduleDOList.splice(progressIndex.value, 1, progress)
}

/** 编辑plan的index */
const planIndex = ref()

/**添加工作计划 */
const addWorkPlan = (plan: workPlan) => {
  formData.value.reportJobPlanDOList.push(plan)
}

/**更新工作计划 */
const updateWorkPlan = (plan: workPlan) => {
  formData.value.reportJobPlanDOList.splice(planIndex.value, 1, plan)
}

/**过滤重复数据 */
const filterDuplicateObjects = (arr: any[]) => {
  const seen = new Set()
  return arr.filter((item) => {
    const serializedKey = JSON.stringify(item['value'])
    return seen.has(serializedKey) ? false : seen.add(serializedKey)
  })
}

/**查询汇报对象 */
const remoteMethod = async (query: string) => {
  if (query) {
    loading.value = true
    const users = await getAll(query)
    const userMap = users.map((item) => {
      return { value: item.id, label: `${item.nickname}-${item.username}` }
    })
    list.value.concat(userMap)
    nextTick(() => {
      const tempUser = filterDuplicateObjects(list.value)
      setTimeout(() => {
        loading.value = false
        reportObjects.value = tempUser.filter((item) => {
          return item.label.includes(query)
        })
      }, 200)
    })
  }
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  reportObjects.value = []
  if (type == 'view') {
    dialogTitle.value = '详情'
  } else {
    dialogTitle.value = t('action.' + type)
  }

  formType.value = type
  /**查询当前用户所在的部门列表 */
  const deptList = await getDeptsByUserId(formData.value.userId)
  depts.value = handleTree(deptList)
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const res = await UserReportApi.getUserReport(id)
      res.dateReport = dayjs(res.dateReport).format('YYYY-MM-DD')
      list.value = res.userList.map((item) => {
        return { value: item.id, label: `${item.nickname}-${item.username}` }
      })
      reportObjects.value = list.value
      formData.value = res
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
  if (
    formData.value.reportJobScheduleDOList == undefined ||
    formData.value.reportJobScheduleDOList.length <= 0
  ) {
    message.error('请填写工作进度')
    return
  }
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as UserReportVO
    if (formType.value === 'create') {
      await UserReportApi.createUserReport(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserReportApi.updateUserReport(data)
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
    userId: userInfo.id,
    deptId: undefined,
    dateReport: undefined,
    commitTime: undefined,
    remark: undefined,
    userNickName: userInfo.nickname,
    checkStatus: undefined,
    type: undefined,
    reportJobScheduleDOList: [] as workProgress[],
    reportJobPlanDOList: [] as workPlan[],
    reportObject: undefined
  }
  formRef.value?.resetFields()
}
</script>
