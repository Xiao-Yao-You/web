import { defineStore } from 'pinia'
import { store } from '../index'
import { queryCategoryEnums, type CategoryItem } from '@/api/system/map'

interface MapState {
  // 地点类目枚举
  categoryEnums: Record<string, string>
}

export const useMapStore = defineStore('map', {
  state: (): MapState => {
    return {
      categoryEnums: {}
    }
  },
  getters: {
    categoryOptions: (state) => {
      return Object.keys(state.categoryEnums).map((key) => ({
        label: state.categoryEnums[key],
        value: key
      }))
    }
  },
  actions: {
    setCategories(list: CategoryItem[]) {
      if (list.length) {
        list.forEach((item) => {
          this.categoryEnums[item.value] = item.label
        })
      }
    },
    async fetchCategoryEnums() {
      const { list } = await queryCategoryEnums()
      this.setCategories(list)
    }
  },
  persist: false
})

export const useMapStoreWithOut = () => {
  return useMapStore(store)
}
