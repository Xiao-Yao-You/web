import { defineStore } from 'pinia'
import { store } from '../index'
import { getMemberGroupPage, type MemberGroupVO } from '@/api/repair'
import { DICT_TYPE, getDictOptions, type DictDataType } from '@/utils/dict'

interface GroupState {
  // 所有运维小组信息（目前50条）
  allGroups: MemberGroupVO[]
}

export const useGroupStore = defineStore('group', {
  state: (): GroupState => {
    return {
      allGroups: []
    }
  },
  getters: {
    // 已在运维小组上使用的请求类型
    groupOptions: (state) => {
      if (!state.allGroups.length) return []
      const requestTypeOptions: DictDataType[] = getDictOptions(DICT_TYPE.REPAIR_REQUEST_TYPE)
      const groupIds = state.allGroups.map((group) => group.groupId)
      const groups = requestTypeOptions.filter((type) => groupIds.includes(type.value as string))
      return groups.map(({ value, label }) => ({ value, label }))
    }
  },
  actions: {
    async fetchAllGroups() {
      if (this.allGroups.length) return
      const { list } = await getMemberGroupPage({ pageNo: 1, pageSize: 50 })
      this.allGroups = list || []
    }
  },
  persist: false
})

export const useGroupStoreWithOut = () => {
  return useGroupStore(store)
}
