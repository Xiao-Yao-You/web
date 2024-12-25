<template>
  <Dialog
    class="detail-dialog"
    title="设备详情"
    v-model="visible"
    scroll
    maxHeight="500px"
    :fullscreen="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-tabs v-model="activeTab">
      <el-tab-pane label="基础信息" name="basic">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="设备编码"> {{ info.code }} </el-descriptions-item>
          <el-descriptions-item label="设备名称"> {{ info.name }} </el-descriptions-item>
          <el-descriptions-item label="设备类型">
            {{ info.deviceTypeName || '/' }}
          </el-descriptions-item>
          <el-descriptions-item label="设备型号"> {{ info.modelName }}</el-descriptions-item>
          <el-descriptions-item label="序列号">
            {{ info.serialNumber || '/' }}
          </el-descriptions-item>
          <el-descriptions-item label="二维码编号">
            {{ info.labelCode }}
            <el-button
              size="small"
              type="primary"
              style="vertical-align: text-bottom"
              :disabled="!info.labelCode"
              @click="openPrintDialog(info)"
            >
              打印
            </el-button>
          </el-descriptions-item>
          <el-descriptions-item label="编码规则">
            {{ info.numberNameStr || '/' }}
          </el-descriptions-item>
          <el-descriptions-item label="MAC 地址1"> {{ info.macAddress1 }} </el-descriptions-item>
          <el-descriptions-item label="MAC 地址2" min-width="110">
            {{ info.macAddress2 || '/' }}
          </el-descriptions-item>
          <el-descriptions-item label="所属公司">
            {{ getDictLabel(DICT_TYPE.ASSETS_COMPANY, info.company) }}
          </el-descriptions-item>
          <el-descriptions-item label="影响程度">
            {{ getDictLabel(DICT_TYPE.LEVEL, info.effectLevel) }}
          </el-descriptions-item>
          <el-descriptions-item label="资产编号"> {{ info.assetNumber }} </el-descriptions-item>
          <el-descriptions-item label="生产日期"> {{ info.manufactureDate }} </el-descriptions-item>
          <el-descriptions-item label="质保日期">
            {{ info.warrantyDate || '/' }}
          </el-descriptions-item>
          <el-descriptions-item label="设备配置" :span="2">
            <el-table :data="info.accessoryList">
              <el-table-column prop="accessoryDesc" label="配件" />
              <el-table-column prop="model" label="型号" />
              <el-table-column prop="num" label="数量" />
              <el-table-column prop="remark" label="备注" />
            </el-table>
          </el-descriptions-item>
          <el-descriptions-item label="设备照片" :span="2">
            <el-empty
              v-if="!info.devicePictureList?.length"
              style="padding: unset"
              :image-size="80"
              description="暂无数据"
            />
            <el-carousel v-else trigger="click">
              <el-carousel-item v-for="item in info.devicePictureList" :key="item.id">
                <el-image style="width: 100%; height: 100%" :src="item.url" fit="contain" />
              </el-carousel-item>
            </el-carousel>
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
      <el-tab-pane label="分配信息" name="distribute">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="使用部门" :width="90">
            {{ info.deptName }}
          </el-descriptions-item>
          <el-descriptions-item label="使用人" :width="90">
            {{ info.userNickName }}
          </el-descriptions-item>
          <el-descriptions-item label="所在地点"> {{ info.address }} </el-descriptions-item>
          <el-descriptions-item label="设备位置"> {{ info.location }} </el-descriptions-item>
          <el-descriptions-item label="IP 地址1"> {{ info.ip1 }} </el-descriptions-item>
          <el-descriptions-item label="IP 地址2"> {{ info.ip2 || '/' }} </el-descriptions-item>
          <el-descriptions-item label="登记人"> {{ info.registerUserName }} </el-descriptions-item>
          <el-descriptions-item label="登记时间">
            {{ formatDate(info.registerDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="现场照片" :span="2">
            <el-empty
              v-if="!info.distributePictureList.length"
              style="padding: unset"
              :image-size="80"
              description="暂无数据"
            />
            <el-carousel v-else trigger="click">
              <el-carousel-item v-for="item in info.distributePictureList" :key="item.id">
                <el-image style="width: 100%; height: 100%" :src="item.url" fit="contain" />
              </el-carousel-item>
            </el-carousel>
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
    </el-tabs>
  </Dialog>

  <PrintDialog ref="printRef" />
</template>

<script setup lang="ts">
import { ElLoading } from 'element-plus'
import { getRepairArchive, getOldArchiveDetail, type RepairArchive } from '@/api/repair'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import PrintDialog from '../device/PrintDialog.vue'
import { SysTab } from './index.vue'
import { OldLevelTransfer, OldCompanyTransfer } from '@/api/repair/constant'
import { DEVICE_QR_HREF } from '@/utils/constants'

defineOptions({
  name: 'ArchiveDetail'
})

const visible = ref(false)
const info = ref({
  devicePictureList: [],
  distributePictureList: []
} as unknown as RepairArchive)
const open = async (id: number, sysType: SysTab) => {
  resetInfo()
  visible.value = true
  await nextTick()
  const loadingInstance = ElLoading.service({
    target: document.querySelector('.el-dialog__body') as HTMLElement
  })
  try {
    if (sysType === SysTab.NewSys) {
      const { devicePictureList, distributePictureList, manufactureDate, warrantyDate, ...rest } =
        await getRepairArchive(id)
      Object.assign(info.value, {
        ...rest,
        manufactureDate: manufactureDate?.join('.') ?? '/',
        warrantyDate: warrantyDate?.join('.') ?? '/',
        devicePictureList: devicePictureList || [],
        distributePictureList: distributePictureList || []
      })
    } else {
      const detail = await getOldArchiveDetail(id)
      // // 新老系统字段映射
      Object.assign(info.value, {
        // 基础信息
        code: detail.ciid,
        name: detail.resourcename,
        deviceTypeName: detail.typeName,
        model: detail.productname,
        serialNumber: detail.serialno,
        labelCode: detail.barcode,
        numberNameStr: '',
        macAddress1: detail.macaddress1,
        macAddress2: detail.macaddress2,
        company: OldCompanyTransfer[detail.corporationid],
        effectLevel: OldLevelTransfer[detail.impactid],
        assetNumber: detail.assettag,
        manufactureDate: formatDate(detail.productdate),
        warrantyDate: '',
        devicePictureList: detail.productPhotoList.map((url) => ({ url })),
        distributePictureList: detail.globalPhotoList.map((url) => ({ url })),
        // 分配信息
        deptName: detail.departmentname,
        userNickName: detail.personname,
        address: detail.locationex,
        location: detail.location,
        ip1: detail.ipaddresses1,
        ip2: detail.ipaddresses2,
        registerUserName: detail.regisetperson,
        registerDate: detail.registerdate
      })
    }
  } finally {
    loadingInstance.close()
  }
}
defineExpose({ open })

const resetInfo = () => {
  info.value = {
    devicePictureList: [],
    distributePictureList: []
  } as unknown as RepairArchive
  activeTab.value = 'basic'
}

const activeTab = ref('basic') // basic | distribute

// 打印二维码
const printRef = ref<InstanceType<typeof PrintDialog>>()
const openPrintDialog = ({ deviceTypeName: name, labelCode }: RepairArchive) => {
  printRef.value?.open([
    {
      name,
      labelCode,
      qr: DEVICE_QR_HREF + labelCode
    }
  ])
}
</script>

<style scoped></style>
