import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewDashboardResponse } from '../models/review.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/content`;

  getDashboard(): Observable<ReviewDashboardResponse> {
    return this.http.get<ReviewDashboardResponse>(`${this.baseUrl}/review-dashboard`);
  }
}
