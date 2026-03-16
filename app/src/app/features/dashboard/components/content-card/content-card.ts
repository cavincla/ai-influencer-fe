import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeneratedContent, ContentStatus } from '../../../../core/models/content.model';
import { ContentService } from '../../../../core/services/content.service';
import { PublishService } from '../../../../core/services/publish.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-card.html',
  styleUrl: './content-card.scss',
})
export class ContentCardComponent {
  @Input({ required: true }) content!: GeneratedContent;
  @Output() contentChange = new EventEmitter<GeneratedContent>();

  private contentService = inject(ContentService);
  private publishService = inject(PublishService);

  publishing = false;

  platformIcon: Record<string, string> = {
    tiktok: '🎵',
    instagram: '📸',
    youtube: '▶️',
  };

  statusLabel: Record<ContentStatus, string> = {
    pending: 'In coda',
    pending_review: 'In revisione',
    approved: 'Approvato',
    rejected: 'Scartato',
    publishing: 'Pubblicazione...',
    published: 'Pubblicato',
    failed: 'Fallito',
  };

  get audioSrc(): string | null {
    return this.content.audio_url ? `${environment.apiUrl}${this.content.audio_url}` : null;
  }

  get videoSrc(): string | null {
    return this.content.video_url ? `${environment.apiUrl}${this.content.video_url}` : null;
  }

  get platforms(): string[] {
    return this.content.target_platforms ?? [];
  }

  get caption(): string | null {
    if (!this.content.captions) return null;
    return Object.values(this.content.captions)[0] ?? null;
  }

  get publishedUrls(): { platform: string; url: string }[] {
    if (!this.content.published_urls) return [];
    return Object.entries(this.content.published_urls).map(([platform, url]) => ({
      platform,
      url,
    }));
  }

  approve(): void {
    this.contentService.updateStatus(this.content.id, 'approved').subscribe({
      next: (updated) => this.contentChange.emit(updated),
    });
  }

  reject(): void {
    this.contentService.updateStatus(this.content.id, 'rejected').subscribe({
      next: (updated) => this.contentChange.emit(updated),
    });
  }

  publish(): void {
    this.publishing = true;
    this.publishService.publish(this.content.id).subscribe({
      next: () => {
        // Optimistically update status; real update comes via polling or refresh
        this.contentChange.emit({ ...this.content, status: 'publishing' });
        this.publishing = false;
      },
      error: () => (this.publishing = false),
    });
  }
}
