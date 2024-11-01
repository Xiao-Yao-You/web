// 语音配置参数
export type SpeechOptions = Partial<
  Pick<
    SpeechSynthesisUtterance,
    | 'pitch'
    | 'rate'
    | 'text'
    | 'volume'
    | 'lang'
    | 'onboundary'
    | 'onend'
    | 'onerror'
    | 'onmark'
    | 'onpause'
    | 'onresume'
    | 'onstart'
  >
>

const defaultConfig = {
  pitch: 1, // [0, 1]，获取并设置话语的音调(值越大越尖锐,越低越低沉)
  rate: 1, // [0.1, 10]，获取并设置说话的速度(值越大语速越快,越小语速越慢，2是速度的两倍，0.5是速度的一半)
  volume: 10, // [0, 1] 获取并设置说话的音量
  lang: 'zh-CN'
}

/**
 * @description 基于 SpeechSynthesisUtterance 封装的语音播报功能
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/SpeechSynthesisUtterance}
 * @see {@link https://blog.csdn.net/Ljwen_/article/details/132641226}
 * @see {@link https://juejin.cn/post/7130489137857036295#heading-5}
 */
class Speech {
  private speechInstance = new SpeechSynthesisUtterance()

  constructor(config: SpeechOptions = defaultConfig) {
    Object.assign(this.speechInstance, config)
  }

  public speak(text?: string) {
    if (text) this.speechInstance.text = text
    window.speechSynthesis.speak(this.speechInstance)
  }

  // 暂停
  public pause() {
    window.speechSynthesis.pause()
  }

  // 继续播放
  public resume() {
    window.speechSynthesis.resume()
  }

  // 取消播放
  public cancel() {
    window.speechSynthesis.cancel()
  }

  // 获取播报信息
  public getSpeechStatus() {
    return {
      paused: window.speechSynthesis.paused, // 是否处于暂停状态 true-暂停
      pending: window.speechSynthesis.pending, // 有没有未播完的语音 true-有
      speaking: window.speechSynthesis.speaking // 是否存在语音 true-是
    }
  }
}

export default Speech
