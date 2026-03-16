export interface TrendingTopic {
  id: number;
  topic: string;
  score: number;
  sources: Record<string, unknown>;
  discovered_at: string;
}

export interface TrendsResponse {
  topics: TrendingTopic[];
  count: number;
}
