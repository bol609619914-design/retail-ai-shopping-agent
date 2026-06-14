<template>
  <div class="h-screen flex bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:flex flex-col w-72 xl:w-80 border-r border-slate-200/60 bg-white/50 backdrop-blur-lg flex-shrink-0">
      <!-- Sidebar Header -->
      <div class="px-6 py-5 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-glass-emerald">
            <Icons name="sparkles" :size="22" class="text-white" />
          </div>
          <div>
            <h1 class="text-lg font-heading font-semibold text-slate-900 leading-tight">AI 智能导购</h1>
            <p class="text-xs text-slate-400 font-body">意图理解 · 实时推荐</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="flex-1 px-5 py-6 overflow-y-auto">
        <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4 px-1">快速开始</p>
        <div class="space-y-2">
          <button
            v-for="tag in sidebarTags"
            :key="tag.text"
            class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 cursor-pointer group"
            @click="sendMessage(tag.text)"
          >
            <div class="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors duration-200">
              <Icons :name="tag.icon" :size="18" class="text-slate-400 group-hover:text-emerald-500 transition-colors duration-200" />
            </div>
            <div>
              <span class="block text-sm">{{ tag.label }}</span>
              <span class="block text-[11px] text-slate-400 font-normal">{{ tag.desc }}</span>
            </div>
          </button>
        </div>

        <!-- Session Info -->
        <div class="mt-8 px-4 py-4 rounded-xl bg-slate-50 border border-slate-100">
          <div class="flex items-center gap-2 mb-2">
            <Icons name="info" :size="14" class="text-slate-400" />
            <span class="text-xs font-semibold text-slate-500">会话说明</span>
          </div>
          <ul class="text-[11px] text-slate-400 space-y-1.5 font-body">
            <li>· 对话数据仅存于浏览器内存</li>
            <li>· 刷新或关闭页面自动清空</li>
            <li>· 无需登录，即用即走</li>
            <li>· 最多关联最近 3 轮上下文</li>
          </ul>
        </div>
      </div>

      <!-- Sidebar Footer -->
      <div class="px-5 py-4 border-t border-slate-100">
        <button
          v-if="messages.length > 0"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer"
          @click="clearChat"
        >
          <Icons name="trash" :size="15" />
          清空对话
        </button>
        <p v-else class="text-center text-[11px] text-slate-300 font-body">
          v1.0 · 会话级单轮版
        </p>
      </div>
    </aside>

    <!-- Main Chat Area -->
    <main class="flex-1 flex flex-col min-w-0">
      <!-- Mobile Header -->
      <ChatHeader :has-messages="messages.length > 0" @clear="clearChat" class="lg:hidden" />

      <!-- Messages -->
      <ChatMessages
        :messages="messages"
        :is-loading="isLoading"
        @send="sendMessage"
      />

      <!-- Input -->
      <ChatInput :is-loading="isLoading" @send="sendMessage" />
    </main>
  </div>
</template>

<script setup lang="ts">
const { messages, isLoading, sendMessage, clearChat } = useChat()

const sidebarTags = [
  { icon: 'shopping-bag', label: '冲锋衣', desc: '户外防风外套', text: '想看冲锋衣' },
  { icon: 'shopping-bag', label: '运动鞋', desc: '跑步休闲皆可', text: '推荐一双运动鞋' },
  { icon: 'shopping-bag', label: '平价T恤', desc: '百元以内好物', text: '有便宜的T恤吗' },
  { icon: 'shopping-bag', label: '双肩包', desc: '通勤出行必备', text: '需要一个双肩包' },
  { icon: 'shopping-bag', label: '牛仔裤', desc: '经典百搭款', text: '推荐一条牛仔裤' },
  { icon: 'shopping-bag', label: '羽绒服', desc: '秋冬保暖外套', text: '想看羽绒服' },
]
</script>
