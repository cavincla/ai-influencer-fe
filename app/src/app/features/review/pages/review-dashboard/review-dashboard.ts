import {
  Component,
  OnInit,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ReviewService } from '../../../../core/services/review.service';
import { ChannelReviewSection } from '../../../../core/models/review.model';
import { GeneratedContent } from '../../../../core/models/content.model';
import { ReviewContentCardComponent } from '../../components/review-content-card/review-content-card';

@Component({
  selector: 'app-review-dashboard',
  standalone: true,
  imports: [CommonModule, ReviewContentCardComponent],
  templateUrl: './review-dashboard.html',
  styleUrl: './review-dashboard.scss',
})
export class ReviewDashboardPage implements OnInit {
  private reviewService = inject(ReviewService);
  private destroyRef = inject(DestroyRef);

  sections: ChannelReviewSection[] = [];
  totalPending = 0;
  loading = true;
  lastUpdated: Date | null = null;

  /** IDs rimossi ottimisticamente prima del prossimo poll */
  private dismissedIds = new Set<number>();

  ngOnInit(): void {
    this.load();

    // Auto-refresh ogni 60 secondi
    interval(60_000)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap(() => this.reviewService.getDashboard()),
      )
      .subscribe({
        next: (data) => {
          this.totalPending = data.total_pending;
          this.lastUpdated = new Date();
          this.sections = data.sections.map((s) => ({
            ...s,
            contents: s.contents.filter((c) => !this.dismissedIds.has(c.id)),
          }));
          // Pulisci dismissed dopo il poll (i dati sono aggiornati)
          this.dismissedIds.clear();
        },
      });
  }

  load(): void {
    this.loading = true;
    this.reviewService
      .getDashboard()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.totalPending = data.total_pending;
          this.lastUpdated = new Date();
          this.sections = data.sections.map((s) => ({
            ...s,
            contents: s.contents.filter((c) => !this.dismissedIds.has(c.id)),
          }));
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  onDismissed(contentId: number): void {
    this.dismissedIds.add(contentId);
    // Rimuovi dalla vista corrente (ottimistic update)
    this.sections = this.sections.map((s) => ({
      ...s,
      contents: s.contents.filter((c) => c.id !== contentId),
    }));
    this.totalPending = Math.max(0, this.totalPending - 1);
  }

  channelPlatforms(section: ChannelReviewSection): string[] {
    return (section.channel.content_config as any)?.target_platforms ?? [];
  }

  trackBySection(_: number, s: ChannelReviewSection): number {
    return s.channel.id;
  }

  trackByContent(_: number, c: GeneratedContent): number {
    return c.id;
  }
}
