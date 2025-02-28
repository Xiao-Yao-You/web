import { defineStore } from 'pinia'
import { store } from '../index'
import { DEPARTMENT_ID } from '@/utils/constants'
import { getUserPage, type UserVO } from '@/api/system/user'

interface EmployeeState {
  infoEmployees: UserVO[]
}

export const useEmployeeStore = defineStore('employee', {
  state: (): EmployeeState => {
    return {
      infoEmployees: [] // 信息部人员列表
    }
  },
  actions: {
    setInfoEmployees(list: UserVO[]) {
      if (list.length) this.infoEmployees = list
    },
    async fetchInfoEmployees() {
      if (this.infoEmployees.length) return
      const { list } = await getUserPage({
        pageNo: 1,
        pageSize: 50,
        deptId: DEPARTMENT_ID.INFORMATION
      })
      this.setInfoEmployees(list)
    }
  },
  persist: false
})

export const useEmployeeStoreWithOut = () => {
  return useEmployeeStore(store)
}
