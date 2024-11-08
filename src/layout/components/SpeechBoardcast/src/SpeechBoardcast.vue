<script setup lang="ts">
import { useSpeechSynthesis } from '@vueuse/core'
import { useIcon } from '@/hooks/web/useIcon'
import { getNewRepairOrder } from '@/api/repair'
import { useEmitt } from '@/hooks/web/useEmitt'
import { useCache } from '@/hooks/web/useCache'
import { checkPermi } from '@/utils/permission'

defineOptions({
  name: 'SpeechBoardcast'
})
const { wsCache } = useCache()
const message = useMessage()
const MicroPhoneIcon = useIcon({ icon: 'ep:microphone', size: 18 })
const MuteIcon = useIcon({ icon: 'ep:mute', size: 18 })

const disabled = ref(true)
const handleToggle = () => {
  disabled.value = !disabled.value
  if (disabled.value) {
    message.notify('语音播报已关闭')
    stop()
  } else {
    message.notifySuccess('语音播报已开启')
    text.value = '语音播报已开启'
    play()
  }
}

// #region 语音播报 https://github.com/vueuse/vueuse/blob/main/packages/core/useSpeechSynthesis/demo.vue
const voice = ref<SpeechSynthesisVoice>(undefined as unknown as SpeechSynthesisVoice)
const text = ref(' ')
const speech = useSpeechSynthesis(text, { lang: 'zh-CN' })

// 语音初始化
const initSpeech = () => {
  if (speech.isSupported.value) {
    setTimeout(() => {
      voice.value = window.speechSynthesis.getVoices()[0]
    })
    enableSpeech()
  } else {
    message.alert('您的浏览器暂不支持语音播报，请知悉')
  }
}
// 语音启用
const enableSpeech = () => {
  // 1. 尝试首次播报
  speech.speak()
  // 2. 首次加载可能会出现 'not-allowed' 错误，需用户手动触发
  if (speech.status.value === 'init') {
    if (!speech.error.value) {
      disabled.value = true
    } else if (speech.error.value.error === 'not-allowed' && !wsCache.get('noSpeechTip')) {
      message
        .confirm(
          `<div>
            由于系统限制，语音播报默认关闭，请确认是否开启？<br/>
            温馨提示：开启前请确保扬声器已打开。<br/>
            <p style="margin-top: 12px">您也可以点击右上角语音手动开启或关闭。</p>
          </div>`,
          {
            confirmButtonText: '开启',
            cancelButtonText: '一周内不再提醒',
            dangerouslyUseHTMLString: true,
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
        .catch(() => {
          wsCache.set('noSpeechTip', true, { exp: 60 * 60 * 24 * 7 })
        })
    }
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
const stop = () => speech.stop()
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
  // 需要播报的，开始语音初始化
  if (checkPermi(['repair:speech'])) initSpeech()
  // 轮询工单
  query()
  setInterval(
    () => {
      query()
    },
    1000 * 60 * 5
  )
})
</script>

<template>
  <div class="custom-hover" @click="handleToggle">
    <el-tooltip effect="dark" content="点击开启或关闭语音播报" placement="bottom-end">
      <MuteIcon v-if="disabled" />
      <MicroPhoneIcon v-else />
    </el-tooltip>
  </div>
</template>
