import { useWebSocket, type UseWebSocketReturn, type UseWebSocketOptions } from '@vueuse/core'
import { getAccessToken } from '@/utils/auth'

interface SocketReturn extends UseWebSocketReturn<any> {
  reconnect: (accessToken?: string) => void
}

export const generateUrl = (accessToken?: string) => {
  const token = accessToken || getAccessToken()
  return (import.meta.env.VITE_BASE_URL + '/infra/ws').replace('http', 'ws') + `?token=${token}`
}

// 存储所有 WebSocket 实例
const socketInstances = new Map<string, UseWebSocketReturn<any>>()

const useSocket = function (
  wsUrl?: Ref<string> | string,
  options: UseWebSocketOptions = {}
): SocketReturn {
  if (!wsUrl) wsUrl = generateUrl()
  const reactiveUrl = typeof wsUrl === 'string' ? ref(wsUrl) : wsUrl

  // 当前实例
  let currentInstance: UseWebSocketReturn<any> | null = null
  const instanceKey = reactiveUrl.value

  // 创建或获取 WebSocket 实例
  const createOrGetInstance = () => {
    if (socketInstances.has(instanceKey)) {
      currentInstance = socketInstances.get(instanceKey)!
    } else {
      currentInstance = useWebSocket(reactiveUrl, {
        autoReconnect: false,
        heartbeat: true,
        ...options
      })
      socketInstances.set(instanceKey, currentInstance)
    }
    return currentInstance
  }

  // 初始化实例
  createOrGetInstance()

  // 清理旧连接
  const cleanup = () => {
    if (currentInstance && currentInstance.status.value !== 'CLOSED') {
      currentInstance.close(1000, 'URL changed')
      socketInstances.delete(instanceKey)
    }
  }

  // 重连方法
  const reconnect = (url?: string) => {
    cleanup()
    if (url && url !== instanceKey) reactiveUrl.value = url
    // useWebSocket() 自动创建新的连接
    currentInstance = createOrGetInstance()
  }

  // 组件卸载时清理
  onUnmounted(() => {
    cleanup()
  })

  // 监听 URL 变化（暂时用不上，可以用 reconnect() 替代, 如果想使用响应式更新，可以传入 ref(wsUrl)）
  // watch(reactiveUrl, (newUrl, oldUrl) => {
  //   if (newUrl !== oldUrl) {
  //     cleanup()
  //     currentInstance = createOrGetInstance()
  //   }
  // })

  return {
    ...currentInstance!,
    reconnect
  }
}

export default useSocket
