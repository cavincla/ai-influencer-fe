export type ChannelType =
  | 'anime_artistic'
  | 'lifestyle_fitness'
  | 'educational'
  | 'politics'
  | 'shopping'
  | 'sports'
  | 'technology'
  | 'finance'
  | 'entertainment'
  | 'health'
  | 'science';

export interface PersonaConfig {
  name: string;
  description: string;
  voice_style: string;
  visual_prompt_base: string;
}

export interface ContentConfig {
  target_platforms: string[];
  languages: Record<string, string>;
  default_topics: string[];
  tone: string;
  image_style: string;
}

export interface Channel {
  id: number;
  name: string;
  slug: string;
  channel_type: ChannelType;
  is_active: boolean;
  persona: PersonaConfig;
  content_config: ContentConfig;
  created_at: string;
  updated_at: string;
}

export interface ChannelListResponse {
  items: Channel[];
  total: number;
}

export interface ChannelCreate {
  name: string;
  slug: string;
  channel_type: ChannelType;
  persona: PersonaConfig;
  credentials?: Record<string, string>;
  content_config: Partial<ContentConfig>;
}

export interface ChannelUpdate {
  name?: string;
  is_active?: boolean;
  persona?: Partial<PersonaConfig>;
  credentials?: Record<string, string>;
  content_config?: Partial<ContentConfig>;
}
