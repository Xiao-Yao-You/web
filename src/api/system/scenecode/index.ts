import request from '@/config/axios'

// 单据编码类型配置 VO
export interface SceneCodeVO {
  id: number // 主键
  keyCode: string // 编码编码
  description: string // 描述
  prefix: string // 编码前缀
  infix: string // 编码中缀
  suffix: string // 编码后缀
  type: string // 编码规则
  start: number // 起始值
  step: number // 步长
  status: string // 状态
}

export type SceneCodeParams = Partial<
  Pick<SceneCodeVO, 'keyCode' | 'description'> & {
    pageNo: number
    pageSize: number
  }
>

// 单据编码类型配置 API
export const SceneCodeApi = {
  // 查询单据编码类型配置分页
  getSceneCodePage: async (params: SceneCodeParams) => {
    return await request.get<{ list: SceneCodeVO[]; total: number }>({
      url: `/system/scene-code/page`,
      params
    })
  },

  // 新增单据编码类型配置
  createSceneCode: async (data: Omit<SceneCodeVO, 'id'>) => {
    return await request.post({ url: `/system/scene-code/create`, data })
  },

  // 根据 id 查询某个单据编码类型配置详情
  getSceneCodeById: async (id: number) => {
    return await request.get<SceneCodeVO>({ url: `/system/scene-code/get?id=` + id })
  },

  // 修改单据编码类型配置
  updateSceneCode: async (data: SceneCodeVO) => {
    return await request.put({ url: `/system/scene-code/update`, data })
  },

  // 删除单据编码类型配置
  deleteSceneCode: async (id: number) => {
    return await request.delete({ url: `/system/scene-code/delete?id=` + id })
  },

  // 导出单据编码类型配置 Excel
  exportSceneCode: async (params) => {
    return await request.download({ url: `/system/scene-code/export-excel`, params })
  }
}

// 获得全量单据编码类型列表
export const getSceneCodeAll = async () => {
  return request.get<SceneCodeVO[]>({ url: '/system/scene-code/getAll' })
}
