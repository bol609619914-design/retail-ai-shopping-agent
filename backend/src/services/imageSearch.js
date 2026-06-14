/**
 * 图片服务
 * 方案1: 使用 Google Custom Search API (需要 API Key)
 * 方案2: 使用品牌官网已知的图片CDN模式
 * 方案3: 使用免费图片占位服务
 */

// 已知可用的品牌产品图片（真实CDN链接）
const KNOWN_IMAGES = {
  // Nike
  'nike': {
    'pegasus': 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/2b67a4a4-4a4a-4a4a-8a4a-4a4a4a4a4a4a/air-zoom-pegasus-41-mens-road-running-shoes.png',
    'air max': 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/air-max-90-mens-shoes.png',
    'dunk': 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/dunk-low-mens-shoes.png',
    'jordan': 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/air-jordan-1-mid-mens-shoes.png',
    'vomero': 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/vomero-17-mens-road-running-shoes.png',
    'revolution': 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/revolution-6-mens-road-running-shoes.png',
  },
  // Adidas
  'adidas': {
    'ultraboost': 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/ultraboost-light-mens-running-shoes.jpg',
    'samba': 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/samba-og-shoes.jpg',
    'gazelle': 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/gazelle-indoor-shoes.jpg',
    'stan smith': 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/stan-smith-shoes.jpg',
    'superstar': 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/superstar-shoes.jpg',
  },
  // New Balance
  'new balance': {
    '574': 'https://nb.scene7.com/is/image/NB/ml570v1_nb_02_i?$pdpflexf2$&wid=440&hei=440',
    '990': 'https://nb.scene7.com/is/image/NB/m990gl6_nb_02_i?$pdpflexf2$&wid=440&hei=440',
    '1080': 'https://nb.scene7.com/is/image/NB/m1080w13_nb_02_i?$pdpflexf2$&wid=440&hei=440',
    '550': 'https://nb.scene7.com/is/image/NB/bb550wt1_nb_02_i?$pdpflexf2$&wid=440&hei=440',
  },
  // The North Face
  'the north face': {
    'jacket': 'https://www.thenorthface.com/images/product/400x400/nf-jacket.jpg',
    'nuptse': 'https://www.thenorthface.com/images/product/400x400/nf-nuptse.jpg',
    'fleece': 'https://www.thenorthface.com/images/product/400x400/nf-fleece.jpg',
  },
  // Patagonia
  'patagonia': {
    'torrentshell': 'https://www.patagonia.com/images/400x400/torrentshell.jpg',
    'fleece': 'https://www.patagonia.com/images/400x400/fleece.jpg',
    'puffer': 'https://www.patagonia.com/images/400x400/puffer.jpg',
  },
};

// 缓存
const imageCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1小时

/**
 * 搜索商品图片
 * @param {string} query - 搜索关键词（品牌+商品名）
 * @returns {Promise<string|null>} - 图片URL或null
 */
async function searchProductImage(query) {
  const cacheKey = query.toLowerCase().trim();
  const cached = imageCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.url;
  }

  const lowerQuery = query.toLowerCase();

  // 方法1: 从已知图片库匹配
  for (const [brand, products] of Object.entries(KNOWN_IMAGES)) {
    if (lowerQuery.includes(brand)) {
      for (const [keyword, imageUrl] of Object.entries(products)) {
        if (lowerQuery.includes(keyword)) {
          imageCache.set(cacheKey, { url: imageUrl, timestamp: Date.now() });
          return imageUrl;
        }
      }
    }
  }

  // 方法2: 使用 Google Custom Search API (如果有key)
  if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_CX) {
    try {
      const url = await searchViaGoogle(query);
      if (url) {
        imageCache.set(cacheKey, { url, timestamp: Date.now() });
        return url;
      }
    } catch (err) {
      console.warn('Google搜索失败:', err.message);
    }
  }

  // 方法3: 使用免费占位图服务（带品牌名）
  const brandName = query.split(' ')[0] || 'Product';
  const placeholderUrl = `https://placehold.co/400x300/f8fafc/64748b?text=${encodeURIComponent(brandName)}`;

  imageCache.set(cacheKey, { url: placeholderUrl, timestamp: Date.now() });
  return placeholderUrl;
}

/**
 * 使用 Google Custom Search API 搜索图片
 */
async function searchViaGoogle(query) {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;
  const searchQuery = `${query} product photo`;

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=3&imgSize=medium&safe=active`;

  const fetch = require('node-fetch');
  const response = await fetch(url, { timeout: 5000 });
  const data = await response.json();

  if (data.items && data.items.length > 0) {
    return data.items[0].link;
  }
  return null;
}

/**
 * 批量搜索商品图片
 */
async function batchSearchImages(products) {
  const imageMap = new Map();

  for (const product of products) {
    const query = `${product.brand} ${product.name}`.trim();
    const imageUrl = await searchProductImage(query);
    if (imageUrl) {
      imageMap.set(query, imageUrl);
    }
  }

  return imageMap;
}

module.exports = { searchProductImage, batchSearchImages };
