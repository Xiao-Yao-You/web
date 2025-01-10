import request from '@/config/axios'

// 设备巡检记录 VO
export interface InspectionRecordVO {
  deviceCode: string // 设备编码
  deviceName: string // 设备名称
  deviceId: number // 设备id	
  deviceModel: string // 设备型号
  deviceModelId: number // 设备型号id
  deviceSerial: string // 设备序列号
  deviceLabelCode: string // 设备二维码
  deviceAssetNum: string // 设备资产编号
  deviceAddressId: number // 设备地点Id
  deviceAddrss: string // 设备地点
  deviceLocation: string // 设备位置
  taskStatus: number // 任务状态
  checkPlanTime: Date // 计划巡检日期
  completeTime: Date // 实际完成日期
  checkExecutor: number // 巡检人
  checkExecutorName: string // 巡检人姓名
  checkResult: number // 巡检结果
  filePath: string // 附件
  remark: string // 备注
}

// 设备巡检记录 API
export const InspectionRecordApi = {
  // 查询设备巡检记录分页
  getInspectionRecordPage: async (params: any) => {
    return await request.get({ url: `/inspection-record/page`, params })
  },

  // 查询设备巡检记录详情
  getInspectionRecord: async (id: number) => {
    return await request.get({ url: `/inspection-record/get?id=` + id })
  },

  // 新增设备巡检记录
  createInspectionRecord: async (data: InspectionRecordVO) => {
    return await request.post({ url: `/inspection-record/create`, data })
  },

  // 修改设备巡检记录
  updateInspectionRecord: async (data: InspectionRecordVO) => {
    return await request.put({ url: `/inspection-record/update`, data })
  },

  // 删除设备巡检记录
  deleteInspectionRecord: async (id: number) => {
    return await request.delete({ url: `/inspection-record/delete?id=` + id })
  },

  // 导出设备巡检记录 Excel
  exportInspectionRecord: async (params) => {
    return await request.download({ url: `/inspection-record/export-excel`, params })
  },
}
