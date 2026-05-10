import { Component, Input, Output, EventEmitter, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { GeneratedContent, ContentStatus, ValidationResult } from '../../../../core/models/content.model';
import { ContentService } from '../../../../core/services/content.service';
import { PublishService } from '../../../../core/services/publish.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-content-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-card.html',
  styleUrl: './content-card.scss',
})
export class ContentCardComponent implements OnDestroy {
  @Input({ required: true }) content!: GeneratedContent;
  @Output() contentChange = new EventEmitter<GeneratedContent>();

  private contentService = inject(ContentService);
  private publishService = inject(PublishService);

  publishing = false;
  validating = false;
  generatingMedia = false;
  expanded = false;
  lang: 'it' | 'en' = 'it';
  scheduleExpanded = false;
  scheduleDate = '';
  scheduleTime = '09:00';
  bilingualMode = false;
  cancelling = false;
  private pollSub: Subscription | null = null;
  private _regenStartedAt: string | null = null;

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

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  // ── Helpers per costruire URL dal path ────────────────────────────

  private pathToUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    const filename = path.split('/').pop();
    const ts = this.content.updated_at ? new Date(this.content.updated_at).getTime() : '';
    return `${environment.apiUrl}/media/${filename}?t=${ts}`;
  }

  // ── Getter lingua-aware ────────────────────────────────────────────

  get activeHook(): string | null {
    const v = this.content.content_versions?.[this.lang];
    return v?.hook ?? this.content.hook;
  }

  get activeScript(): string | null {
    const v = this.content.content_versions?.[this.lang];
    return v?.script ?? this.content.script;
  }

  get langVideoPath(): string | null {
    const v = this.content.content_versions?.[this.lang];
    if (v?.video_path) return v.video_path;
    // Fallback: per IT usa i campi top-level (backward compat)
    if (this.lang === 'it' && this.content.video_path) return this.content.video_path;
    return null;
  }

  get langAudioPath(): string | null {
    const v = this.content.content_versions?.[this.lang];
    if (v?.audio_path) return v.audio_path;
    if (this.lang === 'it' && this.content.audio_path) return this.content.audio_path;
    return null;
  }

  get videoSrc(): string | null {
    return this.pathToUrl(this.langVideoPath);
  }

  get audioSrc(): string | null {
    return this.pathToUrl(this.langAudioPath);
  }

  get thumbnailSrc(): string | null {
    // Thumbnail rimane unica (solo IT)
    return this.content.thumbnail_url ? `${environment.apiUrl}${this.content.thumbnail_url}` : null;
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

  get hasVideoForLang(): boolean {
    return !!this.langVideoPath;
  }

  get canBilingual(): boolean {
    return !!(this.content.content_versions?.['en']?.script);
  }

  get canGenerateMedia(): boolean {
    return (
      !this.hasVideoForLang &&
      !this.generatingMedia &&
      (this.content.status === 'pending_review' || this.content.status === 'approved' || this.content.status === 'scheduled') &&
      !!(this.content.content_versions?.[this.lang]?.script ?? (this.lang === 'it' ? this.content.script : null))
    );
  }

  get todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  get availableLangs(): string[] {
    return Object.keys(this.content.content_versions ?? {});
  }

  // ── Generazione media ─────────────────────────────────────────────

  generateMedia(): void {
    this.generatingMedia = true;
    this._regenStartedAt = this.content.updated_at ?? new Date().toISOString();
    this.contentService.generateMedia(this.content.id, this.lang, this.bilingualMode).subscribe({
      next: () => this._startPolling(),
      error: () => (this.generatingMedia = false),
    });
  }

  private _startPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = interval(5000).subscribe(() => {
      this.contentService.getById(this.content.id).subscribe({
        next: (updated) => {
          const v = updated.content_versions?.[this.lang];
          const hasVideo = !!(v?.video_path || (this.lang === 'it' && updated.video_path));
          // Se stavamo rigenerando, aspettiamo che updated_at sia cambiato rispetto
          // a prima di avviare la regen, così non ci fermiamo sul vecchio video.
          const isNewer = !this._regenStartedAt ||
            (!!updated.updated_at && updated.updated_at > this._regenStartedAt);
          if (hasVideo && isNewer) {
            this.generatingMedia = false;
            this._regenStartedAt = null;
            this.pollSub?.unsubscribe();
            this.content = updated;
            this.contentChange.emit(updated);
          }
        },
      });
    });
  }

  toggleExpand(): void {
    this.expanded = !this.expanded;
  }

  // ── Azioni card ───────────────────────────────────────────────────

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
        this.contentChange.emit({ ...this.content, status: 'publishing' });
        this.publishing = false;
      },
      error: () => (this.publishing = false),
    });
  }

  validate(): void {
    this.validating = true;
    this.contentService.validate(this.content.id).subscribe({
      next: (result: ValidationResult) => {
        this.contentChange.emit({ ...this.content, validation_result: result });
        this.validating = false;
      },
      error: () => (this.validating = false),
    });
  }

  openSchedule(): void {
    this.scheduleExpanded = !this.scheduleExpanded;
    if (this.scheduleExpanded) {
      this.scheduleDate = this.todayDate;
      this.scheduleTime = '09:00';
    }
  }

  confirmSchedule(): void {
    if (!this.scheduleDate) return;
    const utcISO = this._romeToUtcISO(this.scheduleDate, this.scheduleTime);
    this.contentService.schedule(this.content.id, utcISO).subscribe({
      next: (updated) => {
        this.content = updated;
        this.scheduleExpanded = false;
        this.contentChange.emit(updated);
      },
    });
  }

  // Converte data+ora nel fuso Europe/Rome in una stringa ISO UTC (naive, senza 'Z').
  // Usa la Intl API per ricavare l'offset Rome↔UTC corretto per quella data specifica
  // (gestisce automaticamente ora legale estiva CEST +2 e invernale CET +1).
  private _romeToUtcISO(dateStr: string, timeStr: string): string {
    // Trick: considera l'input come UTC provvisorio, guarda che ora segna Rome per
    // quel momento UTC, calcola l'offset, poi sottrae l'offset per ottenere il vero UTC.
    const candidate = new Date(`${dateStr}T${timeStr}:00Z`);
    const romeEquiv = new Date(
      candidate.toLocaleDateString('en-CA', { timeZone: 'Europe/Rome' }) + 'T' +
      candidate.toLocaleTimeString('en-GB', { timeZone: 'Europe/Rome', hour12: false }) + 'Z'
    );
    const offsetMs = romeEquiv.getTime() - candidate.getTime(); // Rome è avanti di UTC
    return new Date(candidate.getTime() - offsetMs).toISOString().slice(0, 19);
  }

  cancelSchedule(): void {
    this.cancelling = true;
    this.contentService.schedule(this.content.id, null).subscribe({
      next: (updated) => {
        this.content = updated;
        this.cancelling = false;
        this.contentChange.emit(updated);
      },
      error: () => (this.cancelling = false),
    });
  }
}
