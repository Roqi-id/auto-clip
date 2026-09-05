export type SocialPlatform = 'youtube_shorts' | 'tiktok' | 'instagram_reels' | 'x_twitter' | 'custom_webhook';

export interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  author: string;
  authorUrl?: string;
  thumbnailUrl: string;
  durationSeconds: number;
  durationFormatted: string;
  url: string;
  descriptionSnippet: string;
  transcriptSample?: string;
}

export interface ClipSubtitleItem {
  start: number; // in seconds
  end: number;
  text: string;
  highlight?: boolean;
}

export interface SafetyAssessment {
  safeToPublish: boolean;
  copyrightRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  contentScore: number;
  notes: string;
}

export interface GeneratedClip {
  id: string;
  videoId: string;
  clipNumber: number;
  title: string;
  hookQuote: string;
  startTime: number;
  endTime: number;
  duration: number;
  viralityScore: number;
  viralReasons: string[];
  subtitles: ClipSubtitleItem[];
  socialCaptions: {
    tiktok: string;
    reels: string;
    shorts: string;
    x: string;
  };
  hashtags: string[];
  safety: SafetyAssessment;
  aspectPreset: '9:16' | '1:1' | '16:9';
  subtitleStyle: 'mrbeast-yellow' | 'tiktok-neon' | 'minimal-clean' | 'karaoke-glow';
}

export interface PlatformPublishResult {
  status: 'success' | 'failed' | 'pending';
  postId?: string;
  postUrl?: string;
  publishedAt?: string;
  error?: string;
}

export interface PublishJob {
  id: string;
  clipId: string;
  clipTitle: string;
  videoTitle: string;
  platforms: SocialPlatform[];
  status: 'queued' | 'processing' | 'published' | 'failed';
  mode: 'instant' | 'scheduled';
  scheduledTime?: string;
  createdAt: string;
  completedAt?: string;
  platformResults: Partial<Record<SocialPlatform, PlatformPublishResult>>;
  hmacSignature?: string;
  payloadChecksum?: string;
  // Storage & Auto-Purge lifecycle
  storageStatus?: 'purged' | 'retained' | 'pending_upload' | 'failed_retained';
  videoFileSizeMb?: number;
  storageFreedMb?: number;
  storagePurgedAt?: string;
  storageRetentionPolicy?: 'immediate' | '1_hour' | '24_hours' | 'manual';
}

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType:
    | 'SSRF_SHIELD_CHECK'
    | 'URL_VALIDATED'
    | 'URL_BLOCKED'
    | 'GEMINI_PRO_ANALYSIS'
    | 'HMAC_PAYLOAD_SIGNED'
    | 'CLIP_GENERATED'
    | 'SOCIAL_DISPATCH'
    | 'WEBHOOK_DELIVERED'
    | 'SECURITY_CONFIG_UPDATE'
    | 'RATE_LIMIT_CHECK'
    | 'STORAGE_AUTO_PURGED'
    | 'STORAGE_CLEANED';
  severity: AuditSeverity;
  details: string;
  ipMasked: string;
  signatureHash?: string;
}

export interface ConnectedAccount {
  connected: boolean;
  accountName: string;
  autoPublishEnabled: boolean;
  lastSynced?: string;
}

export interface StorageMetrics {
  totalStorageFreedMb: number;
  totalClipsPurged: number;
  activeStorageUsedMb: number;
  autoDeleteOnPublish: boolean;
  retentionPolicy: 'immediate' | '1_hour' | '24_hours' | 'manual';
  lastPurgedAt?: string;
}

export interface SecuritySettings {
  ssrfProtectionEnabled: boolean;
  hmacSigningEnabled: boolean;
  rateLimitEnabled: boolean;
  autoModerationEnabled: boolean;
  model: 'gemini-3.1-pro-preview' | 'gemini-3.8-flash';
  webhookUrl: string;
  webhookSecretMasked: string;
  accounts: Record<SocialPlatform, ConnectedAccount>;
  // Storage & auto-purge configuration
  autoDeleteOnPublish: boolean;
  retentionPolicy: 'immediate' | '1_hour' | '24_hours' | 'manual';
  zeroFootprintGuarantee: boolean;
}
