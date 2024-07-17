import { defineComponent, computed, ref, onBeforeUnmount } from 'vue'
import dayjs from 'dayjs'

import './index.scss'

type TimeRangeItem = {
  id: number // 当前间隔序号
  startTime: string
  endTime: string
  disabled?: boolean
  hidden?: boolean
}

export default defineComponent({
  name: 'TimeRangePicker',
  props: {
    forbidden: {
      type: Boolean,
      default: false
    },
    // 步长，类型为 10 的正整数倍（最小 10，最大 60，默认 30，即 30 分钟一个间隔，24 h 共为 48 个间隔））
    step: {
      type: Number,
      default: 30,
      validator(value: number) {
        return [10, 20, 30, 40, 50, 60].includes(value)
      }
    },
    // 一个用来判断该日期是否被隐藏的函数，接受日期间隔的 startTime （'HH:mm' 字符串）以供判断。
    hiddenDate: {
      type: Function,
      default() {
        return false
      }
    },
    // 一个用来判断该日期是否被禁用的函数，接受日期间隔的 startTime （'HH:mm' 字符串）以供判断。
    disabledDate: {
      type: Function,
      default() {
        return false
      }
    }
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    const start = ref<TimeRangeItem | null>(null) // 时间段起点
    const end = ref<TimeRangeItem | null>(null) // 时间段终点
    const temp = ref<TimeRangeItem | null>(null) // 指针，代表当前选中的点（用以记录中间的点击状态）

    // [时间起点(id), 时间终点(id)]，根据数组的变化来判断选择状态
    const range = computed(() => [start.value?.id, end.value?.id].filter((id) => id))

    // 间隔总数
    const total = computed(() => (24 * 60) / props.step)

    // 根据间隔时间分配出的配置选项
    const options = computed<TimeRangeItem[]>(() => {
      let currTime = dayjs('00:00', 'HH:mm')
      const list = Array.from({ length: total.value }) as TimeRangeItem[]

      // 配置段点信息
      for (let i = 0; i < total.value; i++) {
        const item = {
          startTime: currTime.format('HH:mm'),
          endTime: '',
          disabled: false,
          hidden: false,
          id: -1
        }

        // !请注意，以下顺序不要打乱，避免不必要的逻辑错误
        item.hidden = props.hiddenDate(item.startTime)
        // prettier-ignore
        currTime = i === total.value - 1
          ? currTime.endOf('day') // 凌晨，算作 23:59:79 而不是 00:00
          : currTime.add(props.step, 'minute')
        item.id = i + 1
        item.endTime = currTime.format('HH:mm')
        item.disabled = props.disabledDate(item.endTime, item.id)
        list[i] = item
      }

      return list
    })

    function setTimeInfo(type: 'clearAll'): void
    function setTimeInfo(type: 'start' | 'end', info: TimeRangeItem | 'clear'): void
    function setTimeInfo(type: 'start' | 'end' | 'clearAll', info?: TimeRangeItem | 'clear'): void {
      // 清空
      if (type === 'clearAll') {
        start.value = null
        end.value = null
        temp.value = null
        return
      }
      // 保存
      switch (type) {
        case 'start':
          start.value = info === 'clear' ? null : info!
          break
        case 'end':
          end.value = info === 'clear' ? null : info!
          break
        default:
          break
      }
    }

    const handleClick = (timeInfo: TimeRangeItem) => {
      if (props.forbidden || timeInfo.disabled) return

      switch (range.value.length) {
        case 0:
          // 场景一：一个没选，配置起点（也是终点）
          setTimeInfo('start', timeInfo)
          setTimeInfo('end', timeInfo)
          break
        case 2: {
          // 场景二：已有两个值（起点和终点）
          // (1) 如果两个点为同一个，则可以再添加一个点
          //    (1.1) 如果 timeInfo 与当前值重复，跳过（暂时不用取消）
          //    (1.2) 如果 timeInfo 在当前值之前，则 timeInfo 视为起点，当前值视为终点
          //    (1.3) 如果 timeInfo 在当前值之后，则 当前值 视为起点，timeInfo 视为终点
          // (2) 如果两个点不一样，则参照 element-plus 时间范围选择器，直接清空，重新选择，回到场景一
          const [startId, endId] = range.value as [number, number]
          if (startId === endId) {
            if (timeInfo.id < startId) {
              setTimeInfo('start', timeInfo)
              setTimeInfo('end', temp.value!)
            } else if (timeInfo.id > startId) {
              setTimeInfo('start', temp.value!)
              setTimeInfo('end', timeInfo)
            }
          } else {
            setTimeInfo('clearAll')
            setTimeInfo('start', timeInfo)
            setTimeInfo('end', timeInfo)
          }
          break
        }
        default:
          break
      }

      temp.value = timeInfo

      ctx.emit('update:modelValue', [
        { label: start.value?.startTime, value: start.value?.id },
        { label: end.value?.endTime, value: end.value?.id }
      ])
    }

    // 时间段内的高亮样式
    const isInRange = (id: number) => {
      if (range.value.length === 2) {
        const [startId, endId] = range.value as [number, number]
        return id > startId && id < endId
      }
      return false
    }

    onBeforeUnmount(() => {
      setTimeInfo('clearAll')
    })

    ctx.expose({
      clear: () => setTimeInfo('clearAll')
    })

    const Children = () => {
      const children = options.value.filter((child) => !child.hidden)
      return (
        <>
          {children.map((child, index) => (
            <li class="relative">
              <div
                class={[
                  'box',
                  'h-full',
                  { 'time-active': range.value.includes(child.id) },
                  { 'time-inrange': isInRange(child.id) },
                  { 'time-disabled': child.disabled }
                ]}
                onClick={handleClick.bind(null, child)}
              />
              {/* 奇数个（index 从 0 开始）展示 startTime */}
              {index % 2 ? null : <span class="start-time absolute">{child.startTime}</span>}
              {index === children.length - 1 ? (
                <span class="end-time absolute">{child.endTime}</span>
              ) : null}
            </li>
          ))}
        </>
      )
    }

    return () => (
      <ul
        class={[
          'time-range-picker',
          'flex',
          'flex-wrap',
          'p-0',
          'm-0',
          { forbidden: props.forbidden }
        ]}
      >
        <Children />
      </ul>
    )
  }
})
