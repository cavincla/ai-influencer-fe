import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Channel, ChannelCreate, ChannelListResponse, ChannelUpdate } from '../models/channel.model';
import { ContentListResponse, ContentStatus } from '../models/content.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChannelService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/channels`;

  list(activeOnly = true): Observable<ChannelListResponse> {
    const params = new HttpParams().set('active_only', activeOnly);
    return this.http.get<ChannelListResponse>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Channel> {
    return this.http.get<Channel>(`${this.baseUrl}/${id}`);
  }

  create(body: ChannelCreate): Observable<Channel> {
    return this.http.post<Channel>(this.baseUrl, body);
  }

  update(id: number, body: ChannelUpdate): Observable<Channel> {
    return this.http.patch<Channel>(`${this.baseUrl}/${id}`, body);
  }

  deactivate(id: number): Observable<{ id: number; is_active: boolean }> {
    return this.http.delete<{ id: number; is_active: boolean }>(`${this.baseUrl}/${id}`);
  }

  getContent(id: number, status?: ContentStatus, limit = 20, offset = 0): Observable<ContentListResponse> {
    let params = new HttpParams().set('limit', limit).set('offset', offset);
    if (status) params = params.set('status', status);
    return this.http.get<ContentListResponse>(`${this.baseUrl}/${id}/content`, { params });
  }

  generate(id: number, topic: string, context = ''): Observable<{ task_id: string; status: string }> {
    return this.http.post<{ task_id: string; status: string }>(
      `${this.baseUrl}/${id}/generate`,
      { topic, context }
    );
  }

  runPipeline(id: number): Observable<{ task_id: string; status: string }> {
    return this.http.post<{ task_id: string; status: string }>(
      `${this.baseUrl}/${id}/pipeline`,
      {}
    );
  }
}
