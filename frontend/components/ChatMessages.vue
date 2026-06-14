<template>
  <div ref="container" class="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-6">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Welcome -->
      <Transition name="fade">
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center py-20 sm:py-28">
          <!-- Hero Icon -->
          <div class="relative mb-8">
            <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center animate-float shadow-glass-emerald">
              <Icons name="wand" :size="40" class="text-emerald-600" />
            </div>
            <div class="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Icons name="sparkles" :size="16" class="text-white" />
            </div>
          </div>

          <h2 class="text-2xl font-heading font-semibold text-slate-900 mb-2 animate-slide-up text-balance text-center">
            你好，我是 AI 导购助手
          </h2>
          <p class="text-sm text-slate-500 mb-10 animate-slide-up text-center max-w-xs" style="animation-delay: 0.08s">
            告诉我你想找什么，我来帮你精准推荐
          </p>

          <!-- Quick Tags -->
          <div class="flex flex-wrap justify-center gap-2.5 animate-slide-up" style="animation-delay: 0.16s">
            <button
              v-for="tag in quickTags"
              :key="tag.text"
              class="tag-pill group"
              @click="$emit('send', tag.text)"
            >
              <span class="inline-flex items-center gap-1.5">
                <Icons :name="tag.icon" :size="16" class="text-slate-400 group-hover:text-emerald-500 transition-colors duration-200" />
                {{ tag.label }}
              </span>
            </button>
          </div>

          <!-- Hint -->
          <p class="mt-8 text-[11px] text-slate-300 animate-fade-in flex items-center gap-1" style="animation-delay: 0.3s">
            <Icons name="info" :size="12" />
            刷新页面将清空对话 · 数据仅存于浏览器内存
          </p>
        </div>
      </Transition>

      <!-- Message List -->
      <template v-for="(msg, index) in messages" :key="msg.id">
        <div
          :class="[
            'flex gap-3',
            msg.role === 'user' ? 'justify-end' : 'justify-start',
            'animate-slide-up',
          ]"
          :style="{ animationDelay: `${Math.min(index * 0.04, 0.2)}s` }"
        >
          <!-- AI Avatar -->
          <div v-if="msg.role === 'assistant'" class="flex-shrink-0 mt-1">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-glass-emerald">
              <Icons name="bot" :size="18" class="text-white" />
            </div>
          </div>

          <!-- Bubble -->
          <div
            :class="[
              'max-w-[82%] sm:max-w-[72%]',
              msg.role === 'user' ? 'order-1' : 'order-2',
            ]"
          >
            <div
              :class="[
                'px-4 py-3 text-sm leading-relaxed font-body',
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl rounded-br-md shadow-glass-emerald'
                  : 'glass-panel-solid text-slate-800 rounded-2xl rounded-bl-md',
              ]"
            >
              {{ msg.content }}
            </div>

            <!-- Products -->
            <div
              v-if="msg.role === 'assistant' && msg.items && msg.items.length > 0"
              class="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              <ProductCard
                v-for="item in msg.items"
                :key="item.id"
                :item="item"
              />
            </div>
          </div>

          <!-- User Avatar -->
          <div v-if="msg.role === 'user'" class="flex-shrink-0 mt-1 order-2">
            <div class="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center">
              <Icons name="user" :size="18" class="text-slate-500" />
            </div>
          </div>
        </div>
      </template>

      <!-- Loading -->
      <Transition name="fade">
        <div v-if="isLoading" class="flex gap-3 justify-start animate-fade-in">
          <div class="flex-shrink-0 mt-1">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-glass-emerald">
              <Icons name="bot" :size="18" class="text-white" />
            </div>
          </div>
          <div class="glass-panel-solid rounded-2xl rounded-bl-md px-5 py-3.5">
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-dot" />
              <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-dot" style="animation-delay: 0.2s" />
              <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-dot" style="animation-delay: 0.4s" />
            </div>
          </div>
        </div>
      </Transition>

      <!-- Scroll anchor -->
      <div ref="scrollAnchor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '~/composables/useChat'

const props = defineProps<{
  messages: ChatMessage[]
  isLoading: boolean
}>()

defineEmits<{
  send: [content: string]
}>()

const scrollAnchor = ref<HTMLElement>()

const quickTags = [
  { icon: 'shopping-bag', label: '冲锋衣', text: '想看冲锋衣' },
  { icon: 'shopping-bag', label: '运动鞋', text: '推荐一双运动鞋' },
  { icon: 'shopping-bag', label: '平价T恤', text: '有便宜的T恤吗' },
  { icon: 'shopping-bag', label: '双肩包', text: '需要一个双肩包' },
]

watch(
  () => props.messages.length,
  () => {
    nextTick(() => {
      scrollAnchor.value?.scrollIntoView({ behavior: 'smooth' })
    })
  },
)

watch(
  () => props.isLoading,
  (val) => {
    if (val) {
      nextTick(() => {
        scrollAnchor.value?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  },
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
