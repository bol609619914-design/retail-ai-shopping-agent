<template>
  <div
    class="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden cursor-pointer shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-250 ease-out"
    @click="handleClick"
  >
    <!-- Image Area -->
    <div class="relative h-28 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden">
      <span class="text-4xl group-hover:scale-110 transition-transform duration-300 ease-out">{{ item.image }}</span>
      <!-- Price Badge -->
      <div class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm border border-white/50">
        <span class="text-xs font-heading font-bold text-orange-500">¥{{ item.price }}</span>
      </div>
    </div>

    <!-- Info -->
    <div class="p-3.5">
      <h4 class="text-xs font-heading font-semibold text-slate-800 truncate mb-1.5 group-hover:text-emerald-600 transition-colors duration-200">
        {{ item.name }}
      </h4>
      <p class="text-[11px] text-slate-400 font-body line-clamp-2 leading-relaxed">
        {{ item.description }}
      </p>
      <div class="mt-3 flex items-center justify-between">
        <span class="text-sm font-heading font-bold text-orange-500">¥{{ item.price }}</span>
        <span class="text-[11px] text-emerald-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-0.5">
          查看详情
          <Icons name="arrow-right" :size="12" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductItem } from '~/composables/useChat'

const props = defineProps<{
  item: ProductItem
}>()

function handleClick() {
  alert(`即将跳转：${props.item.name}\n（演示模式）`)
}
</script>
