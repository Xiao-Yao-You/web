<script setup lang="ts">
import { useSpeechSynthesis } from '@vueuse/core'
import { useIcon } from '@/hooks/web/useIcon'
import { getNewRepairOrder } from '@/api/repair'
import { useEmitt } from '@/hooks/web/useEmitt'
import { checkPermi } from '@/utils/permission'

defineOptions({
  name: 'SpeechBoardcast'
})

const message = useMessage()
const MicroPhoneIcon = useIcon({ icon: 'ep:microphone', size: 18 })
const MuteIcon = useIcon({ icon: 'ep:mute', size: 18 })

const disabled = ref(false)
// 开启/关闭语音播报
// const handleToggle = () => {
//   disabled.value = !disabled.value
//   if (disabled.value) {
//     message.notify('语音播报已关闭')
//     stop()
//   } else {
//     message.notifySuccess('语音播报已开启')
//     text.value = '语音播报已开启'
//     play()
//   }
// }

// #region 语音播报 https://github.com/vueuse/vueuse/blob/main/packages/core/useSpeechSynthesis/demo.vue
const text = ref(' ')
const speech = useSpeechSynthesis(text, { lang: 'zh-CN' })

// 语音初始化
const initSpeech = () => {
  if (speech.isSupported.value) {
    enableSpeech()
  } else {
    message.alert('您的浏览器暂不支持语音播报，请知悉')
  }
}
// 语音启用
const enableSpeech = () => {
  // 1. 尝试首次播报
  speech.speak()

  // 2. 根据播报结果，判断是否需要再执行一次
  if (speech.error.value) {
    console.error('speech error: ' + speech.error.value.error)
    message
      .confirm(
        '系统检测到语音自动播报失败，请手动开启。（温馨提示：请确保扬声器已打开。）',
        '系统提示',
        {
          type: 'warning',
          confirmButtonText: '开启',
          showCancelButton: false,
          showClose: false,
          closeOnClickModal: false,
          closeOnPressEscape: false
        }
      )
      .then(() => {
        text.value = '语音播报已开启'
        play()
        disabled.value = false
      })
  }
}

// 语音播报
const play = () => {
  if (speech.status.value === 'pause') {
    window.speechSynthesis.resume()
  } else {
    speech.speak()
  }
}
// 语音取消
// const stop = () => speech.stop()
// 语音暂停
// const pause = () => {
//   window.speechSynthesis.pause()
// }
// #endregion

// 新工单数量查询
const { emitter } = useEmitt()
const query = async () => {
  const count = await getNewRepairOrder()
  if (count) {
    emitter.emit('getNewOrder')
    if (!disabled.value) {
      text.value = `您有${count}份新的运维工单，请及时处理。`
      play()
    }
  }
}

onMounted(() => {
  // 有播报权限的才初始化
  if (checkPermi(['repair:speech'])) initSpeech()
  // 主动查询一次（后续通过 Websocket 推送）
  query()
})
</script>

<template>
  <div class="custom-hover">
    <el-tooltip effect="dark" content="点击开启或关闭语音播报" placement="bottom-end">
      <MuteIcon v-if="disabled" />
      <MicroPhoneIcon v-else />
    </el-tooltip>
  </div>
</template>
