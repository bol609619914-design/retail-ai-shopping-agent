/**
 * LLM 服务 - DeepSeek API 集成
 * 限定13个品牌，图片从官网CDN真实获取
 */
const OpenAI = require('openai');
const { findProductImage } = require('./imageSearch');

const client = new OpenAI({
  apiKey: process.env.MIMO_API_KEY,
  baseURL: process.env.MIMO_BASE_URL || 'https://api.deepseek.com/v1',
});

const MODEL = process.env.MIMO_MODEL || 'deepseek-chat';

// 限定品牌列表
const ALLOWED_BRANDS = [
  '迪卡侬 Decathlon', 'Lululemon', '优衣库 Uniqlo', 'H&M',
  '耐克 Nike', '阿迪达斯 Adidas', '北面 The North Face',
  '哥伦比亚 Columbia', '狼爪 Jack Wolfskin', 'MUJI',
  '美津侬 Mizuno', '亚瑟士 ASICS', '李维斯 Levi\'s',
];

/**
 * 从对话上下文中提取结构化意图 + 推荐真实商品
 */
async function parseIntentWithLLM(messages, currentMessage) {
  const systemPrompt = `你是一个专业的零售导购AI助手。用户会告诉你想买什么商品，你需要推荐真实存在的商品。

**限定品牌（只能推荐这些品牌）：**
${ALLOWED_BRANDS.join('、')}

请严格按以下JSON格式返回，不要返回其他内容：
{
  "intent_tags": ["商品类别", "颜色", "风格/场景"],
  "price_range": {"min": 数字, "max": 数字} 或 null,
  "reply": "你的自然语言回复，友好、简洁、专业",
  "items": [
    {
      "name": "商品名称（具体到型号/系列）",
      "brand": "品牌中文名",
      "category": "商品类别",
      "color": "颜色",
      "price": 数字（人民币参考价）,
      "description": "一句话描述核心卖点"
    }
  ]
}

规则：
1. 只能推荐上述13个品牌的商品，不要推荐其他品牌
2. 商品名称要真实存在，比如：Nike Air Zoom Pegasus 41、Adidas Ultraboost、ASICS GEL-Nimbus 26、Levi's 501、Lululemon Align
3. 价格用人民币标注（参考国内官方售价）
4. 推荐4-6个商品，覆盖不同价位
5. brand字段用中文名（耐克、阿迪达斯、优衣库等）
6. 如果用户说了颜色/价格等限定条件，要严格遵守`;

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

    // 为每个商品匹配真实图片
    const items = rawItems.map((item, index) => {
      const imageUrl = findProductImage(item.brand, item.name);

      return {
        id: Date.now() + index,
        name: item.name || '未知商品',
        brand: item.brand || '',
        category: item.category || '',
        color: item.color || '',
        price: item.price || 0,
        description: item.description || '',
        image_url: imageUrl || '',
        product_url: `https://www.amazon.com/s?k=${encodeURIComponent(`${item.brand} ${item.name}`)}`,
        image: getCategoryEmoji(item.category),
      };
    });

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

function getCategoryEmoji(category) {
  const map = {
    '冲锋衣': '🧥', '鞋子': '👟', '运动鞋': '👟', '跑步鞋': '👟',
    'T恤': '👕', '裤子': '👖', '牛仔裤': '👖', '帽子': '🧢',
    '背包': '🎒', '双肩包': '🎒', '外套': '🧥', '羽绒服': '🧥',
    '裙子': '👗', '连衣裙': '👗', '卫衣': '🧥', '夹克': '🧥',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (category && category.includes(key)) return emoji;
  }
  return '🛍️';
}

module.exports = { parseIntentWithLLM };
