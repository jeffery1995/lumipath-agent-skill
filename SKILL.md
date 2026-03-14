# LumiPath Agent Skill

**目录**: ~/lumipath-agent  
**描述**: LumiPath 平台的 AI Agent 工具集，用于管理视频、社交媒体账号、本地化翻译和发布内容。

## 适用场景

当用户请求以下操作时激活此 skill：
- 查看或管理社交媒体账号（TikTok, YouTube, Instagram, Facebook）
- 上传或下载视频
- 视频翻译/配音/字幕
- 发布内容到社交平台
- 查询账号数据洞察
- 搜索知识库

## 前置要求

此 skill 依赖 LumiPath 后端 API，需要以下环境变量：
- `X_API_KEY`: LumiPath API 密钥
- `NEXTAUTH_URL`: LumiPath 后端地址（默认 http://localhost:3001）

## 项目结构

```
~/lumipath-agent/
├── SKILL.md                    # Skill 文档
├── package.json                # 项目配置
├── tools/
│   └── index.ts              # 工具实现（可直接导入使用）
└── scripts/
    └── tools-reference.ts    # 原始代码参考
```

## 工具列表 (12个)

### 1. connections_list - 查看已连接的社交账号

列出用户已连接的社交媒体账号。

**参数**:
- `platform` (可选): 平台名称过滤 (tiktok, youtube, instagram, facebook)

**返回**: 连接ID、平台、用户名、头像、状态等

---

### 2. tts_list - 查看可用配音 voices

列出可用于视频配音的 TTS 语音。

**参数**:
- `language` (可选): 语言代码过滤，如 'en', 'zh', 'ko'
- `gender` (可选): 'female' 或 'male'

**返回**: voice ID、显示名称、性别、语言

---

### 3. video_list - 查看视频库

列出用户已上传的视频。

**参数**:
- `page`: 页码（默认 1）
- `limit`: 每页数量（默认 10，最大 20）
- `search` (可选): 搜索标题或文件名

**返回**: 视频列表及分页信息

---

### 4. video_upload_from_url - 从 URL 上传视频

从远程 URL 下载并上传视频到用户视频库。支持：
- 抖音 (douyin.com)
- Bilibili (bilibili.com)
- 小红书 (xiaohongshu.com, xhslink.com)
- 任何直接视频 URL

**参数**:
- `url`: 视频 URL (必填)
- `filename` (可选): 文件名（含扩展名）
- `title` (可选): 显示标题

**返回**: OSS 地址

**⚠️ 重要**: 调用此工具前，需告知用户上传可能需要 1-2 分钟，请耐心等待。

---

### 5. localization_start - 开始视频本地化

启动视频翻译/配音/字幕任务。

**参数**:
- `vid`: 视频 ID（从 video_list 获取）(必填)
- `sourceUrl`: 源视频 OSS URL (必填)
- `sourceLang`: 源语言代码，如 'zh' (必填)
- `targetLang`: 目标语言代码，如 'en', 'ko' (必填)
- `dubbing` (可选): 启用 TTS 配音
- `dubbingVoiceId` (可选): TTS 语音 ID（从 tts_list 获取，默认 455）
- `backgroundMusic` (可选): 背景音乐 0=保留, 1=静音, 2=保留音效
- `subtitle` (可选): 烧录翻译字幕
- `subtitleStyle` (可选): 字幕样式代码
- `ocr` (可选): 翻译屏幕文字
- `copyright` (可选): 音乐版权检测

**返回**: taskId（用于查询进度）

---

### 6. localization_list - 查看本地化任务

列出用户的视频本地化任务。

**参数**:
- `vid` (可选): 按视频 ID 过滤
- `status` (可选): pending, running, completed, failed
- `page` (可选): 页码
- `limit` (可选): 每页数量

---

### 7. localization_get - 获取本地化任务状态

查询本地化任务进度和结果。

**参数**:
- `taskId`: 任务 ID (必填)

**返回**: 任务状态、完成后的 outputUrl（翻译后视频）

---

### 8. repurpose - 一键视频复用

单次调用完成：爬取视频 → 上传 → 翻译 → 自动发布。

**参数**:
- `sourceUrl`: 抖音/B站/小红书视频 URL (必填)
- `sourceLang`: 源语言代码 (必填)
- `targetLang`: 目标语言代码 (必填)
- `dubbing` (可选): 启用配音
- `dubbingVoiceId` (可选): 配音语音 ID
- `backgroundMusic` (可选): 背景音乐设置
- `subtitle` (可选): 烧录字幕
- `subtitleStyle` (可选): 字幕样式
- `ocr` (可选): 翻译屏幕文字
- `copyright` (可选): 版权检测
- `autoPublish` (可选): 自动发布配置

