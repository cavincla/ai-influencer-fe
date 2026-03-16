import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PipelineConfig, PipelineTaskStatus } from '../models/pipeline.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PipelineService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/pipeline`;

  getConfig(): Observable<PipelineConfig> {
    return this.http.get<PipelineConfig>(`${this.baseUrl}/config`);
  }

  updateConfig(patch: Partial<PipelineConfig>): Observable<PipelineConfig> {
    return this.http.patch<PipelineConfig>(`${this.baseUrl}/config`, patch);
  }

  trigger(): Observable<{ task_id: string; status: string }> {
    return this.http.post<{ task_id: string; status: string }>(`${this.baseUrl}/trigger`, {});
  }

  getStatus(taskId: string): Observable<PipelineTaskStatus> {
    return this.http.get<PipelineTaskStatus>(`${this.baseUrl}/status/${taskId}`);
  }
}
