<template>
  <div class="flex-shrink-0 glass-panel-solid border-t border-slate-200/50 px-4 sm:px-6 lg:px-10 xl:px-16 py-4">
    <div class="max-w-4xl mx-auto">
      <!-- Input Row -->
      <div class="flex items-end gap-2.5">
        <div class="flex-1 relative">
          <textarea
            ref="inputRef"
            v-model="text"
            :placeholder="placeholder"
            :disabled="isLoading"
            rows="1"
            class="input-field pr-14 min-h-[48px] max-h-[120px] resize-none"
            style="field-sizing: content"
            @keydown.enter.exact.prevent="handleSend"
            @input="autoResize"
          />
          <button
            class="absolute right-2.5 bottom-2.5 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ease-out"
            :class="canSend
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 cursor-pointer'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'"
            :disabled="!canSend"
            @click="handleSend"
          >
            <Icons v-if="!isLoading" name="send" :size="16" />
            <Icons v-else name="loader" :size="16" />
          </button>
        </div>
      </div>

      <!-- Hint -->
      <p class="mt-2.5 text-center text-[11px] text-slate-300 font-body flex items-center justify-center gap-1">
        <Icons name="info" :size="11" />
        刷新或关闭页面将清空所有对话记录 · 数据仅存于浏览器内存，不上传服务器
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isLoading: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const text = ref('')
const inputRef = ref<HTMLTextAreaElement>()

const canSend = computed(() => text.value.trim().length > 0 && !props.isLoading)

const placeholder = computed(() =>
  props.isLoading ? '正在思考中...' : '输入你的需求，例如「想看冲锋衣」...'
)

function handleSend() {
  if (!canSend.value) return
  emit('send', text.value)
  text.value = ''
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function autoResize(e: Event) {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>