**返回**: taskId

---

### 9. social_post - 发布到社交媒体

将视频发布到一个或多个社交平台。

**参数**:
- `platforms`: 目标平台数组 [TIKTOK, YOUTUBE, INSTAGRAM] (必填)
- `text`: 帖子文案 (必填)
- `mediaUrls`: 视频 URL 数组 (必填)
- `tiktokConnectionIds` (可选): TikTok 连接 ID
- `youtubeConnectionIds` (可选): YouTube 连接 ID
- `instagramConnectionIds` (可选): Instagram 连接 ID

---

### 10. insights - 账号数据洞察

获取已连接账号的统计数据。

**参数**:
- `connectionId`: 连接 ID（从 connections_list 获取）(必填)

**返回**: 粉丝数、播放量、点赞数、视频数等

**支持平台**: tiktok, youtube, instagram, facebook

---

### 11. knowledge_search - 知识库搜索

搜索平台最佳实践、内容策略和创作者指南。

**参数**:
- `query`: 搜索关键词 (必填)
- `limit` (可选): 返回结果数量（默认 5，最大 10）

**返回**: 标题、内容、标签

---

### 12. web_search - 网页搜索

搜索最新信息、新闻、趋势。

**参数**:
- `query`: 搜索查询 (必填)
- `maxResults` (可选): 结果数量（默认 5，最大 10）

---

## 工具调用方式

### 方式 1: 直接导入使用 (Node.js)

```typescript
import { videoUploadFromUrl, localizationStart, localizationGet } from './tools';

// 初始化上下文
const context = {
  lumipathUrl: process.env.NEXTAUTH_URL || 'http://localhost:3001',
  apiKey: process.env.X_API_KEY || '',
  userId: 'user-id-here'
};

// 1. 上传视频
const uploadResult = await videoUploadFromUrl.execute({
  url: 'https://douyin.com/video/xxx',
  title: '我的视频'
}, context);

// 2. 开始翻译
const task = await localizationStart.execute({
  vid: uploadResult.vid,
  sourceUrl: uploadResult.url,
  sourceLang: 'zh',
  targetLang: 'en',
  dubbing: true,
  subtitle: true
}, context);

// 3. 查询进度
const status = await localizationGet.execute({
  taskId: task.taskId
}, context);
```

### 方式 2: MCP Server (OpenClaw 集成)

创建 MCP server 暴露这些工具：

```typescript
// mcp-server.js
import { allTools } from './tools/index.js';

const lumipathUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
const apiKey = process.env.X_API_KEY;

export function getTools() {
  return allTools.map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema,
    execute: (params) => tool.execute(params, { 
      lumipathUrl, 
      apiKey, 
      userId: 'current-user' 
    })
  }));
}
```

### 方式 3: HTTP API 封装

如果需要通过 HTTP 调用：

```bash
# 视频上传
curl -X POST $NEXTAUTH_URL/api/v1/videos/upload \
  -H "x-api-key: $X_API_KEY" \
  -H "x-user-id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://douyin.com/xxx"}'

# 开始翻译
curl -X POST $NEXTAUTH_URL/api/v1/localization \
  -H "x-api-key: $X_API_KEY" \
  -H "x-user-id: $USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"vid": "xxx", "sourceUrl": "xxx", "sourceLang": "zh", "targetLang": "en"}'
```

## 使用示例

### 示例 1: 上传视频并翻译

```
1. 调用 video_upload_from_url 上传视频
2. 调用 localization_start 开始翻译
3. 调用 localization_get 查询进度
4. 完成后获取 outputUrl
```

### 示例 2: 一键发布到 TikTok

```
1. 调用 connections_list 获取连接 ID
2. 调用 repurpose 或 localization_start + localization_get 获取翻译后视频
3. 调用 social_post 发布
```

### 示例 3: 查看账号数据

```
1. 调用 connections_list 获取 connectionId
2. 调用 insights 获取详细数据
```

## 错误处理

- `Service token not configured`: API 密钥未配置
- `Invalid connectionId`: 连接 ID 无效
- `Account not found`: 账号不存在
- 视频上传/翻译可能需要几分钟，任务为异步执行

## 安装

```bash
cd ~/lumipath-agent
npm install
npm run build  # 编译 TypeScript
```
