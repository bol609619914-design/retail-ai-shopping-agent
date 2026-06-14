<template>
  <header class="flex-shrink-0 px-4 sm:px-6 py-3 glass-panel-solid border-b border-slate-200/50">
    <div class="max-w-3xl mx-auto flex items-center justify-between">
      <!-- Logo & Title -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-glass-emerald">
          <Icons name="sparkles" :size="20" class="text-white" />
        </div>
        <div>
          <h1 class="text-base font-heading font-semibold text-slate-900 leading-tight">AI 智能导购</h1>
          <p class="text-[11px] text-slate-400 font-body">基于意图理解 · 实时推荐</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <Transition name="fade">
          <button
            v-if="hasMessages"
            class="btn-ghost text-xs gap-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50"
            @click="$emit('clear')"
          >
            <Icons name="trash" :size="14" />
            清空
          </button>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  hasMessages: boolean
}>()

defineEmits<{
  clear: []
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
