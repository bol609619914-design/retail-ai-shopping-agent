const express = require('express');
const router = express.Router();
const { parseIntent } = require('../services/intentParser');
const { parseIntentWithLLM } = require('../services/llm');
const { getRecommendations } = require('../services/recommendation');

/**
 * POST /api/chat
 * 接收前端拼接的上下文，解析意图，返回推荐商品
 *
 * 优先使用 Mimo LLM 解析意图，失败时回退到规则引擎
 */
router.post('/', async (req, res) => {
  try {
    const { messages = [], currentMessage } = req.body;

    if (!currentMessage || typeof currentMessage !== 'string' || currentMessage.trim() === '') {
      return res.status(400).json({ error: 'currentMessage 不能为空' });
    }

    let intent;
    let reply;

    // 优先使用 LLM 解析意图
    try {
      const llmResult = await parseIntentWithLLM(messages, currentMessage.trim());
      intent = {
        intent_tags: llmResult.intent_tags,
        price_range: llmResult.price_range,
      };
      reply = llmResult.reply;
    } catch (llmErr) {
      console.warn('LLM 解析失败，回退到规则引擎:', llmErr.message);
      // 回退到规则引擎
      intent = parseIntent(messages, currentMessage.trim());
      reply = null;
    }

    // 调用推荐API
    const { items, relaxed } = await getRecommendations(intent);

    // 如果 LLM 没有生成回复，用规则生成
    if (!reply) {
      reply = buildReply(intent, items, relaxed);
    }

    res.json({
      reply,
      items,
      intent_tags: intent.intent_tags,
      price_range: intent.price_range,
      source: reply ? 'llm' : 'rules',
    });
  } catch (err) {
    console.error('聊天处理错误:', err);
    res.status(500).json({ error: '服务内部错误' });
  }
});

/**
 * 根据意图和结果构造自然语言回复（规则引擎回退）
 */
function buildReply(intent, items, relaxed = false) {
  const { intent_tags, price_range } = intent;

  if (items.length === 0) {
    return '抱歉，暂时没有找到符合条件的商品，您可以换个关键词试试。';
  }

  let reply = '';

  const category = intent_tags.find(tag =>
    ['冲锋衣', '鞋子', 'T恤', '裤子', '帽子', '背包', '外套', '裙子'].includes(tag)
  );

  if (relaxed) {
    if (category) {
      reply = `没有找到完全符合条件的${category}，为您推荐以下${category}，共${items.length}款：`;
    } else {
      reply = `没有找到完全符合条件的商品，为您推荐以下商品，共${items.length}款：`;
    }
  } else if (category) {
    const colors = intent_tags.filter(tag => tag.endsWith('色'));
    if (colors.length > 0) {
      reply = `为您找到了${colors.join('、')}的${category}，共${items.length}款：`;
    } else {
      reply = `为您推荐以下${category}，共${items.length}款：`;
    }
  } else {
    reply = `根据您的需求，为您推荐以下商品，共${items.length}款：`;
  }

  if (price_range && !relaxed) {
    if (price_range.min && price_range.max) {
      reply += `（价格${price_range.min}-${price_range.max}元）`;
    } else if (price_range.max) {
      reply += `（${price_range.max}元以下）`;
    } else if (price_range.min) {
      reply += `（${price_range.min}元以上）`;
    }
  }

  return reply;
}

module.exports = router;
