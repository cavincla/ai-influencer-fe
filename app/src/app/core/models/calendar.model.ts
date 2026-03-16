import { GeneratedContent } from './content.model';

export interface CalendarDay {
  date: string; // ISO date 'YYYY-MM-DD'
  items: GeneratedContent[];
}

export interface CalendarResponse {
  days: CalendarDay[];
  from_date: string;
  to_date: string;
}
