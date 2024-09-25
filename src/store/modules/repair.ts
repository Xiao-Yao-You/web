import { defineStore } from 'pinia'
import { store } from '../index'
import { handleTree } from '@/utils/tree'
import {
  getRepairIssuesAll,
  getRepairDeviceAll,
  type RepairIssue,
  type RepairDevice,
  type IssuesAllParams
} from '@/api/repair'

interface RepairState {
  // 全量的问题类型列表
  issuesAll: RepairIssue[]
  devicesAll: RepairDevice[]
}

export const useRepairStore = defineStore('repair', {
  state: (): RepairState => {
    return {
      issuesAll: [],
      devicesAll: []
    }
  },
  getters: {
    issueOptions(state) {
      return state.issuesAll.map((item) => ({
        label: item.name,
        value: item.id
      }))
    },
    issuesTree(state) {
      return handleTree(state.issuesAll)
    },
    issuesMenu() {
      return [
        {
          id: 0,
          name: '主类目',
          children: this.issuesTree
        }
      ]
    },
    deviceOptions(state) {
      return state.devicesAll.map((item) => ({
        label: item.name,
        value: item.id
      }))
    }
  },
  actions: {
    // 获取全量问题
    setIssuesAll(list: RepairIssue[]) {
      if (list.length) this.issuesAll = list
    },
    async fetchIssuesAll(params: IssuesAllParams = {}) {
      const list = await getRepairIssuesAll(params)
      this.setIssuesAll(list)
    },

    // 获取全量设备
    setDevicesAll(list: RepairDevice[]) {
      if (list.length) this.devicesAll = list
    },
    async fetchDevicesAll() {
      const list = await getRepairDeviceAll()
      this.setDevicesAll(list)
    }
  },
  persist: false
})

export const useRepairStoreWithOut = () => {
  return useRepairStore(store)
}
