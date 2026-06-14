/**
 * 意图解析服务
 * 从对话历史中提取 intent_tags 和 price_range
 * 使用规则引擎，不依赖LLM，保持低延迟
 */

// 商品类别关键词映射
const CATEGORY_KEYWORDS = {
  '冲锋衣': ['冲锋衣', '户外外套', '防风衣', '登山衣'],
  '鞋子': ['鞋', '运动鞋', '跑步鞋', '板鞋', '靴子', '拖鞋', '凉鞋'],
  'T恤': ['T恤', 'T恤衫', '短袖', '上衣'],
  '裤子': ['裤子', '牛仔裤', '休闲裤', '运动裤', '短裤'],
  '帽子': ['帽子', '棒球帽', '遮阳帽', '渔夫帽'],
  '背包': ['背包', '双肩包', '书包', '旅行包'],
  '外套': ['外套', '夹克', '风衣', '大衣', '羽绒服'],
  '裙子': ['裙子', '连衣裙', '半身裙', '短裙'],
};

// 颜色关键词
const COLOR_KEYWORDS = [
  '红色', '蓝色', '黑色', '白色', '绿色', '黄色', '灰色', '粉色',
  '紫色', '橙色', '棕色', '米色', '卡其色', '深蓝', '浅蓝',
  '红', '蓝', '黑', '白', '绿', '黄', '灰', '粉', '紫',
];

// 场景/风格关键词
const STYLE_KEYWORDS = {
  '运动': ['运动', '健身', '跑步', '锻炼'],
  '休闲': ['休闲', '日常', '通勤', '百搭'],
  '户外': ['户外', '登山', '徒步', '露营'],
  '商务': ['商务', '正式', '办公', '职场'],
};

// 价格模式
const PRICE_PATTERNS = [
  { pattern: /(\d+)\s*[元块]?\s*以[下内]/, type: 'max' },
  { pattern: /(\d+)\s*[元块]?\s*以上/, type: 'min' },
  { pattern: /(\d+)\s*[到至\-~]\s*(\d+)\s*[元块]?/, type: 'range' },
  { pattern: /便宜|低价|性价比/, type: 'low' },
  { pattern: /贵|高端|奢华|精品/, type: 'high' },
];

/**
 * 从文本中提取意图标签
 */
function extractTagsFromText(text) {
  const tags = [];

  // 提取商品类别
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      tags.push(category);
      break; // 只取第一个匹配的类别
    }
  }

  // 提取颜色
  for (const color of COLOR_KEYWORDS) {
    if (text.includes(color)) {
      // 标准化颜色名称
      const normalized = color.length === 1 ? color + '色' : color;
      if (!tags.includes(normalized)) {
        tags.push(normalized);
      }
    }
  }

  // 提取风格/场景
  for (const [style, keywords] of Object.entries(STYLE_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) {
      if (!tags.includes(style)) {
        tags.push(style);
      }
    }
  }

  return tags;
}

/**
 * 从文本中提取价格区间
 */
function extractPriceRange(text) {
  for (const { pattern, type } of PRICE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      switch (type) {
        case 'max':
          return { max: parseInt(match[1]) };
        case 'min':
          return { min: parseInt(match[1]) };
        case 'range':
          return { min: parseInt(match[1]), max: parseInt(match[2]) };
        case 'low':
          return { max: 200 };
        case 'high':
          return { min: 500 };
      }
    }
  }
  return null;
}

/**
 * 解析完整对话上下文，返回结构化意图
 * @param {Array} messages - 对话历史 [{role, content}]
 * @param {string} currentMessage - 当前用户消息
 * @returns {{ intent_tags: string[], price_range: object|null }}
 */
function parseIntent(messages, currentMessage) {
  // 将所有消息合并为一个文本进行分析
  const allText = messages
    .map(m => m.content)
    .concat(currentMessage)
    .join(' ');

  // 也单独分析当前消息，用于覆盖/更新意图
  const currentTags = extractTagsFromText(currentMessage);
  const allTags = extractTagsFromText(allText);

  // 合并策略：当前消息的标签优先，补充历史中的标签
  const mergedTags = [...currentTags];
  for (const tag of allTags) {
    if (!mergedTags.includes(tag)) {
      mergedTags.push(tag);
    }
  }

  // 价格区间：以当前消息为准，若无则取历史
  let priceRange = extractPriceRange(currentMessage);
  if (!priceRange && messages.length > 0) {
    for (let i = messages.length - 1; i >= 0; i--) {
      priceRange = extractPriceRange(messages[i].content);
      if (priceRange) break;
    }
  }

  return {
    intent_tags: mergedTags,
    price_range: priceRange,
  };
}

module.exports = { parseIntent, extractTagsFromText, extractPriceRange };
