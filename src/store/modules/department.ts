import { defineStore } from 'pinia'
import { store } from '../index'
import { handleTree } from '@/utils/tree'
import { getSimpleDeptList, type DeptVO } from '@/api/system/dept'
import { DEPARTMENT_ID } from '@/utils/constants'

interface DeptState {
  deptList: DeptVO[]
}

export const useDeptStore = defineStore('dept', {
  state: (): DeptState => {
    return {
      deptList: [] // 原始的部门列表
    }
  },
  getters: {
    // 部门树（全部）
    deptTree(state) {
      return handleTree(state.deptList)
    },
    // 一级部门选择列表
    topDeptOptions(state) {
      return state.deptList
        .filter((item) => item.parentId === DEPARTMENT_ID.TOP)
        .map((item) => ({
          label: item.name,
          value: item.id
        }))
    }
  },
  actions: {
    setDeptList(list: DeptVO[]) {
      if (list.length) this.deptList = list
    },
    async fetchDeptList() {
      const list = await getSimpleDeptList()
      this.setDeptList(list)
    }
  },
  persist: false
})

export const useDeptStoreWithOut = () => {
  return useDeptStore(store)
}
