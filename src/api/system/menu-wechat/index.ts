import request from '@/config/axios'
import type { MenuVO } from '@/api/system/menu'

export type WechatParams = Partial<Pick<MenuVO, 'name' | 'status'>> & PageParam

// 查询小程序菜单层级列表
export const getWechatMenusLevels = () => {
  return request.get({ url: '/wechat/menu/simple-list' })
}

// 查询菜单分页列表
export const getWechatMenuList = (params: WechatParams) => {
  return request.get({ url: '/wechat/menu/list', params })
}

// 获取菜单详情
export const getWechatMenu = (id: number) => {
  return request.get({ url: '/wechat/menu/get?id=' + id })
}

// 新增菜单
export const createWechatMenu = (data: MenuVO) => {
  return request.post({ url: '/wechat/menu/create', data })
}

// 修改菜单
export const updateWechatMenu = (data: MenuVO) => {
  return request.put({ url: '/wechat/menu/update', data })
}

// 删除菜单
export const deleteWechatMenu = (id: number) => {
  return request.delete({ url: '/wechat/menu/delete?id=' + id })
}
