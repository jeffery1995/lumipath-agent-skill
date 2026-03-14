/**
 * LumiPath Agent Tools - Tool Handlers
 * 
 * 这些是实际的工具实现，通过 HTTP API 调用 LumiPath 后端
 * 适用于 OpenClaw 或任何需要调用 LumiPath API 的场景
 */

import { z } from "zod";

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
  execute: async ({ platform }: { platform?: string }, context: { lumipathUrl: string; apiKey: string; userId: string }) => {
    const { lumipathUrl, apiKey, userId } = context;
    
    // 调用 MongoDB - 需要通过后端 API 或直接连接
    // 这里假设有 /api/v1/accounts 端点
    const res = await fetch(`${lumipathUrl}/api/v1/accounts?linked=true${platform ? `&platform=${platform}` : ''}`, {
      headers: {
        'x-api-key': apiKey,
        'x-user-id': userId
      }
    });
    
    if (!res.ok) {
      return { error: `Failed to fetch connections: ${res.statusText}` };
    }
    
    const data = await res.json();
    return data;
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
  execute: async ({ language, gender }: { language?: string; gender?: string }, context: { lumipathUrl: string; apiKey: string; userId: string }) => {
    const { lumipathUrl, apiKey, userId } = context;
    
    const params = new URLSearchParams();
    if (language) params.set('language', language);
    if (gender) params.set('gender', gender);
    
    const res = await fetch(`${lumipathUrl}/api/v1/tts?${params}`, {
      headers: {
        'x-api-key': apiKey,
        'x-user-id': userId
      }
    });
    
    if (!res.ok) {
      return { error: `Failed to fetch TTS voices: ${res.statusText}` };
    }
    
    const data = await res.json();
    return data;
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
  execute: async ({ page, limit, search }: { page?: number; limit?: number; search?: string }, context: { lumipathUrl: string; apiKey: string; userId: string }) => {
    const { lumipathUrl, apiKey, userId } = context;
    
    const params = new URLSearchParams();
    params.set('page', String(page || 1));
    params.set('limit', String(limit || 10));
    if (search) params.set('search', search);
    
    const res = await fetch(`${lumipathUrl}/api/v1/videos?${params}`, {
      headers: {
        'x-api-key': apiKey,
        'x-user-id': userId
      }
    });
    
    if (!res.ok) {
      return { error: `Failed to fetch videos: ${res.statusText}` };
    }
    
    const data = await res.json();
    return data;
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
  execute: async ({ url, filename, title }: { url: string; filename?: string; title?: string }, context: { lumipathUrl: string; apiKey: string; userId: string }) => {
    const { lumipathUrl, apiKey, userId } = context;
    
    const res = await fetch(`${lumipathUrl}/api/v1/videos/upload`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'x-user-id': userId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, filename, title })
    });
    
    if (!res.ok) {
      return { error: `Failed to upload video: ${res.statusText}` };
    }
    
    const data = await res.json();
    return data;
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
  }, context: { lumipathUrl: string; apiKey: string; userId: string }) => {
    const { lumipathUrl, apiKey, userId } = context;
    
    const res = await fetch(`${lumipathUrl}/api/v1/localization`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'x-user-id': userId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!res.ok) {
      return { error: `Failed to start localization: ${res.statusText}` };
    }
    
    const data = await res.json();
    return data;
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
  execute: async ({ vid, status, page, limit }: { vid?: string; status?: string; page?: number; limit?: number }, context: { lumipathUrl: string; apiKey: string; userId: string }) => {
    const { lumipathUrl, apiKey, userId } = context;
    
    const params = new URLSearchParams();
    if (vid) params.set('vid', vid);
    if (status) params.set('status', status);
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    
    const res = await fetch(`${lumipathUrl}/api/v1/localization?${params}`, {
      headers: {
        'x-api-key': apiKey,
        'x-user-id': userId
      }
    });
    
    if (!res.ok) {
      return { error: `Failed to fetch localization tasks: ${res.statusText}` };
    }
    
    const data = await res.json();
    return data;
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
  execute: async ({ taskId }: { taskId: string }, context: { lumipathUrl: string; apiKey: string; userId: string }) => {
    const { lumipathUrl, apiKey, userId } = context;
    
    const res = await fetch(`${lumipathUrl}/api/v1/localization?taskId=${taskId}`, {
      headers: {
        'x-api-key': apiKey,
        'x-user-id': userId
      }
    });
    
    if (!res.ok) {
      return { error: `Failed to get localization status: ${res.statusText}` };
    }
    
    const data = await res.json();
    return data;
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
  }, context: { lumipathUrl: string; apiKey: string; userId: string }) => {
    const { lumipathUrl, apiKey, userId } = context;
    
    const res = await fetch(`${lumipathUrl}/api/v1/repurpose`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'x-user-id': userId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!res.ok) {
      return { error: `Failed to start repurpose: ${res.statusText}` };
    }
    
    const data = await res.json();
    return data;
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
  }, context: { lumipathUrl: string; apiKey: string; userId: string }) => {
    const { lumipathUrl, apiKey, userId } = context;
    
    const res = await fetch(`${lumipathUrl}/api/v1/social-posts`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'x-user-id': userId,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...params, contentType: "VIDEO" })
    });
    
    if (!res.ok) {
      return { error: `Failed to post to social media: ${res.statusText}` };
    }
    
    const data = await res.json();
    return data;
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
  execute: async ({ connectionId }: { connectionId: string }, context: { lumipathUrl: string; apiKey: string; userId: string }) => {
    const { lumipathUrl, apiKey, userId } = context;
    
    const res = await fetch(`${lumipathUrl}/api/v1/insights/${connectionId}`, {
      headers: {
        'x-api-key': apiKey,
        'x-user-id': userId
      }
    });
    
    if (!res.ok) {
      return { error: `Failed to fetch insights: ${res.statusText}` };
    }
    
    const data = await res.json();
    return data;
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
  execute: async ({ query, limit }: { query: string; limit?: number }, context: { lumipathUrl: string; apiKey: string; userId: string }) => {
    const { lumipathUrl, apiKey, userId } = context;
    
    const params = new URLSearchParams();
    params.set('query', query);
    if (limit) params.set('limit', String(limit));
    
    const res = await fetch(`${lumipathUrl}/api/v1/knowledge/search?${params}`, {
      headers: {
        'x-api-key': apiKey,
        'x-user-id': userId
      }
    });
    
    if (!res.ok) {
      return { error: `Failed to search knowledge base: ${res.statusText}` };
    }
    
    const data = await res.json();
    return data;
  }
};

// ============================================================================
// 工具 12: web_search - 网页搜索
// ============================================================================
export const webSearch = {
  name: "web_search",
  description: "Search the web for current information, news, trends, and up-to-date data",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "The search query" },
      maxResults: { type: "number", minimum: 1, maximum: 10, default: 5 }
    },
    required: ["query"]
  },
  execute: async ({ query, maxResults }: { query: string; maxResults?: number }, context: { lumipathUrl: string; apiKey: string; userId: string }) => {
    const { lumipathUrl, apiKey, userId } = context;
    
    // 调用 Tavily API
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,  // 注意：可能需要不同的 API key
        query,
        max_results: maxResults || 5,
        search_depth: 'basic'
      })
    });
    
    if (!res.ok) {
      return { error: `Search failed: ${res.statusText}` };
    }
    
    const data = await res.json();
    return (data.results || []).map((r: { title: string; url: string; content: string }) => ({
      title: r.title,
      url: r.url,
      content: r.content
    }));
  }
};

// ============================================================================
// 导出所有工具
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
  knowledgeSearch,
  webSearch
];

export default allTools;
