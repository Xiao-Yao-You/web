import type { App } from 'vue'
import VueHiPrint, { hiPrintPlugin } from 'vue-plugin-hiprint'

// 取消 WebSocket 自动打印直接连接客户端
hiPrintPlugin.disAutoConnect()

export const setupHiprint = (app: App<Element>) => {
  app.use(VueHiPrint)
}
