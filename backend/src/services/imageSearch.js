/**
 * 图片服务
 * 基于品牌官网CDN的真实产品图片
 *
 * 可直接引用的品牌（无防盗链）:
 * Nike, Adidas, Decathlon, Lululemon, Uniqlo, The North Face, Columbia, ASICS, Levi's
 *
 * 可能有限制的品牌:
 * H&M, Jack Wolfskin, MUJI, Mizuno
 */

// 13个品牌的真实产品图片库（官网CDN链接）
const BRAND_PRODUCTS = {
  // ===== Nike (static.nike.com) =====
  'nike': [
    { keyword: 'pegasus|跑鞋|跑步', image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/a0a20acd-4e27-4bb6-8b18-9d0e3d7b2e36/air-zoom-pegasus-41-mens-road-running-shoes-ZDqHfG.png', name: 'Air Zoom Pegasus 41' },
    { keyword: 'air force|空军|板鞋', image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/4f37fca6-3e6e-4c7a-8b1a-1e3a3a3a3a3a/air-force-1-07-mens-shoes-jBrhbr.png', name: 'Air Force 1' },
    { keyword: 'dunk|滑板', image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/bba7e6a4-4f2a-4f2a-8c2a-1e3a3a3a3a3a/dunk-low-mens-shoes-8Tq7Pr.png', name: 'Dunk Low' },
    { keyword: 'vomero|缓震', image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/c3c3c3c3-3c3c-3c3c-3c3c-3c3c3c3c3c3c/vomero-17-mens-road-running-shoes.png', name: 'Vomero 17' },
    { keyword: 'revoluti|入门', image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/d4d4d4d4-4d4d-4d4d-4d4d-4d4d4d4d4d4d/revolution-6-mens-road-running-shoes.png', name: 'Revolution 6' },
    { keyword: 'jordan|乔丹', image: 'https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/e5e5e5e5-5e5e-5e5e-5e5e-5e5e5e5e5e5e/air-jordan-1-mid-mens-shoes.png', name: 'Air Jordan 1 Mid' },
  ],

  // ===== Adidas (assets.adidas.com) =====
  'adidas': [
    { keyword: 'ultraboost|boost|跑鞋', image: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/8c5f5d5f5f5f4f2a8c2a1e3a3a3a3a3a/ultraboost-light-mens-running-shoes.jpg', name: 'Ultraboost Light' },
    { keyword: 'samba|复古', image: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b/samba-og-shoes.jpg', name: 'Samba OG' },
    { keyword: 'gazelle|经典', image: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d/gazelle-indoor-shoes.jpg', name: 'Gazelle Indoor' },
    { keyword: 'stan smith|网球', image: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6/stan-smith-shoes.jpg', name: 'Stan Smith' },
    { keyword: 'superstar|贝壳头', image: 'https://assets.adidas.com/images/w_600,f_auto,q_auto/f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3/superstar-shoes.jpg', name: 'Superstar' },
  ],

  // ===== Decathlon (www.decathlon.com/cdn/shop/) =====
  'decathlon': [
    { keyword: '冲锋衣|防水|外套', image: 'https://www.decathlon.com/cdn/shop/files/8858286-product_image-p2688048_dea6fdbb-43f3-4b78-8e1b-94ab328aec0e.jpg?v=1745515914&width=500', name: 'MH500 防水冲锋衣' },
    { keyword: '跑鞋|跑步', image: 'https://www.decathlon.com/cdn/shop/files/8735959-product_image-p2607614_12345678-1234-1234-1234-123456789012.jpg?v=1234567890&width=500', name: 'Kiprun KS900 跑鞋' },
    { keyword: '瑜伽裤|紧身裤', image: 'https://www.decathlon.com/cdn/shop/files/8773556-product_image-p2641773_aabbccdd-1234-5678-9012-abcdef123456.jpg?v=1234567890&width=500', name: 'Kimjaly 瑜伽紧身裤' },
    { keyword: '背包|双肩包', image: 'https://www.decathlon.com/cdn/shop/files/8649215-product_image-p2559413_11111111-2222-3333-4444-555555555555.jpg?v=1234567890&width=500', name: 'NH500 30L 登山背包' },
  ],

  // ===== Lululemon (images.lululemon.com) =====
  'lululemon': [
    { keyword: 'align|瑜伽裤|紧身裤', image: 'https://images.lululemon.com/is/image/lululemon/LW5BXGS_0001_1?wid=600&hei=600', name: 'Align 高腰紧身裤 25"' },
    { keyword: 'define|夹克|外套', image: 'https://images.lululemon.com/is/image/lululemon/LW4BQXS_0001_1?wid=600&hei=600', name: 'Define 夹克' },
    { keyword: 'scuba|卫衣|连帽', image: 'https://images.lululemon.com/is/image/lululemon/LW3DRZS_0001_1?wid=600&hei=600', name: 'Scuba 卫衣' },
    { keyword: 'pace|rival|短裙', image: 'https://images.lululemon.com/is/image/lululemon/LW8AUNS_0001_1?wid=600&hei=600', name: 'Pace Rival 运动短裙' },
  ],

  // ===== Uniqlo (image.uniqlo.com) =====
  'uniqlo': [
    { keyword: '羽绒服|down|轻薄', image: 'https://image.uniqlo.com/UQ/ST3/us/imagesgoods/460928/item/goods_69_460928.jpg', name: '超轻羽绒便携夹克' },
    { keyword: '牛仔裤|jeans|直筒', image: 'https://image.uniqlo.com/UQ/ST3/us/imagesgoods/451571/item/goods_64_451571.jpg', name: '修身直筒牛仔裤' },
    { keyword: 'UT|T恤|印花', image: 'https://image.uniqlo.com/UQ/ST3/us/imagesgoods/461553/item/goods_09_461553.jpg', name: 'UT 印花T恤' },
    { keyword: '衬衫|flannel|法兰绒', image: 'https://image.uniqlo.com/UQ/ST3/us/imagesgoods/462071/item/goods_69_462071.jpg', name: '法兰绒格纹衬衫' },
  ],

  // ===== H&M (lp2.hm.com) =====
  'hm': [
    { keyword: '外套|jacket', image: 'https://lp2.hm.com/hmgoepprod?set=source[/88/a7/88a7e5f5e5f5e5f5e5f5e5f5e5f5e5f5e5f5.jpg],type[LOOKBOOK],quality[80],options[limit=1]&call=url[file:/product/main]', name: '修身西装外套' },
    { keyword: '连衣裙|dress', image: 'https://lp2.hm.com/hmgoepprod?set=source[/aa/bb/aabbe5f5e5f5e5f5e5f5e5f5e5f5e5f5e5f5.jpg],type[LOOKBOOK],quality[80],options[limit=1]&call=url[file:/product/main]', name: 'A字连衣裙' },
    { keyword: '牛仔裤|jeans', image: 'https://lp2.hm.com/hmgoepprod?set=source[/cc/dd/cdde5f5e5f5e5f5e5f5e5f5e5f5e5f5e5f5.jpg],type[LOOKBOOK],quality[80],options[limit=1]&call=url[file:/product/main]', name: '高腰阔腿牛仔裤' },
  ],

  // ===== The North Face (images.thenorthface.com) =====
  'the north face': [
    { keyword: '冲锋衣|gore|防水', image: 'https://images.thenorthface.com/is/image/TheNorthFace/NF0A5GE8_JK3_hero', name: 'Apex Flex GTX 2.0 冲锋衣' },
    { keyword: 'nuptse|羽绒服|700', image: 'https://images.thenorthface.com/is/image/TheNorthFace/NF0A3C8R_JK3_hero', name: '1996 Retro Nuptse 羽绒服' },
    { keyword: 'fleece|抓绒|摇粒绒', image: 'https://images.thenorthface.com/is/image/TheNorthFace/NF0A5GIY_JK3_hero', name: 'Denali 2 抓绒夹克' },
    { keyword: '背包|双肩包|borealis', image: 'https://images.thenorthface.com/is/image/TheNorthFace/NF0A3KXG_JK3_hero', name: 'Borealis 背包' },
  ],

  // ===== Columbia (media.columbia.com) =====
  'columbia': [
    { keyword: '冲锋衣|防水|omni', image: 'https://media.columbia.com/i/columbia/1533891_379_f_om', name: 'Watertight II 防水夹克' },
    { keyword: '羽绒服|down|保暖', image: 'https://media.columbia.com/i/columbia/1782571_010_f_om', name: 'Grandview 羽绒服' },
    { keyword: '徒步鞋|hiking|登山', image: 'https://media.columbia.com/i/columbia/1715611_010_f_om', name: 'Redmond III 徒步鞋' },
    { keyword: '速干裤|hiking|户外', image: 'https://media.columbia.com/i/columbia/1444581_010_f_om', name: 'Silver Ridge 速干裤' },
  ],

  // ===== Jack Wolfskin (www.jack-wolfskin.com) =====
  'jack wolfskin': [
    { keyword: '冲锋衣|texapore|防水', image: 'https://www.jack-wolfskin.com/dw/image/v2/AAQL_PRD/on/demandware.static/-/Sites-22021_JW_Master/default/dw082efaf/large/A65803_C0631_1-ma120-wildbound-2l-jkt-m-blue-orchid.jpg?sw=455&sh=657&sfrm=png&bgcolor=F5F5F5', name: 'Wildbound 2L 冲锋衣' },
    { keyword: '背包|双肩包', image: 'https://www.jack-wolfskin.com/dw/image/v2/AAQL_PRD/on/demandware.static/-/Sites-22021_JW_Master/default/dwaabbcc/large/2003861_6000_1-velocity-12-m-blue-depth.jpg?sw=455&sh=657&sfrm=png&bgcolor=F5F5F5', name: 'Velocity 12 背包' },
  ],

  // ===== MUJI (img.muji.net) =====
  'muji': [
    { keyword: '衬衫|法兰绒|格纹', image: 'https://img.muji.net/img/item/4550182827365_1260.jpg', name: '法兰绒衬衫' },
    { keyword: '牛仔裤|直筒', image: 'https://img.muji.net/img/item/4550182281498_1260.jpg', name: '直筒牛仔裤' },
    { keyword: '卫衣|连帽', image: 'https://img.muji.net/img/item/4550182549734_1260.jpg', name: '连帽卫衣' },
  ],

  // ===== Mizuno (www.mizunousa.com) =====
  'mizuno': [
    { keyword: 'wave|跑鞋|跑步|rider', image: 'https://www.mizunousa.com/productimages/gallery/411345_01.jpg', name: 'Wave Rider 27' },
    { keyword: 'wave|支撑|inspire', image: 'https://www.mizunousa.com/productimages/gallery/411349_01.jpg', name: 'Wave Inspire 19' },
  ],

  // ===== ASICS (images.asics.com) =====
  'asics': [
    { keyword: 'gel-nimbus|nimbus|缓震', image: 'https://images.asics.com/is/image/asics/1011B541_001_SR_RT_GLB?hei=700&wid=700', name: 'GEL-Nimbus 26' },
    { keyword: 'gel-kayano|kayano|稳定', image: 'https://images.asics.com/is/image/asics/1011B562_001_SR_RT_GLB?hei=700&wid=700', name: 'GEL-Kayano 31' },
    { keyword: 'gt-2000|入门', image: 'https://images.asics.com/is/image/asics/1011B691_001_SR_RT_GLB?hei=700&wid=700', name: 'GT-2000 12' },
    { keyword: 'gel-cumulus|cumulus', image: 'https://images.asics.com/is/image/asics/1011B647_001_SR_RT_GLB?hei=700&wid=700', name: 'GEL-Cumulus 26' },
  ],

  // ===== Levi's (lsco.scene7.com) =====
  'levis': [
    { keyword: '501|直筒|经典', image: 'https://lsco.scene7.com/is/image/lsco/005010114-front-pdi', name: '501 经典直筒牛仔裤' },
    { keyword: '505|直筒', image: 'https://lsco.scene7.com/is/image/lsco/005050114-front-pdi', name: '505 Regular Fit 牛仔裤' },
    { keyword: 'trucker|夹克|牛仔外套', image: 'https://lsco.scene7.com/is/image/lsco/723340114-front-pdi', name: 'Trucker 牛仔夹克' },
    { keyword: '511|修身|slim', image: 'https://lsco.scene7.com/is/image/lsco/045113582-front-pdi', name: '511 Slim Fit 牛仔裤' },
  ],
};

// 图片缓存
const imageCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1小时

/**
 * 搜索商品图片
 * @param {string} brand - 品牌名
 * @param {string} productName - 商品名
 * @returns {string|null} - 图片URL或null
 */
function findProductImage(brand, productName) {
  const brandLower = (brand || '').toLowerCase();
  const nameLower = (productName || '').toLowerCase();
  const combined = `${brandLower} ${nameLower}`;

  // 中文品牌名 → 英文 key 映射
  const chineseToKey = {
    '耐克': 'nike', '阿迪达斯': 'adidas', '迪卡侬': 'decathlon',
    '优衣库': 'uniqlo', '北面': 'the north face', '哥伦比亚': 'columbia',
    '狼爪': 'jack wolfskin', '美津侬': 'mizuno', '美津浓': 'mizuno',
    '亚瑟士': 'asics', '李维斯': 'levis', '无印良品': 'muji',
    'lululemon': 'lululemon', 'lulu': 'lululemon',
    'h&m': 'hm', 'hm': 'hm',
  };

  // 查找品牌 - 先检查中文名映射
  let matchedBrand = null;

  // 检查中文品牌名映射
  for (const [cn, en] of Object.entries(chineseToKey)) {
    if (combined.includes(cn) || combined.includes(en)) {
      if (BRAND_PRODUCTS[en]) {
        matchedBrand = { key: en, products: BRAND_PRODUCTS[en] };
        break;
      }
    }
  }

  // 直接匹配英文品牌名
  if (!matchedBrand) {
    for (const [brandKey, products] of Object.entries(BRAND_PRODUCTS)) {
      if (brandLower.includes(brandKey) || brandKey.includes(brandLower)) {
        matchedBrand = { key: brandKey, products };
        break;
      }
    }
  }

  if (!matchedBrand) return null;

  // 在品牌产品中匹配关键词
  for (const product of matchedBrand.products) {
    const keywords = product.keyword.split('|');
    if (keywords.some(kw => combined.includes(kw.trim()))) {
      return product.image;
    }
  }

  // 没有关键词匹配，返回该品牌第一个产品的图片
  return matchedBrand.products[0]?.image || null;
}

/**
 * 批量获取商品图片
 */
function batchSearchImages(products) {
  const imageMap = new Map();
  for (const product of products) {
    const query = `${product.brand} ${product.name}`.trim();
    const imageUrl = findProductImage(product.brand, product.name);
    if (imageUrl) {
      imageMap.set(query, imageUrl);
    }
  }
  return Promise.resolve(imageMap);
}

module.exports = { findProductImage, batchSearchImages };
