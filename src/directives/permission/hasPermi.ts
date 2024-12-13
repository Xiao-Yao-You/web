import type { App } from 'vue'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

const { t } = useI18n() // 国际化

export function hasPermi(app: App<Element>) {
  app.directive('hasPermi', (el, binding) => {
    const { wsCache } = useCache()

    let { value } = binding
    if (typeof value === 'string') {
      value = eval(value) // 将字符串数组转成数组
    }

    const all_permission = '*:*:*'
    const permissions = wsCache.get(CACHE_KEY.USER).permissions

    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value

      const hasPermissions = permissions.some((permission: string) => {
        return all_permission === permission || permissionFlag.includes(permission)
      })

      if (!hasPermissions) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      throw new Error(t('permission.hasPermission'))
    }
  })
}
