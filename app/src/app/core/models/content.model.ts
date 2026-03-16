export type ContentStatus =
  | 'pending'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'publishing'
  | 'published'
  | 'failed';

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
  target_platforms: string[] | null;
  published_urls: Record<string, string> | null;
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentListResponse {
  items: GeneratedContent[];
  total: number;
}
