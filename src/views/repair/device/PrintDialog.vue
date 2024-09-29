<script setup lang="ts">
import { hiprint } from 'vue-plugin-hiprint'
import { type LabelItem } from '@/api/repair'

const dialogVisible = ref(false)
// const drawerVisible = ref(false)
// const previewLoading = ref(false)
const printLoading = ref(false)
const hiprintRef = ref(null)
const hiprintInstance = ref<any>(null)

defineOptions({
  name: 'PrintDialog'
})

const props = withDefaults(defineProps<{ labels: LabelItem[] }>(), { labels: () => [] })

const open = async () => {
  dialogVisible.value = true
  nextTick(() => {
    props.labels.forEach((label) => {
      render(label)
    })
    // 移除内置类名，显式所有标签
    const panels = document.querySelector('#hiprint-printTemplate')?.children
    if (panels) {
      for (let i = 0; i < panels.length; i++) {
        panels[i].classList.remove('hipanel-disable')
      }
    }
  })
}
defineExpose({ open })

// hiprint 初始化
const init = () => {
  hiprint.init()
  hiprintInstance.value = markRaw(new hiprint.PrintTemplate())
}

// hiprint 函数式编辑（内容写死，不需要用户自定义编辑）
const render = ({ name, labelCode }: LabelItem) => {
  // 添加面板
  const panel = hiprintInstance.value?.addPrintPanel({
    width: 70,
    height: 30,
    paperNumberDisabled: true
  })
  if (panel) {
    // 添加二维码
    panel.addPrintText({
      options: { width: 60, height: 60, top: 10, left: 10, title: labelCode, textType: 'qrcode' }
    })
    // 添加文字
    panel.addPrintText({
      options: {
        title: 'IT 设备管理标识',
        top: 10,
        left: 80,
        width: 110,
        textAlign: 'left',
        fontWeight: 700,
        fontSize: 14
      }
    })
    panel.addPrintText({
      options: {
        title: name,
        top: 35,
        left: 80,
        width: 100,
        textAlign: 'left',
        fontWeight: 500,
        fontSize: 12
      }
    })
    panel.addPrintText({
      options: {
        title: labelCode,
        top: 60,
        left: 80,
        width: 100,
        textAlign: 'left',
        fontWeight: 500,
        fontSize: 12
      }
    })
    hiprintInstance.value?.design('#hiprint-printTemplate')
  }
}

/**
 * @description 使用模板对象实现多面板打印
 * @link https://juejin.cn/post/7200642382089044027#heading-3
 * */
const onPrint = () => {
  printLoading.value = true
  hiprintInstance.value?.print(
    {}, // (批量)打印
    {
      // 面板偏移设置
      leftOffset: -10, // 左偏移
      topOffset: -10 // 上偏移
    },
    {
      callback() {
        printLoading.value = false
      },
      stylehandler() {
        // 这里拼接成放html->head标签内的css/style
        // 1.例如：使用hiprin官网的样式
        // let css =
        //   '<link href="http://hiprint.io/Content/hiprint/css/print-lock.css" media="print" rel="stylesheet">'
        // 2.重写样式：所有文本红色
        // css += '<style>.hiprint-printElement-text{color:red !important;}</style>'
        // return css
      }
    }
  )
}

onMounted(() => {
  init()
})
</script>

<template>
  <Dialog title="打印" v-model="dialogVisible" width="500px">
    <el-scrollbar max-height="500px" :view-style="{ padding: '15px', position: 'relative' }">
      <div ref="hiprintRef" id="hiprint-printTemplate"></div>
      <div class="mask absolute"></div>
    </el-scrollbar>
    <template #footer>
      <el-button type="primary" @click.stop="onPrint" v-loading="printLoading">
        <Icon icon="ep:printer" /> 打印
      </el-button>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </Dialog>
</template>

<style scoped lang="scss">
// stylelint-disable
#hiprint-printTemplate {
  margin: 0 auto;
  width: 300px;
}

:deep(.hiprint-printPanel:not(:last-child)) {
  margin-bottom: 30px;
}

.mask {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}
</style>
