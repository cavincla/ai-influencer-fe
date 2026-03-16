import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrendsService } from '../../../../core/services/trends.service';
import { TrendingTopic } from '../../../../core/models/trend.model';

@Component({
  selector: 'app-trending-topics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trending-topics.html',
  styleUrl: './trending-topics.scss',
})
export class TrendingTopicsComponent implements OnInit {
  private trendsService = inject(TrendsService);

  topics: TrendingTopic[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.trendsService.getCurrent().subscribe({
      next: (res) => {
        this.topics = res.topics;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossibile caricare i trend. Verifica che il backend sia attivo.';
        this.loading = false;
      },
    });
  }

  scoreClass(score: number): string {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  }
}
