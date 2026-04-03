import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PublishResponse {
  content_id: number;
  task_id: string;
  status: string;
  platforms: string[];
  dry_run: boolean;
}

@Injectable({ providedIn: 'root' })
export class PublishService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/publish`;

  publish(contentId: number, platforms?: string[], dryRun = false): Observable<PublishResponse> {
    return this.http.post<PublishResponse>(`${this.baseUrl}/${contentId}`, {
      platforms: platforms ?? null,
      dry_run: dryRun,
    });
  }
}
