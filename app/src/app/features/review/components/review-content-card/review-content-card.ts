import { Component, Input, Output, EventEmitter, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
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
export class ReviewContentCardComponent implements OnDestroy {
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

  // Editing
  isEditing = false;
  editHook = '';
  editScript = '';
  editCta = '';

  // Media generation
  generatingMedia = false;
  private pollSub: Subscription | null = null;

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
    scheduled: 'Schedulato',
  };

  get hook(): string {
    return (
      this.content.content_versions?.['it']?.hook ??
      this.content.hook ??
      '(nessun hook)'
    );
  }

  get fullScript(): string {
    return (
      this.content.content_versions?.['it']?.script ??
      this.content.script ??
      ''
    );
  }

  get cta(): string {
    return (
      this.content.content_versions?.['it']?.cta ??
      this.content.cta ??
      ''
    );
  }

  get hashtags(): string[] {
    return (
      this.content.content_versions?.['it']?.hashtags ??
      this.content.hashtags ??
      []
    );
  }

  get scriptPreview(): string {
    const script = this.fullScript;
    if (this.expanded) return script;
    return script.length > 120 ? script.slice(0, 120) + '…' : script;
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

  get videoSrc(): string | null {
    return this.content.video_url
      ? `${environment.apiUrl}${this.content.video_url}`
      : null;
  }

  get hasVideo(): boolean {
    return !!this.content.video_path;
  }

  get canGenerateMedia(): boolean {
    return (
      !this.hasVideo &&
      !this.generatingMedia &&
      (this.content.status === 'pending_review' || this.content.status === 'approved')
    );
  }

  get todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  toggleExpand(): void {
    this.expanded = !this.expanded;
    if (!this.expanded) {
      this.isEditing = false;
    }
    if (this.publishExpanded) this.publishExpanded = false;
    if (this.scheduleExpanded) this.scheduleExpanded = false;
    this.dryRunResult = null;
  }

  // ── Editing ────────────────────────────────────────────────────────

  startEdit(): void {
    this.editHook = this.hook;
    this.editScript = this.fullScript;
    this.editCta = this.cta;
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  saveEdit(): void {
    this.loading = true;
    this.contentService
      .updateScript(this.content.id, {
        hook: this.editHook,
        script: this.editScript,
        cta: this.editCta,
      })
      .subscribe({
        next: (updated) => {
          this.loading = false;
          this.isEditing = false;
          this.contentChange.emit(updated);
          // Aggiorna il contenuto locale mantenendo gli altri campi
          this.content = { ...this.content, ...updated };
        },
        error: () => (this.loading = false),
      });
  }

  // ── Genera Video ──────────────────────────────────────────────────

  generateMedia(): void {
    this.generatingMedia = true;
    this.contentService.generateMedia(this.content.id).subscribe({
      next: () => {
        this._startPolling();
      },
      error: () => (this.generatingMedia = false),
    });
  }

  private _startPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = interval(5000).subscribe(() => {
      this.contentService.getById(this.content.id).subscribe({
        next: (updated) => {
          if (updated.video_path) {
            this.generatingMedia = false;
            this.pollSub?.unsubscribe();
            this.content = updated;
            this.contentChange.emit(updated);
          }
        },
      });
    });
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
          this.dryRunResult = { preview_urls: (res as { preview_urls?: Record<string, string> }).preview_urls ?? {} };
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
