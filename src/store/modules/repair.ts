import { defineStore } from 'pinia'
import { store } from '../index'
import { getRepairIssuesAll, type RepairIssue } from '@/api/repair'

interface RepairState {
  // 全量的问题类型列表
  issuesAll: RepairIssue[]
}

export const useRepairStore = defineStore('repair', {
  state: (): RepairState => {
    return {
      issuesAll: []
    }
  },
  getters: {
    issueOptions(state) {
      return state.issuesAll.map((item) => ({
        label: item.name,
        value: item.id
      }))
    }
  },
  actions: {
    setIssuesAll(list: RepairIssue[]) {
      if (list.length) this.issuesAll = list
    },
    async fetchIssuesAll() {
      const list = await getRepairIssuesAll()
      this.setIssuesAll(list)
    }
  },
  persist: false
})

export const useRepairStoreWithOut = () => {
  return useRepairStore(store)
}
