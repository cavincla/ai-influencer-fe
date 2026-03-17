export type ContentStatus =
  | 'pending'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'publishing'
  | 'published'
  | 'failed';

export interface ScriptVersion {
  hook: string;
  script: string;
  cta: string;
  hashtags: string[];
  mood?: string;
  virality_score?: number;
  language?: string;
}

export interface ValidationResult {
  passed: boolean;
  score: number;
  issues: string[];
  suggestion: string;
  checked_at?: string;
}

export interface GeneratedContent {
  id: number;
  topic_id: number | null;
  status: ContentStatus;
  hook: string | null;
  script: string | null;
  cta: string | null;
  captions: Record<string, string> | null;
  hashtags: string[] | null;
  audio_path: string | null;
  video_path: string | null;
  thumbnail_path: string | null;
  audio_url: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  image_url: string | null;
  target_platforms: string[] | null;
  published_urls: Record<string, string> | null;
  scheduled_for: string | null;
  content_versions: Record<string, ScriptVersion> | null;
  validation_result: ValidationResult | null;
  created_at: string;
  updated_at: string;
}

export interface ContentListResponse {
  items: GeneratedContent[];
  total: number;
}
