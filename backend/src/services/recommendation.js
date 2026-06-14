/**
 * 外部AI推荐系统集成
 * 模拟推荐API，生产环境替换为真实外部AI接口
 */

// 模拟商品数据库
const PRODUCTS = [
  // 冲锋衣
  { id: 1, name: '轻量防风冲锋衣', category: '冲锋衣', color: '蓝色', price: 399, image: '🧥', description: '轻量化设计，防风防水，适合春秋户外活动' },
  { id: 2, name: '三合一登山冲锋衣', category: '冲锋衣', color: '红色', price: 599, image: '🧥', description: '可拆卸内胆，四季皆可穿，专业户外级' },
  { id: 3, name: '城市通勤冲锋衣', category: '冲锋衣', color: '黑色', price: 349, image: '🧥', description: '简约都市风格，防泼水面料，日常通勤首选' },
  { id: 4, name: '户外探险冲锋衣', category: '冲锋衣', color: '绿色', price: 459, image: '🧥', description: '耐磨抗撕裂，多口袋设计，探险必备' },
  { id: 5, name: '时尚休闲冲锋衣', category: '冲锋衣', color: '白色', price: 299, image: '🧥', description: '时尚剪裁，轻薄透气，城市户外两相宜' },
  { id: 6, name: '专业登山冲锋衣', category: '冲锋衣', color: '蓝色', price: 699, image: '🧥', description: 'Gore-Tex面料，暴雨级防水，高海拔登山专用' },
  // 鞋子
  { id: 7, name: '透气跑步鞋', category: '鞋子', color: '蓝色', price: 299, image: '👟', description: '网面透气，缓震中底，适合日常跑步' },
  { id: 8, name: '经典板鞋', category: '鞋子', color: '白色', price: 199, image: '👟', description: '百搭经典款，皮面易打理，休闲必备' },
  { id: 9, name: '户外登山鞋', category: '鞋子', color: '棕色', price: 459, image: '🥾', description: '防滑大底，防水鞋面，崎岖地形无压力' },
  { id: 10, name: '轻便运动鞋', category: '鞋子', color: '黑色', price: 249, image: '👟', description: '一脚蹬设计，轻盈舒适，日常运动好搭档' },
  { id: 11, name: '时尚老爹鞋', category: '鞋子', color: '白色', price: 329, image: '👟', description: '增高厚底，潮流配色，街头风格首选' },
  { id: 12, name: '红色运动跑鞋', category: '鞋子', color: '红色', price: 279, image: '👟', description: '高弹中底，透气鞋面，运动时尚两不误' },
  // T恤
  { id: 13, name: '纯棉圆领T恤', category: 'T恤', color: '白色', price: 89, image: '👕', description: '100%精梳棉，亲肤透气，基础百搭款' },
  { id: 14, name: '运动速干T恤', category: 'T恤', color: '黑色', price: 129, image: '👕', description: '速干面料，四向弹力，健身运动首选' },
  { id: 15, name: '潮流印花T恤', category: 'T恤', color: '蓝色', price: 159, image: '👕', description: '原创印花设计，oversize版型，潮流必备' },
  // 裤子
  { id: 16, name: '修身牛仔裤', category: '裤子', color: '蓝色', price: 199, image: '👖', description: '弹力牛仔面料，修身剪裁，经典百搭' },
  { id: 17, name: '运动休闲裤', category: '裤子', color: '黑色', price: 149, image: '👖', description: '束脚设计，侧边条纹，运动休闲两相宜' },
  { id: 18, name: '工装短裤', category: '裤子', color: '绿色', price: 129, image: '🩳', description: '多口袋工装设计，透气速干，夏季必备' },
  // 帽子
  { id: 19, name: '棒球帽', category: '帽子', color: '黑色', price: 69, image: '🧢', description: '可调节帽围，刺绣Logo，日常百搭' },
  { id: 20, name: '遮阳渔夫帽', category: '帽子', color: '白色', price: 89, image: '🎩', description: '大帽檐遮阳，可折叠收纳，户外防晒必备' },
  // 背包
  { id: 21, name: '双肩电脑背包', category: '背包', color: '黑色', price: 199, image: '🎒', description: '15.6寸电脑仓，多隔层设计，通勤出差首选' },
  { id: 22, name: '户外登山包', category: '背包', color: '绿色', price: 349, image: '🎒', description: '50L大容量，人体工学背负系统，徒步露营必备' },
  // 外套
  { id: 23, name: '轻薄羽绒服', category: '外套', color: '黑色', price: 399, image: '🧥', description: '90%白鸭绒，轻薄保暖，秋冬必备' },
  { id: 24, name: '牛仔夹克', category: '外套', color: '蓝色', price: 259, image: '🧥', description: '经典牛仔面料，复古水洗工艺，春秋百搭' },
  // 裙子
  { id: 25, name: '碎花连衣裙', category: '裙子', color: '粉色', price: 189, image: '👗', description: '雪纺面料，碎花印花，甜美夏日风格' },
  { id: 26, name: 'A字半身裙', category: '裙子', color: '黑色', price: 139, image: '👗', description: '高腰A字版型，显瘦百搭，通勤休闲皆可' },
];

/**
 * 调用外部AI推荐接口
 * @param {{ intent_tags: string[], price_range: object|null }} params
 * @returns {{ items: object[] }}
 */
async function getRecommendations({ intent_tags, price_range }) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

  let results = [...PRODUCTS];

  // 按类别过滤
  const categoryTag = intent_tags.find(tag =>
    Object.keys(require('./intentParser').extractTagsFromText ? {} : {}).length >= 0 &&
    PRODUCTS.some(p => p.category === tag)
  );
  // 简化：直接检查tag是否是商品类别
  const categoryTags = intent_tags.filter(tag =>
    PRODUCTS.some(p => p.category === tag)
  );
  if (categoryTags.length > 0) {
    results = results.filter(p => categoryTags.includes(p.category));
  }

  // 按颜色过滤
  const colorTags = intent_tags.filter(tag =>
    PRODUCTS.some(p => p.color === tag)
  );
  if (colorTags.length > 0) {
    results = results.filter(p => colorTags.includes(p.color));
  }

  // 按价格区间过滤
  if (price_range) {
    if (price_range.min !== undefined) {
      results = results.filter(p => p.price >= price_range.min);
    }
    if (price_range.max !== undefined) {
      results = results.filter(p => p.price <= price_range.max);
    }
  }

  // 如果没有匹配结果，逐步放宽条件
  if (results.length === 0 && (price_range || colorTags.length > 0)) {
    // 先尝试只按类别过滤
    let fallback = [...PRODUCTS];
    if (categoryTags.length > 0) {
      fallback = fallback.filter(p => categoryTags.includes(p.category));
    }
    if (fallback.length > 0) {
      return { items: fallback.slice(0, 8), relaxed: true };
    }
  }

  // 最终兜底：返回热门商品
  if (results.length === 0) {
    results = PRODUCTS.slice(0, 4);
  }

  // 限制返回数量
  return { items: results.slice(0, 8) };
}

module.exports = { getRecommendations };
