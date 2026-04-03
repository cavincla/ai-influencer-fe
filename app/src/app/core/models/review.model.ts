import { Channel } from './channel.model';
import { GeneratedContent } from './content.model';

export interface ChannelReviewSection {
  channel: Channel;
  contents: GeneratedContent[];
  pending_count: number;
}

export interface ReviewDashboardResponse {
  sections: ChannelReviewSection[];
  total_pending: number;
  generated_at: string;
}
