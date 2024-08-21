<script setup lang="ts">
import type { ElInput } from 'element-plus'
import { useIcon } from '@/hooks/web/useIcon'

type TypeProps = 'primary' | 'success' | 'info' | 'warning' | 'danger'

defineOptions({
  name: 'EditableTagGroup'
})

const modelValue = defineModel<string[]>({
  type: Array,
  default: []
})

const props = withDefaults(
  defineProps<{
    tagType?: TypeProps
    tagEffect?: 'dark' | 'light' | 'plain'
    buttonType?: TypeProps | 'text'
  }>(),
  {
    tagType: 'primary',
    tagEffect: 'light',
    buttonType: 'primary'
  }
)

const DeleteIcon = useIcon({ icon: 'ep:delete', size: 12 })
const AddIcon = useIcon({ icon: 'ep:plus', size: 12 })

const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()

const handleClose = (tag: string) => {
  modelValue.value.splice(modelValue.value.indexOf(tag), 1)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    modelValue.value.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

const onClear = () => {
  inputVisible.value = false
  inputValue.value = ''
  modelValue.value = []
}
</script>

<template>
  <div class="flex gap-2">
    <el-tag
      v-for="tag in modelValue"
      :key="tag"
      :type="props.tagType"
      :effect="props.tagEffect"
      closable
      :disable-transitions="false"
      @close="handleClose(tag)"
    >
      {{ tag }}
    </el-tag>

    <el-input
      ref="InputRef"
      v-if="inputVisible"
      v-model="inputValue"
      class="w-20! flex-wrap"
      size="small"
      maxlength="20"
      @keyup.enter="handleInputConfirm"
      @blur="handleInputConfirm"
    />
    <el-button v-else :type="props.buttonType" size="small" @click="showInput">
      <AddIcon class="mr-2px" />
      添加
    </el-button>
    <el-button v-show="modelValue.length" size="small" class="ml-unset!" @click="onClear">
      <DeleteIcon class="mr-2px" />
      清空
    </el-button>
  </div>
</template>

<style scoped></style>
