/**
 * LumiPath Agent Tools Reference
 * 
 * 这是 LumiPath 前端项目 ai-agent tools 的完整实现参考
 * 源文件位置: ~/x-lumi-fe/src/modules/ai-agent/tools/
 */

import { tool } from "ai";
import { z } from "zod";

// ============================================================================
// 工具 1: connections_list - 查看已连接的社交账号
// ============================================================================
export const connectionsTool = {
  description: "List the user's connected social media accounts (TikTok, YouTube, Instagram, etc.)",
  inputSchema: z.object({
    platform: z.string().optional().describe("Filter by platform name (e.g. 'tiktok', 'youtube')"),
  }),
  execute: async ({ platform }) => {
    // 调用 MongoDB accounts collection
    // filter: { uid, linked: true, platform }
    // 返回: connectionId, platform, username, displayName, avatarUrl, status
  }
};

// ============================================================================
// 工具 2: tts_list - 可用配音列表
// ============================================================================
export const ttsTool = {
  description: "List available TTS (text-to-speech) voices for video dubbing",
  inputSchema: z.object({
    language: z.string().optional().describe("Filter by language code, e.g. 'en', 'zh', 'ko'"),
    gender: z.enum(["female", "male"]).optional(),
  }),
  execute: async ({ language, gender }) => {
    // GET /api/v1/tts
    // Header: x-api-key, x-user-id
    // 返回: voices array with id, displayName, gender, language
  }
};

// ============================================================================
// 工具 3: video_list - 视频库列表
// ============================================================================
export const videoListTool = {
  description: "List the user's uploaded videos with optional search and pagination",
  inputSchema: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(20).default(10),
    search: z.string().optional(),
  }),
  execute: async ({ page, limit, search }) => {
    // 查询 MongoDB videos collection
    // 返回: videos array, pagination info
  }
};

// ============================================================================
// 工具 4: video_upload_from_url - 从 URL 上传视频
// ============================================================================
export const videoUploadTool = {
  description: "Download a video from a remote URL and upload it to the user's video library",
  inputSchema: z.object({
    url: z.string().describe("Video URL - supports Douyin, Bilibili, Xiaohongshu, or direct video URL"),
    filename: z.string().optional(),
    title: z.string().optional(),
  }),
  execute: async ({ url, filename, title }) => {
    // POST /api/v1/videos/upload
    // 自动通过 crawler 解析抖音/ B站/小红书链接
    // ⚠️ 需要 1-2 分钟处理时间
  }
};

// ============================================================================
// 工具 5: localization_start - 开始视频本地化
// ============================================================================
export const localizationStartTool = {
  description: "Start a video localization job (dubbing, subtitle burn, or OCR text translation)",
  inputSchema: z.object({
    vid: z.string(),
    sourceUrl: z.string(),
    sourceLang: z.string(),
    targetLang: z.string(),
    dubbing: z.boolean().optional(),
    dubbingVoiceId: z.number().optional(),
    backgroundMusic: z.number().min(0).max(2).optional(),
    subtitle: z.boolean().optional(),
    subtitleStyle: z.string().optional(),
    ocr: z.boolean().optional(),
    copyright: z.boolean().optional(),
  }),
  execute: async (params) => {
    // POST /api/v1/localization
    // 返回: { taskId: "..." }
  }
};

// ============================================================================
// 工具 6: localization_list - 本地化任务列表
// ============================================================================
export const localizationListTool = {
  description: "List the user's video localization tasks",
  inputSchema: z.object({
    vid: z.string().optional(),
    status: z.enum(["pending", "running", "completed", "failed"]).optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
  }),
  execute: async (params) => {
    // GET /api/v1/localization?vid=...&status=...
  }
};

// ============================================================================
// 工具 7: localization_get - 获取本地化任务状态
// ============================================================================
export const localizationGetTool = {
  description: "Get the current status and output URL of a localization task",
  inputSchema: z.object({
    taskId: z.string(),
  }),
  execute: async ({ taskId }) => {
    // GET /api/v1/localization?taskId=...
    // 完成后返回 outputUrl
  }
};

