<script setup lang="ts">
import { useSpeechSynthesis } from '@vueuse/core'
import { useIcon } from '@/hooks/web/useIcon'
import { getNewRepairOrder } from '@/api/repair'
import { useEmitt } from '@/hooks/web/useEmitt'
import { useWebSocket } from '@vueuse/core'
import { getAccessToken } from '@/utils/auth'

defineOptions({
  name: 'SpeechBoardcast'
})

const message = useMessage()
const MicroPhoneIcon = useIcon({ icon: 'ep:microphone', size: 18 })
const MuteIcon = useIcon({ icon: 'ep:mute', size: 18 })
const disabled = ref(false)

// #region 语音播报 https://github.com/vueuse/vueuse/blob/main/packages/core/useSpeechSynthesis/demo.vue
const text = ref(' ')
const speech = useSpeechSynthesis(text, { lang: 'zh-CN' })

// 语音播报
const play = (content?: string) => {
  if (!speech.isSupported.value) {
    return message.alert('您的浏览器暂不支持语音播报，请知悉')
  }
  if (content) text.value = content
  if (speech.status.value === 'pause') {
    window.speechSynthesis.resume()
  } else {
    speech.speak()
  }
}

// 开启/关闭语音播报
const handleToggle = () => {
  play('语音播报已开启')
  // disabled.value = !disabled.value
  // if (disabled.value) {
  //   message.notify('语音播报已关闭')
  //   speech.stop()
  // } else {
  //   message.notifySuccess('语音播报已开启')
  //   play('语音播报已开启')
  // }
}
// #endregion

// #region WebSocket
const { data } = useWebSocket(
  (import.meta.env.VITE_BASE_URL + '/infra/ws').replace('http', 'ws') +
    '?token=' +
    getAccessToken(),
  {
    autoReconnect: false,
    heartbeat: true
  }
)

// 监听接收到的数据
const timer = ref<null | number>(null)
const clearTimer = () => {
  if (timer.value) {
    window.clearInterval(timer.value)
    timer.value = null
  }
}

// 语音轮播
const carouselPlay = () => {
  clearTimer()
  text.value = '您有新的运维工单，请及时处理。'
  play()
  timer.value = window.setInterval(() => {
    play()
  }, 1000 * 6)
}

watchEffect(() => {
  if (!data.value || data.value === 'pong') return

  try {
    const jsonMessage = JSON.parse(data.value)
    const type = jsonMessage.type
    const content = JSON.parse(jsonMessage.content)
    switch (type) {
      case 'order-push':
        emitter.emit('getNewOrder')
        if (content.NewOrder) {
          // 1. NewOrder: true，有新工单，一直播报
          carouselPlay()
        } else {
          // 2. NewOrder: false，没有新工单，停止播报
          clearTimer()
          speech.stop()
        }
        break
      default:
        console.log('未处理消息：' + data.value)
        break
    }
  } catch (error) {
    message.error('处理消息发生异常：' + data.value)
  }
})
// #endregion

// #region 新工单数量查询
const { emitter } = useEmitt()
const query = async () => {
  const count = await getNewRepairOrder()
  if (count) {
    emitter.emit('getNewOrder')

    // 只要有新工单就一直播报
    if (!disabled.value) carouselPlay()
  }
}

// 首次进入页面查询一次，主动获取工单嘴型情况（Websocket 只会在工单发生变化的时候推送）
onMounted(() => {
  query()
})
// #endregion

onUnmounted(() => {
  clearTimer()
  speech.stop()
})
</script>

<template>
  <div class="custom-hover" @click="handleToggle">
    <MuteIcon v-if="disabled" />
    <MicroPhoneIcon v-else />
  </div>
</template>
