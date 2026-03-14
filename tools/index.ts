/**
 * LumiPath Agent Tools - Tool Handlers
 * 
 * 后端地址: https://lumipath.cn
 * 认证方式: Authorization: Bearer lumi_xxx (用户 API Key)
 */

const LUMIPATH_BASE_URL = "https://lumipath.cn";

// ============================================================================
// Context 类型定义 - 只需用户 API Key
// ============================================================================
interface ToolContext {
  apiKey: string; // 用户 API Key (格式: lumi_xxx)
}

// ============================================================================
// 通用 fetch 包装器
// ============================================================================
async function lumipathFetch(endpoint: string, options: RequestInit, context: ToolContext) {
  const { apiKey } = context;
  
  const res = await fetch(`${LUMIPATH_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    return { error: error.error || `Request failed: ${res.statusText}` };
  }
  
  return res.json();
}

// ============================================================================
// 工具 1: connections_list - 查看已连接的社交账号
// ============================================================================
export const connectionsList = {
  name: "connections_list",
  description: "List the user's connected social media accounts (TikTok, YouTube, Instagram, etc.)",
  inputSchema: {
    type: "object",
    properties: {
      platform: {
        type: "string",
        description: "Filter by platform name (e.g. 'tiktok', 'youtube'). Omit for all platforms."
      }
    }
  },
  execute: async ({ platform }: { platform?: string }, context: ToolContext) => {
    const endpoint = `/api/v1/accounts?linked=true${platform ? `&platform=${platform}` : ''}`;
    return lumipathFetch(endpoint, { method: 'GET' }, context);
  }
};

// ============================================================================
// 工具 2: tts_list - 可用配音列表
// ============================================================================
export const ttsList = {
  name: "tts_list",
  description: "List available TTS (text-to-speech) voices for video dubbing",
  inputSchema: {
    type: "object",
    properties: {
      language: {
        type: "string",
        description: "Filter by language code, e.g. 'en', 'zh', 'ko'"
      },
      gender: {
        type: "string",
        enum: ["female", "male"],
        description: "Filter by gender: 'female' or 'male'"
      }
    }
  },
  execute: async ({ language, gender }: { language?: string; gender?: string }, context: ToolContext) => {
    const params = new URLSearchParams();
    if (language) params.set('language', language);
    if (gender) params.set('gender', gender);
    return lumipathFetch(`/api/v1/tts?${params}`, { method: 'GET' }, context);
  }
};

// ============================================================================
// 工具 3: video_list - 视频库列表
// ============================================================================
export const videoList = {
  name: "video_list",
  description: "List the user's uploaded videos with optional search and pagination",
  inputSchema: {
    type: "object",
    properties: {
      page: { type: "number", default: 1 },
      limit: { type: "number", default: 10 },
      search: { type: "string" }
    }
  },
  execute: async ({ page, limit, search }: { page?: number; limit?: number; search?: string }, context: ToolContext) => {
    const params = new URLSearchParams();
    params.set('page', String(page || 1));
    params.set('limit', String(limit || 10));
    if (search) params.set('search', search);
    return lumipathFetch(`/api/v1/videos?${params}`, { method: 'GET' }, context);
  }
};

// ============================================================================
// 工具 4: video_upload_from_url - 从 URL 上传视频
// ============================================================================
export const videoUploadFromUrl = {
  name: "video_upload_from_url",
  description: "Download a video from a remote URL and upload it to the user's video library. Supports Douyin, Bilibili, Xiaohongshu links. ⚠️ May take 1-2 minutes.",
  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string", description: "Video URL - supports Douyin, Bilibili, Xiaohongshu, or direct video URL" },
      filename: { type: "string" },
      title: { type: "string" }
    },
    required: ["url"]
  },
  execute: async ({ url, filename, title }: { url: string; filename?: string; title?: string }, context: ToolContext) => {
    return lumipathFetch('/api/v1/videos/upload', {
      method: 'POST',
      body: JSON.stringify({ url, filename, title })
    }, context);
  }
};

// ============================================================================
// 工具 5: localization_start - 开始视频本地化
// ============================================================================
export const localizationStart = {
  name: "localization_start",
  description: "Start a video localization job (dubbing, subtitle burn, or OCR text translation)",
  inputSchema: {
    type: "object",
    properties: {
      vid: { type: "string", description: "Video ID (from video_list)" },
      sourceUrl: { type: "string", description: "OSS URL of the source video" },
      sourceLang: { type: "string", description: "Source language code, e.g. 'zh'" },
      targetLang: { type: "string", description: "Target language code, e.g. 'en', 'ko'" },
      dubbing: { type: "boolean", description: "Enable TTS voice-over dubbing" },
      dubbingVoiceId: { type: "number", description: "TTS voice ID from tts_list (defaults to 455)" },
      backgroundMusic: { type: "number", minimum: 0, maximum: 2, description: "0=keep, 1=mute, 2=keep sfx only" },
      subtitle: { type: "boolean", description: "Burn translated subtitles" },
      subtitleStyle: { type: "string", description: "Subtitle style code" },
      ocr: { type: "boolean", description: "Translate on-screen text (OCR)" },
      copyright: { type: "boolean", description: "Run music copyright detection" }
    },
    required: ["vid", "sourceUrl", "sourceLang", "targetLang"]
  },
  execute: async (params: {
    vid: string;
    sourceUrl: string;
    sourceLang: string;
    targetLang: string;
    dubbing?: boolean;
    dubbingVoiceId?: number;
    backgroundMusic?: number;
    subtitle?: boolean;
    subtitleStyle?: string;
    ocr?: boolean;
    copyright?: boolean;
  }, context: ToolContext) => {
    return lumipathFetch('/api/v1/localization', {
      method: 'POST',
      body: JSON.stringify(params)
    }, context);
  }
};

// ============================================================================
// 工具 6: localization_list - 本地化任务列表
// ============================================================================
export const localizationList = {
  name: "localization_list",
  description: "List the user's video localization tasks",
  inputSchema: {
    type: "object",
    properties: {
      vid: { type: "string" },
      status: { type: "string", enum: ["pending", "running", "completed", "failed"] },
      page: { type: "number" },
      limit: { type: "number" }
    }
  },
  execute: async ({ vid, status, page, limit }: { vid?: string; status?: string; page?: number; limit?: number }, context: ToolContext) => {
    const params = new URLSearchParams();
    if (vid) params.set('vid', vid);
    if (status) params.set('status', status);
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    return lumipathFetch(`/api/v1/localization?${params}`, { method: 'GET' }, context);
  }
};

// ============================================================================
// 工具 7: localization_get - 获取本地化任务状态
// ============================================================================
export const localizationGet = {
  name: "localization_get",
  description: "Get the current status and output URL of a localization task",
  inputSchema: {
    type: "object",
    properties: {
      taskId: { type: "string", description: "Task ID from localization_start or localization_list" }
    },
    required: ["taskId"]
  },
  execute: async ({ taskId }: { taskId: string }, context: ToolContext) => {
    return lumipathFetch(`/api/v1/localization?taskId=${taskId}`, { method: 'GET' }, context);
  }
};

// ============================================================================
// 工具 8: repurpose - 一键视频复用
// ============================================================================
export const repurpose = {
  name: "repurpose",
  description: "One-shot repurpose: crawl a video URL, upload, translate, and optionally auto-publish",
  inputSchema: {
    type: "object",
    properties: {
      sourceUrl: { type: "string", description: "Douyin, Bilibili, or Xiaohongshu video URL" },
      sourceLang: { type: "string", description: "Source language code, e.g. 'zh'" },
      targetLang: { type: "string", description: "Target language code, e.g. 'en'" },
      dubbing: { type: "boolean" },
      dubbingVoiceId: { type: "number" },
      backgroundMusic: { type: "number" },
      subtitle: { type: "boolean" },
      subtitleStyle: { type: "string" },
      ocr: { type: "boolean" },
      copyright: { type: "boolean" },
      autoPublish: {
        type: "object",
        properties: {
          text: { type: "string" },
          tiktokConnectionIds: { type: "array", items: { type: "string" } },
          youtubeConnectionIds: { type: "array", items: { type: "string" } },
          instagramConnectionIds: { type: "array", items: { type: "string" } }
        }
      }
    },
    required: ["sourceUrl", "sourceLang", "targetLang"]
  },
  execute: async (params: {
    sourceUrl: string;
    sourceLang: string;
    targetLang: string;
    dubbing?: boolean;
    dubbingVoiceId?: number;
    backgroundMusic?: number;
    subtitle?: boolean;
    subtitleStyle?: string;
    ocr?: boolean;
    copyright?: boolean;
    autoPublish?: {
      text: string;
      tiktokConnectionIds?: string[];
      youtubeConnectionIds?: string[];
      instagramConnectionIds?: string[];
    };
  }, context: ToolContext) => {
    return lumipathFetch('/api/v1/repurpose', {
      method: 'POST',
      body: JSON.stringify(params)
    }, context);
  }
};

// ============================================================================
// 工具 9: social_post - 发布到社交媒体
// ============================================================================
export const socialPost = {
  name: "social_post",
  description: "Publish a video to one or more social media platforms (TikTok, YouTube, Instagram)",
  inputSchema: {
    type: "object",
    properties: {
      platforms: {
        type: "array",
        items: { type: "string", enum: ["TIKTOK", "YOUTUBE", "INSTAGRAM"] },
        description: "Target platforms to publish to"
      },
      text: { type: "string", description: "Caption or description for the post" },
      mediaUrls: { type: "array", items: { type: "string" }, description: "Array of video URLs to publish" },
      tiktokConnectionIds: { type: "array", items: { type: "string" } },
      youtubeConnectionIds: { type: "array", items: { type: "string" } },
      instagramConnectionIds: { type: "array", items: { type: "string" } }
    },
    required: ["platforms", "text", "mediaUrls"]
  },
  execute: async (params: {
    platforms: string[];
    text: string;
    mediaUrls: string[];
    tiktokConnectionIds?: string[];
    youtubeConnectionIds?: string[];
    instagramConnectionIds?: string[];
  }, context: ToolContext) => {
    return lumipathFetch('/api/v1/social-posts', {
      method: 'POST',
      body: JSON.stringify({ ...params, contentType: "VIDEO" })
    }, context);
  }
};

// ============================================================================
// 工具 10: insights - 账号数据洞察
// ============================================================================
export const insights = {
  name: "insights",
  description: "Get account insights (followers, views, likes, etc.) for a connected social media account",
  inputSchema: {
    type: "object",
    properties: {
      connectionId: { type: "string", description: "The account connection ID (from connections_list)" }
    },
    required: ["connectionId"]
  },
  execute: async ({ connectionId }: { connectionId: string }, context: ToolContext) => {
    return lumipathFetch(`/api/v1/insights/${connectionId}`, { method: 'GET' }, context);
  }
};

// ============================================================================
// 工具 11: knowledge_search - 知识库搜索
// ============================================================================
export const knowledgeSearch = {
  name: "knowledge_search",
  description: "Search the knowledge base for platform best practices and creator guides",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "The search query to find relevant knowledge" },
      limit: { type: "number", minimum: 1, maximum: 10, default: 5 }
    },
    required: ["query"]
  },
  execute: async ({ query, limit }: { query: string; limit?: number }, context: ToolContext) => {
    const params = new URLSearchParams();
    params.set('query', query);
    if (limit) params.set('limit', String(limit));
    return lumipathFetch(`/api/v1/knowledge/search?${params}`, { method: 'GET' }, context);
  }
};

// ============================================================================
// 导出所有工具 (11个 - 已移除 web_search)
// ============================================================================
export const allTools = [
  connectionsList,
  ttsList,
  videoList,
  videoUploadFromUrl,
  localizationStart,
  localizationList,
  localizationGet,
  repurpose,
  socialPost,
  insights,
  knowledgeSearch
];

export default allTools;
