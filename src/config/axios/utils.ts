import axios from 'axios'
import { getRefreshToken, getTenantId, setToken } from '@/utils/auth'
import { config } from '@/config/axios/config'
import { useCache, CACHE_KEY } from '@/hooks/web/useCache'
import useSocket, { generateUrl } from '@/hooks/web/useSocket'

const { base_url } = config
const { wsCache } = useCache()
const { reconnect } = useSocket()

// 运维工单管理员登录
export const loginForRepair = async () => {
  axios.defaults.headers.common['tenant-id'] = getTenantId()
  const { data } = await axios.post<IResponse>(base_url + '/system/auth/login', {
    username: 'repairAdmin',
    password: 'repairAdmin',
    tenantName: '恒科新材料有限公司',
    rememberMe: true
  })
  if (!data.code) {
    return data.data
  } else {
    return Promise.reject(data)
  }
}

// 刷新令牌（直接使用 axios 封装）
export const refreshToken = async () => {
  axios.defaults.headers.common['tenant-id'] = getTenantId()
  const {
    data: { code, data, msg }
  } = await axios.post<IResponse>(
    base_url + '/system/auth/refresh-token?refreshToken=' + getRefreshToken()
  )

  switch (code) {
    case 0:
      // 成功，重置令牌
      setToken(data)
      break
    case 400:
      {
        // * 特殊情况：运维工单管理员的账号过期自动重登
        const username = wsCache.get(CACHE_KEY.USER)?.user?.username
        if (msg === '无效的刷新令牌' && username === 'repairAdmin') {
          const tokens = await loginForRepair()
          setToken(tokens)

          // * websocket 重新连接
          reconnect(generateUrl(tokens.accessToken))
        }
      }
      break
    default:
      return Promise.reject(data)
  }
}
