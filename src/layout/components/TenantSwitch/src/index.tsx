/** 切换租户（公司） */
import { defineComponent, onMounted, ref } from 'vue'
import { propTypes } from '@/utils/propTypes'
import { Icon } from '@/components/Icon'
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { queryUserTenantById, switchUserTenant } from '@/api/system/tenant'
import { getTenantId, setTenantId, setToken } from '@/utils/auth'
import { deleteUserCache } from '@/hooks/web/useCache'

export default defineComponent({
  name: 'TenantSwitch',
  props: {
    color: propTypes.string.def('')
  },
  setup(props) {
    const { wsCache } = useCache()
    const currentTenantId = getTenantId()

    const tenantList = ref<{ value: number; label: string }[]>([])

    const slots = {
      default: () => (
        <Icon class="cursor-pointer !p-0" color={props.color} size={18} icon="ep:switch" />
      ),
      dropdown: () => (
        <ElDropdownMenu>
          {tenantList.value.map((item, index) => {
            const disabled = currentTenantId === item.value
            return (
              <ElDropdownItem command={item.value} disabled={disabled} class={index}>
                {`${item.label}${disabled ? '（当前）' : ''}`}
              </ElDropdownItem>
            )
          })}
        </ElDropdownMenu>
      )
    }

    // 切换租户（公司）重置token，刷新页面
    const handleCommand = async (tenantId: number) => {
      const tokens = await switchUserTenant({ tenantId })
      deleteUserCache()
      setTenantId(tenantId)
      setToken(tokens)
      window.top?.location.reload()
    }

    onMounted(() => {
      const {
        user: { id: userId }
      } = wsCache.get(CACHE_KEY.USER)

      queryUserTenantById({ userId }).then(({ tenantDOList: list }) => {
        tenantList.value = list.map((item) => ({
          label: item.tenantName,
          value: item.tenantId
        }))
      })
    })

    return () => (
      <ElDropdown class="prefixCls" trigger="click" onCommand={handleCommand} v-slots={slots} />
    )
  }
})
