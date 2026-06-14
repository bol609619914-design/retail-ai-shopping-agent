# 零售AI智能导购系统（会话级单轮版）

一个无需登录、无需数据库的AI智能导购系统。用户在单次页面打开期间享受连续对话体验，页面刷新即自动清空所有数据。

## 核心特性

- 🧠 **会话级上下文记忆** — 前端内存暂存最近3轮对话，支持关联追问
- 🚀 **零数据库** — 所有状态仅存在于浏览器内存，无隐私泄露风险
- 🛍️ **智能商品推荐** — 基于意图解析的结构化推荐
- 💬 **自然对话体验** — 聊天气泡流、商品卡片、加载动画
- 🗑️ **即用即走** — 一键清空或刷新页面即可重置

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite |
| 后端 | Node.js + Express |
| 数据库 | 无（前端内存缓存） |

## 快速开始

### 1. 启动后端

```bash
cd backend
npm install
npm start
# 后端运行在 http://localhost:3001
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
# 前端运行在 http://localhost:5173
```

### 3. 开始使用

打开浏览器访问 http://localhost:5173，输入你的需求即可。

## 使用示例

```
👤 用户: 想看冲锋衣
🤖 AI:  为您推荐以下冲锋衣，共6款：[商品卡片]

👤 用户: 要蓝色的
🤖 AI:  为您找到了蓝色的冲锋衣，共2款：[商品卡片]

👤 用户: 300块以内的
🤖 AI:  为您找到了蓝色的冲锋衣，共1款：[商品卡片]
```

刷新页面后：

```
👤 用户: 要蓝色的
🤖 AI:  根据您的需求，为您推荐以下商品：[无法关联历史，当新需求处理]
```

## 项目结构

```
Retail/
├── frontend/                 # React前端
│   ├── src/
│   │   ├── components/       # UI组件
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   ├── InputBar.jsx
│   │   │   └── ClearButton.jsx
│   │   ├── hooks/
│   │   │   └── useSession.js     # 核心：会话上下文管理
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── App.css
│   └── vite.config.js
├── backend/                  # Node.js后端
│   ├── src/
│   │   ├── routes/
│   │   │   └── chat.js           # 聊天API
│   │   ├── services/
│   │   │   ├── intentParser.js   # 意图解析引擎
│   │   │   └── recommendation.js # 推荐服务
│   │   └── index.js
│   └── package.json
└── README.md
```

## API接口

### POST /api/chat

**请求体：**
```json
{
  "messages": [
    { "role": "user", "content": "想看冲锋衣" },
    { "role": "assistant", "content": "为您推荐..." }
  ],
  "currentMessage": "要蓝色的"
}
```

**响应体：**
```json
{
  "reply": "为您找到了蓝色的冲锋衣，共2款：",
  "items": [
    { "id": 1, "name": "轻量防风冲锋衣", "price": 399, "color": "蓝色", "image": "🧥", "description": "..." }
  ],
  "intent_tags": ["冲锋衣", "蓝色"],
  "price_range": null
}
```

## 设计决策

1. **上下文窗口大小**: 最近3轮（6条消息），平衡上下文丰富度与请求体积
2. **意图解析方式**: 纯规则引擎（关键词匹配），不依赖LLM调用，保证<1秒响应
3. **商品数据**: 内置26款模拟商品（服装/鞋/配饰），生产环境替换为真实推荐API
4. **颜色标准化**: 单字颜色自动补全（"红" → "红色"）
