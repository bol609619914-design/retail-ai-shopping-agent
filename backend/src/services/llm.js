/**
 * LLM 服务 - DeepSeek API 集成
 * 使用 LLM 进行意图解析 + 真实商品推荐 + 真实图片URL
 */
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.MIMO_API_KEY,
  baseURL: process.env.MIMO_BASE_URL || 'https://api.deepseek.com/v1',
});

const MODEL = process.env.MIMO_MODEL || 'deepseek-chat';

/**
 * 从对话上下文中提取结构化意图 + 推荐真实商品
 */
async function parseIntentWithLLM(messages, currentMessage) {
  const systemPrompt = `你是一个专业的国际零售导购AI助手。用户会告诉你想买什么商品，你需要：

1. 理解用户意图（结合对话历史）
2. 推荐互联网上真实存在的国际品牌商品
3. 提供真实可用的产品图片URL

请严格按以下JSON格式返回，不要返回其他内容：
{
  "intent_tags": ["商品类别", "颜色", "风格/场景"],
  "price_range": {"min": 数字, "max": 数字} 或 null,
  "reply": "你的自然语言回复，友好、简洁、专业",
  "items": [
    {
      "name": "商品全称（含型号）",
      "brand": "品牌名",
      "category": "商品类别",
      "color": "颜色",
      "price": 数字（人民币参考价）,
      "description": "一句话描述核心卖点",
      "image_url": "真实产品图片的URL"
    }
  ]
}

商品推荐规则：
1. 推荐国际知名品牌的真实商品
2. 价格用人民币标注
3. 推荐4-6个不同品牌/价位的商品
4. 商品名称要具体到型号，品牌名要准确
5. image_url 必须是真实可用的图片URL，优先使用：
   - 品牌官网的图片CDN（如 static.nike.com, assets.adidas.com）
   - 亚马逊商品图片（如 m.media-amazon.com）
   - 其他知名电商平台的图片CDN
   - 如果无法确定真实URL，就留空字符串""

图片URL参考格式：
- Nike: https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/xxx/产品名.png
- Adidas: https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/产品名.jpg
- Amazon: https://m.media-amazon.com/images/I/xxx.jpg
- 如果不确定真实URL，image_url 填 ""`;

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
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content.trim();

    // 尝试解析JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        intent_tags: [],
        price_range: null,
        reply: content || '为您推荐以下商品：',
        items: [],
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const rawItems = parsed.items || [];

    // 组装最终结果
    const items = rawItems.map((item, index) => ({
      id: Date.now() + index,
      name: item.name || '未知商品',
      brand: item.brand || '',
      category: item.category || '',
      color: item.color || '',
      price: item.price || 0,
      description: item.description || '',
      image_url: item.image_url || '',
      product_url: `https://www.amazon.com/s?k=${encodeURIComponent(`${item.brand} ${item.name}`)}`,
      image: getCategoryEmoji(item.category),
    }));

    return {
      intent_tags: Array.isArray(parsed.intent_tags) ? parsed.intent_tags : [],
      price_range: parsed.price_range || null,
      reply: parsed.reply || '为您推荐以下商品：',
      items,
    };
  } catch (err) {
    console.error('LLM调用失败:', err.message);
    throw err;
  }
}

/**
 * 根据商品类别返回 emoji（fallback）
 */
function getCategoryEmoji(category) {
  const map = {
    '冲锋衣': '🧥', '鞋子': '👟', '运动鞋': '👟', '跑步鞋': '👟',
    'T恤': '👕', '裤子': '👖', '牛仔裤': '👖', '帽子': '🧢',
    '背包': '🎒', '双肩包': '🎒', '外套': '🧥', '羽绒服': '🧥',
    '裙子': '👗', '连衣裙': '👗',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (category && category.includes(key)) return emoji;
  }
  return '🛍️';
}

module.exports = { parseIntentWithLLM };
