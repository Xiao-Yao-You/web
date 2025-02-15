<template>
  <div class="home-wrapper overflow-hidden">
    <!-- 顶部 Header，height: 112px -->
    <el-card class="h-110px mb-8px" shadow="never">
      <el-skeleton :loading="loading" animated>
        <el-row :gutter="16" justify="space-between">
          <el-col :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
            <div class="flex items-center">
              <el-avatar :src="avatar" :size="70" class="mr-16px" />
              <div>
                <div class="text-20px">
                  {{ t('workplace.welcome') }} {{ username }} {{ t('workplace.happyDay') }}
                </div>
                <!-- <div class="mt-10px text-14px text-gray-500">
                    {{ t('workplace.toady') }}，20℃ - 32℃！
                  </div> -->
              </div>
            </div>
          </el-col>
          <el-col :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
            <div class="h-70px flex items-center justify-end lt-sm:mt-10px">
              <div class="px-8px text-right">
                <div class="mb-16px text-14px text-gray-400">待办事项</div>
                <CountTo class="text-20px" :start-val="0" :end-val="0" :duration="2600" />
              </div>
              <el-divider direction="vertical" border-style="dashed" />
              <div class="px-8px text-right">
                <div class="mb-16px text-14px text-gray-400">日程安排</div>
                <CountTo class="text-20px" :start-val="0" :end-val="0" :duration="2600" />
              </div>
            </div>
          </el-col>
        </el-row>
      </el-skeleton>
    </el-card>

    <div class="body flex h-full gap-8px">
      <!-- 1. 左侧-->
      <div class="left flex-1 flex flex-col gap-8px">
        <!-- 1.1 工单模块 -->
        <el-card class="flex-grow-4 flex-basis-0" shadow="never" body-class="h-full box-border">
          <el-skeleton :loading="loading" animated>
            <el-tabs
              v-model="activeWork"
              addable
              class="h-full"
              @tab-change="onWorkTabChange"
              @edit="router.push({ name: 'RepairWorkOrder' })"
            >
              <template #add-icon><ArrowRightIcon /></template>
              <el-tab-pane label="待办工单" name="todoWork">
                <el-table :data="newOrders" stripe show-overflow-tooltip height="100%">
                  <el-table-column type="index" width="40" />
                  <el-table-column label="工单标题" prop="title" />
                  <el-table-column label="紧急程度" prop="level">
                    <template #default="scope">
                      <dict-tag :type="DICT_TYPE.LEVEL" :value="scope.row.level" />
                    </template>
                  </el-table-column>
                  <el-table-column label="请求类型" prop="requestType">
                    <template #default="scope">
                      {{ getRequestTypeLabel(scope.row.requestType) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="问题类型" prop="questionTypeStr" />
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="我的工单" name="myWork">
                <el-table :data="myOrders" stripe show-overflow-tooltip height="100%">
                  <el-table-column type="index" width="40" />
                  <el-table-column label="工单标题" prop="title" />
                  <el-table-column label="工单状态" prop="status">
                    <template #default="scope">
                      <dict-tag :type="DICT_TYPE.REPAIR_ORDER_STATUS" :value="scope.row.status" />
                    </template>
                  </el-table-column>
                  <el-table-column label="紧急程度" prop="level">
                    <template #default="scope">
                      <dict-tag :type="DICT_TYPE.LEVEL" :value="scope.row.level" />
                    </template>
                  </el-table-column>
                  <el-table-column label="请求类型" prop="requestType">
                    <template #default="scope">
                      {{ getRequestTypeLabel(scope.row.requestType) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="问题类型" prop="questionTypeStr" />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-skeleton>
        </el-card>

        <!-- 1.2 流程模块 -->
        <el-card class="flex-grow-3 flex-basis-0" shadow="never" body-class="h-full box-border">
          <el-skeleton :loading="loading" animated>
            <el-tabs class="h-full" v-model="activeTask" addable @edit="handleTaskTab">
              <template #add-icon><ArrowRightIcon /></template>
              <el-tab-pane label="待办任务" name="todoTask">
                <el-scrollbar>
                  <el-empty description="敬请期待" :image-size="100" />
                </el-scrollbar>
              </el-tab-pane>
              <el-tab-pane label="我的流程" name="myWorkflow">
                <el-scrollbar>
                  <el-empty description="敬请期待" :image-size="100" />
                </el-scrollbar>
              </el-tab-pane>
              <el-tab-pane label="抄送我的" name="copy">
                <el-scrollbar>
                  <el-empty description="敬请期待" :image-size="100" />
                </el-scrollbar>
              </el-tab-pane>
            </el-tabs>
          </el-skeleton>
        </el-card>
      </div>

      <!-- 2. 右侧 -->
      <el-card class="right flex-1" shadow="never" body-class="h-[calc(100%-60px)] box-border">
        <template #header>
          <div class="h-20px flex justify-between p-20px">
            <span>我的日程</span>
            <el-button type="primary" link @click="router.push({ name: 'SystemMeetingSubscribe' })">
              更多
            </el-button>
          </div>
        </template>

        <!-- 2.1 日历 -->
        <el-calendar v-model="date" class="h-250px mb-20px" />

        <!-- 2.2 会议 -->
        <el-skeleton :loading="loading" animated>
          <el-scrollbar class="p-[0_20px]">
            <template v-if="meetingList.length">
              <div v-for="item in meetingList" :key="item.id" class="meeting-item">
                <div class="flex justify-between gap-x-10">
                  <b class="flex-1 text-base">{{ item.subject }}</b>
                  <span class="w-1/4 text-right text-sm">{{ item.userNickName }}</span>
                </div>
                <div
                  class="flex justify-between text-xs"
                  style="color: var(--el-text-color-secondary)"
                >
                  <div>
                    <div>
                      会议时间：
                      {{ item.dateMeeting.join('-') }}
                      {{
                        `${intervalTransform(item.startTime, 'start')} - ${intervalTransform(item.endTime, 'end')}`
                      }}
                    </div>
                    <div>会议室：{{ item.meetingRoomName }}</div>
                  </div>
                  <span class="text-right">
                    <MeetingStatusTag
                      :isCancelled="item.status"
                      :startTime="item.startTime"
                      :endTime="item.endTime"
                      :date="item.dateMeeting"
                    />
                  </span>
                </div>
              </div>
            </template>
            <el-empty v-else description="暂无数据" :image-size="70" />
          </el-scrollbar>
        </el-skeleton>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useIcon } from '@/hooks/web/useIcon'
import { useUserStore } from '@/store/modules/user'
import { MeetingSubscribeApi, MeetingSubscribeInfo } from '@/api/system/meeting'
import { formatTime } from '@/utils'
import { intervalTransform } from '@/utils/formatTime'
import MeetingStatusTag from '@/views/system/meeting/subscribe/MeetingStatusTag.vue'
import avatarImg from '@/assets/imgs/avatar.gif'
import { useEmitt } from '@/hooks/web/useEmitt'
import { getRepairOrderPage, type RepairOrder } from '@/api/repair'
import { getRequestTypeLabel, OperateStatus } from '@/api/repair/constant'
import { DICT_TYPE } from '@/utils/dict'

defineOptions({ name: 'Home' })

const { t } = useI18n()
const userStore = useUserStore()
const router = useRouter()
const ArrowRightIcon = useIcon({ icon: 'ep:d-arrow-right' })

const loading = ref(true)
const username = userStore.getUser.nickname
const userId = userStore.getUser.id
const activeWork = ref('todoWork') // todoWork、myWork
const activeTask = ref('todoTask') // todoTask、myWorkflow、copy
const date = ref(new Date())
const meetingList = ref<MeetingSubscribeInfo[]>([])

const avatar = computed(() => userStore.user.avatar ?? avatarImg)

const handleTaskTab = () => {
  // todo：去工单页
}

watch(date, (newDate) => {
  getMeetingList(formatTime(newDate, 'yyyy-MM-dd'))
})

const getMeetingList = async (date: string) => {
  const data = await MeetingSubscribeApi.getMeetingSubscribePage({
    pageNo: 1,
    pageSize: 50,
    date: [date, date]
  })
  meetingList.value = data.list
}

const getAllApi = async () => {
  // todo: 获取会议 + 获取工单 + 获取流程
  await Promise.all([getMeetingList(formatTime(date.value, 'yyyy-MM-dd'))])
  loading.value = false
}

getAllApi()

// #region 工单tab模块
const myOrders = ref<RepairOrder[]>([]) // 待办工单
const newOrders = ref<RepairOrder[]>([]) // 我的工单

// 事件总线
const { emitter } = useEmitt()
emitter.on('getNewOrder', async () => {
  newOrders.value = await getOrders({ status: OperateStatus.Dispatch })
})

// 请求中断控制器
const httpController = ref<AbortController | null>(null)

// 工单 tab 切换（查询待分配和我的工单列表）
const onWorkTabChange = async (tab: string) => {
  httpController.value?.abort()
  if (tab === 'todoWork') {
    newOrders.value = await getOrders({ status: OperateStatus.Dispatch })
  } else {
    myOrders.value = await getOrders({ dealUserId: userId })
  }
}

// 带有中断功能的工单查询
const getOrders = async (params: Partial<{ dealUserId: number; status: string }>) => {
  const controller = markRaw(new AbortController())
  httpController.value = controller
  const data = await getRepairOrderPage(
    {
      pageNo: 1,
      pageSize: 50,
      ...params
    },
    controller.signal
  )
  return data.list
}
// #endregion
</script>

<style lang="scss" scoped>
.home-wrapper {
  height: calc(100vh - 40px /* padding */ - 85px /* header */ - 50px /* footer */);
  min-height: 650px;
}

.body {
  height: calc(100% - 120px);

  .left {
    :deep(.el-tabs__content) {
      height: calc(100% - 40px /*top*/);

      .el-tab-pane {
        height: 100%;
      }
    }
  }

  .right.el-card {
    :deep(.el-card__header) {
      padding: unset;
    }

    .el-calendar {
      :deep(.el-calendar__body) {
        padding: 0 20px;

        .el-calendar-day {
          height: 20px;
          padding: 5px 0;
          line-height: 20px;
          text-align: center;
          box-sizing: content-box;
        }
      }
    }

    .el-scrollbar {
      height: calc(100% - 270px);

      .meeting-item {
        padding: 10px 20px;
        margin-bottom: 10px;
        color: var(--el-color-text-default);
        cursor: pointer;
        border: 1px solid var(--el-border-color);
        border-radius: 10px;

        &:hover {
          background-color: var(--el-color-hover-bg);
        }
      }
    }
  }

  .el-empty {
    padding: unset;
  }
}
</style>
