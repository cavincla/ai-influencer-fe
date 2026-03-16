import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContentListResponse, ContentStatus, GeneratedContent } from '../models/content.model';
import { CalendarResponse } from '../models/calendar.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/content`;

  list(limit = 20, offset = 0, status?: ContentStatus): Observable<ContentListResponse> {
    let params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset);
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<ContentListResponse>(`${this.baseUrl}/list`, { params });
  }

  getById(id: number): Observable<GeneratedContent> {
    return this.http.get<GeneratedContent>(`${this.baseUrl}/${id}`);
  }

  generate(topic: string, platforms: string[]): Observable<{ task_id: string; status: string }> {
    return this.http.post<{ task_id: string; status: string }>(`${this.baseUrl}/generate`, {
      topic,
      platforms,
    });
  }

  updateStatus(id: number, status: ContentStatus): Observable<GeneratedContent> {
    return this.http.patch<GeneratedContent>(`${this.baseUrl}/${id}/status`, { status });
  }

  schedule(id: number, scheduledFor: string | null): Observable<GeneratedContent> {
    return this.http.patch<GeneratedContent>(`${this.baseUrl}/${id}/schedule`, {
      scheduled_for: scheduledFor,
    });
  }

  getCalendar(fromDate: string, toDate: string): Observable<CalendarResponse> {
    const params = new HttpParams().set('from_date', fromDate).set('to_date', toDate);
    return this.http.get<CalendarResponse>(`${this.baseUrl}/calendar`, { params });
  }
}
