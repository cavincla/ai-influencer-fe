import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrendingTopic, TrendsResponse } from '../models/trend.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TrendsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/trends`;

  getCurrent(): Observable<TrendsResponse> {
    return this.http.get<TrendsResponse>(`${this.baseUrl}/current`);
  }

  getById(id: number): Observable<TrendingTopic> {
    return this.http.get<TrendingTopic>(`${this.baseUrl}/${id}`);
  }
}
