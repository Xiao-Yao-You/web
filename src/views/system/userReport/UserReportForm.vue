<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row>
        <el-col :lg="12">
          <el-form-item label="汇报人" prop="userNikeName">
            <el-input v-model="formData.userNikeName" placeholder="请输入用户昵称" disabled />
          </el-form-item>
        </el-col>
        <el-col :lg="12">
          <el-form-item label="部门" prop="deptId">
            <el-select v-model="formData.deptId" placeholder="请选择所在部门">
              <el-option
                v-for="item in depts"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
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
        <el-table :data="formData.workProgress" style="width: 100%; margin-bottom: 5px">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="workContent" label="工作内容" />
          <el-table-column prop="completeSituation" label="完成情况" />
          <el-table-column prop="relatedMatter" label="关联事项" />
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button link type="primary" @click="openUpdateProgressDrawer(scope.$index)">
                编辑
              </el-button>
              <el-button link type="danger" @click="deleteProgress(scope.$index)"> 删除 </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button color="#626aef" size="small" @click="openAddProgressDrawer()"
          >添加一项进度</el-button
        >
        <!-- <el-button color="red" size="small">-</el-button> -->
      </el-form-item>
      <el-form-item label="工作计划" prop="workPlan">
        <el-table :data="formData.workPlan" style="width: 100%; margin-bottom: 5px">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="planContent" label="计划内容" />
          <el-table-column prop="expectedWorkingHours" label="预计工时" />
          <el-table-column prop="resourceDemand" label="资源需求" />
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button link type="primary" @click="openUpdatePlanDrawer(scope.$index)">
                编辑
              </el-button>
              <el-button link type="danger" @click="deletePlan(scope.$index)"> 删除 </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button color="#626aef" size="small" @click="openAddPlanDrawer()"
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
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
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
import AddWorkProgressForm from './addWorkProgressForm.vue'
import AddWorkPlanForm from './addWorkPlanForm.vue'
import { useUserStore } from '@/store/modules/user'

/** 用户汇报 表单 */
defineOptions({ name: 'UserReportForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const userInfo = useUserStore().getUser
const formData = ref({
  id: undefined,
  userId: userInfo.id,
  deptId: undefined,
  dateReport: undefined,
  commitTime: undefined,
  remark: undefined,
  userNikeName: userInfo.nickname,
  checkSatus: undefined,
  type: undefined,
  workProgress: [] as workProgress[],
  workPlan: [] as workPlan[],
  reportObject: undefined
})
const formRules = reactive({
  userId: [{ required: true, message: '汇报人不能为空', trigger: 'blur' }],
  deptId: [{ required: true, message: '部门不能为空', trigger: 'blur' }],
  dateReport: [{ required: true, message: '汇报日期不能为空', trigger: 'blur' }],
  checkSatus: [{ required: true, message: '状态不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '类型不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref
const addProgressFormRef = ref()
const addPlanFormRef = ref()

/** 新增一行progress */
const openAddProgressDrawer = () => {
  addProgressFormRef.value.open('add', {} as workProgress)
}

/**编辑一行progress */
const openUpdateProgressDrawer = (index: number) => {
  progressIndex.value = index
  addProgressFormRef.value.open('update', formData.value.workProgress[index] as workProgress)
}
/**删除一行progress */
const deleteProgress = (index: number) => {
  formData.value.workProgress.splice(index, 1)
}

/** 新增一行plan */
const openAddPlanDrawer = () => {
  addPlanFormRef.value.open('add', {} as workPlan)
}

/**编辑一行plan */
const openUpdatePlanDrawer = (index: number) => {
  progressIndex.value = index
  addPlanFormRef.value.open('update', formData.value.workPlan[index] as workPlan)
}
/**删除一行plan */
const deletePlan = (index: number) => {
  formData.value.workPlan.splice(index, 1)
}

const depts = ref<any[]>([
  {
    value: '部门1',
    label: '部门1'
  },
  {
    value: '部门2',
    label: '部门2'
  }
])
const reportObjects = ref<any[]>([])
const loading = ref(false)
const list = ref<any[]>([
  {
    value: '对象1',
    label: '对象1'
  },
  {
    value: '对象2',
    label: '对象2'
  }
])
/** 编辑progress的index */
const progressIndex = ref()

/**添加工作进度 */
const addWorkProgress = (progress: workProgress) => {
  formData.value.workProgress.push(progress)
}

/**更新工作进度 */
const updateWorkProgress = (progress: workProgress) => {
  formData.value.workProgress.splice(progressIndex.value, 1, progress)
}

/** 编辑plan的index */
const planIndex = ref()

/**添加工作计划 */
const addWorkPlan = (plan: workPlan) => {
  formData.value.workPlan.push(plan)
}

/**更新工作计划 */
const updateWorkPlan = (plan: workPlan) => {
  formData.value.workPlan.splice(planIndex.value, 1, plan)
}

/**查询汇报对象 */
const remoteMethod = async (query: string) => {
  if (query) {
    loading.value = true
    setTimeout(() => {
      loading.value = false
      reportObjects.value = list.value.filter((item) => {
        return item.label.includes(query)
      })
    }, 200)
  } else {
    reportObjects.value = []
  }
}

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
      formData.value = await UserReportApi.getUserReport(id)
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
    userNikeName: userInfo.nickname,
    checkSatus: undefined,
    type: undefined,
    workProgress: [] as workProgress[],
    workPlan: [] as workPlan[],
    reportObject: undefined
  }
  formRef.value?.resetFields()
}
</script>
