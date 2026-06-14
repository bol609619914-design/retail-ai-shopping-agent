export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  items?: ProductItem[]
  timestamp: number
}

export interface ProductItem {
  id: number
  name: string
  brand?: string
  category: string
  color: string
  price: number
  image: string           // emoji fallback
  image_url?: string      // 真实产品图
  description: string
  product_url?: string    // 商品详情链接
  search_url?: string     // 兼容旧字段
}

interface ChatResponse {
  reply: string
  items: ProductItem[]
  intent_tags: string[]
  price_range: { min?: number; max?: number } | null
  source: 'llm' | 'rules'
}

const MAX_HISTORY_ROUNDS = 3

export function useChat() {
  const config = useRuntimeConfig()
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  let abortController: AbortController | null = null

  async function sendMessage(content: string) {
    if (!content.trim() || isLoading.value) return

    if (abortController) {
      abortController.abort()
    }
    abortController = new AbortController()

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    }
    messages.value.push(userMessage)
    isLoading.value = true
    error.value = null

    try {
      const history = messages.value
        .slice(-(MAX_HISTORY_ROUNDS * 2) + 1, -1)
        .map(({ role, content }) => ({ role, content }))

      const data = await $fetch<ChatResponse>(`${config.public.apiBase}/api/chat`, {
        method: 'POST',
        body: {
          messages: history,
          currentMessage: content.trim(),
        },
        signal: abortController.signal,
      })

      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.reply,
        items: data.items,
        timestamp: Date.now(),
      }
      messages.value.push(aiMessage)
    } catch (err: any) {
      if (err?.name === 'AbortError') return

      console.error('发送消息失败:', err)
      error.value = '网络异常，请稍后重试'
      messages.value.push({
        id: Date.now() + 1,
        role: 'assistant',
        content: '抱歉，网络出了点问题，请稍后再试。',
        items: [],
        timestamp: Date.now(),
      })
    } finally {
      isLoading.value = false
    }
  }

  function clearChat() {
    if (abortController) {
      abortController.abort()
    }
    messages.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    messages: readonly(messages),
    isLoading: readonly(isLoading),
    error: readonly(error),
    sendMessage,
    clearChat,
  }
}
