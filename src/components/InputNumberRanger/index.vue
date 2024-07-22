<script setup lang="ts">
import { isNullOrUnDef, isNumber } from '@/utils/is'

defineOptions({
  name: 'InputNumberRanger',
  inheritAttrs: false
})

type RangeType = [number | undefined | null, number | undefined | null]

const props = withDefaults(
  defineProps<{
    modelValue: RangeType
    inputWidth: string // 两个输入框的长度
  }>(),
  {
    modelValue: () => [undefined, undefined],
    inputWidth: '100px'
  }
)

const emit = defineEmits<{
  'update:modelValue': [RangeType]
}>()

const attrs = useAttrs()

const startNum = computed(() => props.modelValue[0])
const endNum = computed(() => props.modelValue[1])

const onStartChange = (value: number | null) => {
  const range = [value, endNum.value] as RangeType

  if (isNullOrUnDef(value)) {
    // 没有值时，将 min 作为初始值
    range[0] = isNumber(attrs.min) ? attrs.min : undefined
  } else {
    // 存在值时，保证 end 不小于 start
    if (isNullOrUnDef(endNum.value) || value > endNum.value) {
      range[1] = value
    }
  }

  emit('update:modelValue', range)
}

const onEndChange = (value: number | null) => {
  emit('update:modelValue', [startNum.value, value])
}
</script>

<template>
  <el-row class="input-number-ranger" :gutter="20">
    <el-col :span="11">
      <el-input-number
        v-model="startNum"
        v-bind="attrs"
        controls-position="right"
        class="start-input"
        @change="onStartChange"
      />
    </el-col>
    <el-col :span="11">
      <el-input-number
        v-model="endNum"
        v-bind="attrs"
        :min="isNumber(startNum) ? startNum : Number(attrs.min)"
        controls-position="right"
        class="end-input"
        @change="onEndChange"
      />
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.start-input,
.end-input {
  width: v-bind('props.inputWidth');
}
</style>
