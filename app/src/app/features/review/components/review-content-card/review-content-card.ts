import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeneratedContent, ContentStatus } from '../../../../core/models/content.model';
import { ContentService } from '../../../../core/services/content.service';
import { PublishService } from '../../../../core/services/publish.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-review-content-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-content-card.html',
  styleUrl: './review-content-card.scss',
})
export class ReviewContentCardComponent {
  @Input({ required: true }) content!: GeneratedContent;
  @Input() channelPlatforms: string[] = [];
  @Output() dismissed = new EventEmitter<number>();
  @Output() contentChange = new EventEmitter<GeneratedContent>();

  private contentService = inject(ContentService);
  private publishService = inject(PublishService);

  expanded = false;
  publishExpanded = false;
  scheduleExpanded = false;
  selectedPlatforms: Record<string, boolean> = {};
  loading = false;

  // Schedule form
  scheduleDate = '';
  scheduleTime = '09:00';

  // Dry-run result
  dryRunResult: { preview_urls: Record<string, string> } | null = null;

  platformIcon: Record<string, string> = {
    tiktok: '🎵',
    instagram: '📸',
    youtube: '▶️',
    facebook: '📘',
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

  get hook(): string {
    return (
      this.content.content_versions?.['it']?.hook ??
      this.content.hook ??
      '(nessun hook)'
    );
  }

  get scriptPreview(): string {
    const script =
      this.content.content_versions?.['it']?.script ??
      this.content.script ??
      '';
    if (this.expanded) return script;
    return script.length > 100 ? script.slice(0, 100) + '…' : script;
  }

  get platforms(): string[] {
    return this.content.target_platforms?.length
      ? this.content.target_platforms
      : this.channelPlatforms;
  }

  get imageSrc(): string | null {
    return this.content.image_url
      ? `${environment.apiUrl}${this.content.image_url}`
      : null;
  }

  get todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  toggleExpand(): void {
    this.expanded = !this.expanded;
    if (this.publishExpanded) this.publishExpanded = false;
    if (this.scheduleExpanded) this.scheduleExpanded = false;
    this.dryRunResult = null;
  }

  // ── Pubblicazione ──────────────────────────────────────────────────

  togglePublish(): void {
    this.publishExpanded = !this.publishExpanded;
    this.scheduleExpanded = false;
    this.dryRunResult = null;
    if (this.publishExpanded) {
      this.selectedPlatforms = {};
      this.platforms.forEach((p) => (this.selectedPlatforms[p] = true));
    }
  }

  confirmPublish(dryRun = false): void {
    const selected = Object.entries(this.selectedPlatforms)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (!selected.length) return;

    this.loading = true;
    this.dryRunResult = null;
    this.publishService.publish(this.content.id, selected, dryRun).subscribe({
      next: (res) => {
        this.loading = false;
        if (dryRun) {
          // Mostra i preview URL senza rimuovere la card
          this.dryRunResult = { preview_urls: (res as any).preview_urls ?? {} };
          this.publishExpanded = false;
        } else {
          this.publishExpanded = false;
          this.dismissed.emit(this.content.id);
        }
      },
      error: () => (this.loading = false),
    });
  }

  // ── Approve / Reject ──────────────────────────────────────────────

  approve(): void {
    this.loading = true;
    this.contentService.updateStatus(this.content.id, 'approved').subscribe({
      next: () => {
        this.loading = false;
        this.dismissed.emit(this.content.id);
      },
      error: () => (this.loading = false),
    });
  }

  reject(): void {
    this.loading = true;
    this.contentService.updateStatus(this.content.id, 'rejected').subscribe({
      next: () => {
        this.loading = false;
        this.dismissed.emit(this.content.id);
      },
      error: () => (this.loading = false),
    });
  }

  // ── Schedulazione pubblicazione ───────────────────────────────────

  toggleSchedule(): void {
    this.scheduleExpanded = !this.scheduleExpanded;
    this.publishExpanded = false;
    this.dryRunResult = null;
    if (this.scheduleExpanded) {
      this.scheduleDate = this.todayDate;
      this.scheduleTime = '09:00';
    }
  }

  confirmSchedule(): void {
    if (!this.scheduleDate) return;
    const iso = `${this.scheduleDate}T${this.scheduleTime}:00`;
    this.loading = true;
    this.contentService.schedule(this.content.id, iso).subscribe({
      next: (updated) => {
        this.loading = false;
        this.scheduleExpanded = false;
        this.contentChange.emit(updated);
        this.dismissed.emit(this.content.id);
      },
      error: () => (this.loading = false),
    });
  }

  // ── Utilities ─────────────────────────────────────────────────────

  platformEntries(): { key: string; label: string }[] {
    return this.platforms.map((p) => ({
      key: p,
      label: `${this.platformIcon[p] ?? '🌐'} ${p}`,
    }));
  }

  dryRunEntries(): { platform: string; url: string }[] {
    if (!this.dryRunResult) return [];
    return Object.entries(this.dryRunResult.preview_urls).map(([platform, url]) => ({
      platform,
      url,
    }));
  }
}