// ============================================================================
// 工具 8: repurpose - 一键视频复用
// ============================================================================
export const repurposeTool = {
  description: "One-shot repurpose: crawl, upload, translate, and optionally auto-publish",
  inputSchema: z.object({
    sourceUrl: z.string(),
    sourceLang: z.string(),
    targetLang: z.string(),
    dubbing: z.boolean().optional(),
    dubbingVoiceId: z.number().optional(),
    backgroundMusic: z.number().optional(),
    subtitle: z.boolean().optional(),
    subtitleStyle: z.string().optional(),
    ocr: z.boolean().optional(),
    copyright: z.boolean().optional(),
    autoPublish: z.object({
      text: z.string(),
      tiktokConnectionIds: z.array(z.string()).optional(),
      youtubeConnectionIds: z.array(z.string()).optional(),
      instagramConnectionIds: z.array(z.string()).optional(),
    }).optional(),
  }),
  execute: async (params) => {
    // POST /api/v1/repurpose
  }
};

// ============================================================================
// 工具 9: social_post - 发布到社交媒体
// ============================================================================
export const socialPostTool = {
  description: "Publish a video to one or more social media platforms",
  inputSchema: z.object({
    platforms: z.array(z.enum(["TIKTOK", "YOUTUBE", "INSTAGRAM"])),
    text: z.string(),
    mediaUrls: z.array(z.string()),
    tiktokConnectionIds: z.array(z.string()).optional(),
    youtubeConnectionIds: z.array(z.string()).optional(),
    instagramConnectionIds: z.array(z.string()).optional(),
  }),
  execute: async (params) => {
    // POST /api/v1/social-posts
  }
};

// ============================================================================
// 工具 10: insights - 账号数据洞察
// ============================================================================
export const insightsTool = {
  description: "Get account insights (followers, views, likes, etc.) for a connected account",
  inputSchema: z.object({
    connectionId: z.string(),
  }),
  execute: async ({ connectionId }) => {
    // 根据 platform 调用不同 API:
    // - TikTok: business-api.tiktok.com
    // - YouTube: youtube.googleapis.com
    // - Instagram: graph.instagram.com
    // - Facebook: graph.facebook.com
  }
};

// ============================================================================
// 工具 11: knowledge_search - 知识库搜索
// ============================================================================
export const knowledgeSearchTool = {
  description: "Search the knowledge base for platform best practices and creator guides",
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(10).default(5),
  }),
  execute: async ({ query, limit }) => {
    // 查询 MongoDB agent_knowledge collection
    // 搜索 userId=null (公共) 或 userId=当前用户
  }
};

// ============================================================================
// 工具 12: web_search - 网页搜索
// ============================================================================
export const webSearchTool = {
  description: "Search the web for current information, news, trends",
  inputSchema: z.object({
    query: z.string(),
    maxResults: z.number().int().min(1).max(10).default(5),
  }),
  execute: async ({ query, maxResults }) => {
    // POST https://api.tavily.com/search
    // 需要 TAVILY_API_KEY
  }
};

// ============================================================================
// API 端点汇总
// ============================================================================
/*
Base URL: ${NEXTAUTH_URL || 'http://localhost:3001'}

需要 Header:
  - x-api-key: ${X_API_KEY}
  - x-user-id: ${userId}

Endpoints:
  GET  /api/v1/tts                    -> tts_list
  POST /api/v1/videos/upload           -> video_upload_from_url
  POST /api/v1/localization            -> localization_start
  GET  /api/v1/localization            -> localization_list / localization_get
  POST /api/v1/repurpose               -> repurpose
  POST /api/v1/social-posts            -> social_post

MongoDB Collections:
  - lumi.accounts        -> connections_list, insights
  - lumi.videos         -> video_list
  - lumi.agent_knowledge -> knowledge_search
*/
