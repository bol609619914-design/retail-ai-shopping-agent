/**
 * LLM 服务 - DeepSeek API 集成
 * 使用 LLM 进行意图解析 + 真实商品推荐
 */
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.MIMO_API_KEY,
  baseURL: process.env.MIMO_BASE_URL || 'https://api.deepseek.com/v1',
});

const MODEL = process.env.MIMO_MODEL || 'deepseek-chat';

/**
 * 从对话上下文中提取结构化意图 + 推荐真实商品
 * @param {Array} messages - 历史消息 [{role, content}]
 * @param {string} currentMessage - 当前用户消息
 * @returns {Promise<{intent_tags: string[], price_range: object|null, reply: string, items: object[]}>}
 */
async function parseIntentWithLLM(messages, currentMessage) {
  const systemPrompt = `你是一个专业的零售导购AI助手。用户会告诉你想买什么商品，你需要：

1. 理解用户意图（结合对话历史）
2. 推荐互联网上真实存在的商品

请严格按以下JSON格式返回，不要返回其他内容：
{
  "intent_tags": ["商品类别", "颜色", "风格/场景"],
  "price_range": {"min": 数字, "max": 数字} 或 null,
  "reply": "你的自然语言回复，友好、简洁、专业",
  "items": [
    {
      "name": "真实商品全称",
      "brand": "品牌名",
      "category": "商品类别",
      "color": "颜色",
      "price": 数字（真实市场价）,
      "description": "一句话描述卖点",
      "search_url": "京东或淘宝搜索链接"
    }
  ]
}

商品推荐规则：
1. 推荐的商品必须是互联网上真实存在、可以买到的
2. 价格必须是真实的市场参考价（不要瞎编）
3. 每个商品提供京东或淘宝的搜索链接，格式：
   - 京东：https://search.jd.com/Search?keyword=品牌+商品名
   - 淘宝：https://s.taobao.com/search?q=品牌+商品名
4. 推荐4-6个不同品牌/价位的商品，覆盖高中低档
5. 商品名称要具体到型号，不要笼统描述
6. 如果用户只说了颜色或价格等补充信息，结合历史消息推荐

示例（用户说"想看冲锋衣"）：
{
  "intent_tags": ["冲锋衣"],
  "price_range": null,
  "reply": "为您推荐几款热门冲锋衣，覆盖不同价位：",
  "items": [
    {
      "name": "探路者 三合一冲锋衣 TEFBM82703",
      "brand": "探路者",
      "category": "冲锋衣",
      "color": "蓝色",
      "price": 599,
      "description": "三合一可拆卸，防风防水，适合秋冬户外",
      "search_url": "https://search.jd.com/Search?keyword=探路者三合一冲锋衣"
    }
  ]
}`;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: currentMessage },
  ];

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices[0].message.content.trim();

    // 尝试解析JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // 标准化 items
      const items = (parsed.items || []).map((item, index) => ({
        id: Date.now() + index,
        name: item.name || '未知商品',
        brand: item.brand || '',
        category: item.category || '',
        color: item.color || '',
        price: item.price || 0,
        description: item.description || '',
        search_url: item.search_url || '',
        image: getCategoryEmoji(item.category),
      }));

      return {
        intent_tags: Array.isArray(parsed.intent_tags) ? parsed.intent_tags : [],
        price_range: parsed.price_range || null,
        reply: parsed.reply || '为您推荐以下商品：',
        items,
      };
    }

    // JSON解析失败
    return {
      intent_tags: [],
      price_range: null,
      reply: content || '为您推荐以下商品：',
      items: [],
    };
  } catch (err) {
    console.error('LLM调用失败:', err.message);
    throw err;
  }
}

/**
 * 根据商品类别返回对应的 emoji（作为占位图）
 */
function getCategoryEmoji(category) {
  const map = {
    '冲锋衣': '🧥',
    '鞋子': '👟',
    '运动鞋': '👟',
    '跑步鞋': '👟',
    'T恤': '👕',
    '裤子': '👖',
    '牛仔裤': '👖',
    '帽子': '🧢',
    '背包': '🎒',
    '双肩包': '🎒',
    '外套': '🧥',
    '羽绒服': '🧥',
    '裙子': '👗',
    '连衣裙': '👗',
  };

  for (const [key, emoji] of Object.entries(map)) {
    if (category && category.includes(key)) return emoji;
  }
  return '🛍️';
}

module.exports = { parseIntentWithLLM };
