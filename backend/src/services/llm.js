/**
 * LLM 服务 - Mimo API 集成
 * 使用 OpenAI 兼容接口
 */
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.MIMO_API_KEY,
  baseURL: process.env.MIMO_BASE_URL || 'https://api.mimo.ai/v1',
});

const MODEL = process.env.MIMO_MODEL || 'mimo-7b';

/**
 * 从对话上下文中提取结构化意图
 * @param {Array} messages - 历史消息 [{role, content}]
 * @param {string} currentMessage - 当前用户消息
 * @returns {Promise<{intent_tags: string[], price_range: object|null, reply: string}>}
 */
async function parseIntentWithLLM(messages, currentMessage) {
  const systemPrompt = `你是一个零售导购AI助手的意图解析模块。用户会告诉你想买什么商品，你需要从对话中提取结构化意图。

请严格按以下JSON格式返回，不要返回其他内容：
{
  "intent_tags": ["商品类别", "颜色", "风格/场景"],
  "price_range": {"min": 数字, "max": 数字} 或 null,
  "reply": "你的自然语言回复，友好、简洁、专业"
}

规则：
1. intent_tags 从对话历史+当前消息中提取，包含：商品类别（冲锋衣/鞋子/T恤/裤子/帽子/背包/外套/裙子）、颜色（红色/蓝色/黑色/白色等）、风格（运动/休闲/户外/商务）
2. price_range 从价格相关描述提取，如"300以内"→{"max":300}，"100到500"→{"min":100,"max":500}，无价格要求则为null
3. reply 用中文回复，说明你理解的意图，例如"为您找到了蓝色的冲锋衣"
4. 如果用户只说了颜色或价格等补充信息，要结合历史消息理解完整意图
5. 如果是全新需求（与历史无关），只提取当前消息的意图`;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: currentMessage },
  ];

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: apiMessages,
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = completion.choices[0].message.content.trim();

    // 尝试解析JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        intent_tags: Array.isArray(parsed.intent_tags) ? parsed.intent_tags : [],
        price_range: parsed.price_range || null,
        reply: parsed.reply || '为您推荐以下商品：',
      };
    }

    // JSON解析失败，返回默认值
    return {
      intent_tags: [],
      price_range: null,
      reply: content || '为您推荐以下商品：',
    };
  } catch (err) {
    console.error('LLM调用失败:', err.message);
    throw err;
  }
}

module.exports = { parseIntentWithLLM };
