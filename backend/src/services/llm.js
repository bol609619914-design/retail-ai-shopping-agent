/**
 * LLM 服务 - DeepSeek API 集成
 * 使用 LLM 进行意图解析 + 真实商品推荐（含真实图片）
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
3. 提供真实的产品图片链接

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
      "image_url": "真实产品图片URL",
      "product_url": "商品详情页链接"
    }
  ]
}

商品推荐规则：
1. 推荐国际知名品牌的真实商品，优先选择：
   - Nike, Adidas, New Balance, Puma, ASICS（运动）
   - The North Face, Columbia, Arc'teryx, Patagonia（户外）
   - Uniqlo, Zara, H&M, COS, Muji（快时尚）
   - Levi's, Carhartt, Dickies（工装/牛仔）
   - Samsonite, Tumi, Herschel（箱包）
2. 价格用人民币标注（基于中国官网或天猫国际参考价）
3. 图片链接要求：
   - 优先使用品牌官网的产品图
   - 或使用高质量公开图库（如 unsplash.com/photos/xxx）
   - 图片必须是该商品的真实照片，不要用占位图
   - 如果无法确定真实图片URL，就用该品牌官网的产品页URL
4. 商品链接优先使用：
   - Amazon（https://www.amazon.com/s?k=品牌+商品名）
   - 品牌官网
   - Google Shopping（https://www.google.com/search?q=品牌+商品名&tbm=shop）
   - 不要用京东/淘宝等国内平台
5. 推荐4-6个不同品牌/价位的商品
6. 商品名称要具体到型号

示例：
{
  "intent_tags": ["运动鞋"],
  "price_range": null,
  "reply": "为您推荐几款经典运动鞋：",
  "items": [
    {
      "name": "Nike Air Zoom Pegasus 41",
      "brand": "Nike",
      "category": "运动鞋",
      "color": "黑色",
      "price": 899,
      "description": "经典缓震跑鞋，Zoom Air气垫，适合日常跑步",
      "image_url": "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9c4e0-4f2a-4f2a-8c2a-1e3a3a3a3a3a/air-zoom-pegasus-41-mens-road-running-shoes.png",
      "product_url": "https://www.amazon.com/s?k=Nike+Air+Zoom+Pegasus+41"
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
      max_tokens: 2000,
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
        image_url: item.image_url || '',
        product_url: item.product_url || buildSearchUrl(item.brand, item.name),
        // 保留 emoji 作为 fallback
        image: getCategoryEmoji(item.category),
      }));

      return {
        intent_tags: Array.isArray(parsed.intent_tags) ? parsed.intent_tags : [],
        price_range: parsed.price_range || null,
        reply: parsed.reply || '为您推荐以下商品：',
        items,
      };
    }

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
 * 构建搜索链接（兜底）
 */
function buildSearchUrl(brand, name) {
  const query = encodeURIComponent(`${brand} ${name}`.trim());
  return `https://www.amazon.com/s?k=${query}`;
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
