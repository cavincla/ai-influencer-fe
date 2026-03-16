import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../../core/services/content.service';
import { CalendarDay } from '../../../../core/models/calendar.model';
import { GeneratedContent, ContentStatus } from '../../../../core/models/content.model';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class CalendarPage implements OnInit {
  private contentService = inject(ContentService);

  days: CalendarDay[] = [];
  loading = true;
  error: string | null = null;
  weekStart!: Date;

  selectedDay: CalendarDay | null = null;
  schedulingContent: GeneratedContent | null = null;
  scheduleDate = '';
  scheduleTime = '10:00';

  ngOnInit(): void {
    this.weekStart = this.getMonday(new Date());
    this.load();
  }

  prevWeek(): void {
    this.weekStart = new Date(this.weekStart.getTime() - 7 * 86400000);
    this.load();
  }

  nextWeek(): void {
    this.weekStart = new Date(this.weekStart.getTime() + 7 * 86400000);
    this.load();
  }

  goToday(): void {
    this.weekStart = this.getMonday(new Date());
    this.load();
  }

  selectDay(day: CalendarDay): void {
    this.selectedDay = this.selectedDay?.date === day.date ? null : day;
  }

  openSchedule(content: GeneratedContent, event: Event): void {
    event.stopPropagation();
    this.schedulingContent = content;
    this.scheduleDate = this.toDateInputValue(new Date());
  }

  confirmSchedule(): void {
    if (!this.schedulingContent || !this.scheduleDate) return;
    const iso = `${this.scheduleDate}T${this.scheduleTime}:00`;
    this.contentService.schedule(this.schedulingContent.id, iso).subscribe({
      next: () => {
        this.schedulingContent = null;
        this.load();
      },
    });
  }

  cancelSchedule(): void {
    this.schedulingContent = null;
  }

  removeSchedule(content: GeneratedContent, event: Event): void {
    event.stopPropagation();
    this.contentService.schedule(content.id, null).subscribe({ next: () => this.load() });
  }

  isToday(dateStr: string): boolean {
    return dateStr === this.toDateInputValue(new Date());
  }

  statusClass(status: ContentStatus): string {
    const map: Record<ContentStatus, string> = {
      pending: 'dot-grey',
      pending_review: 'dot-yellow',
      approved: 'dot-green',
      rejected: 'dot-red',
      publishing: 'dot-purple',
      published: 'dot-blue',
      failed: 'dot-red',
    };
    return map[status] ?? 'dot-grey';
  }

  get weekLabel(): string {
    const end = new Date(this.weekStart.getTime() + 6 * 86400000);
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${this.weekStart.toLocaleDateString('it-IT', opts)} — ${end.toLocaleDateString('it-IT', { ...opts, year: 'numeric' })}`;
  }

  dayName(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'short' });
  }

  dayNumber(dateStr: string): number {
    return new Date(dateStr + 'T12:00:00').getDate();
  }

  private load(): void {
    this.loading = true;
    this.error = null;
    this.selectedDay = null;
    const from = this.toDateInputValue(this.weekStart);
    const end = new Date(this.weekStart.getTime() + 6 * 86400000);
    const to = this.toDateInputValue(end);

    this.contentService.getCalendar(from, to).subscribe({
      next: (res) => {
        this.days = res.days;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossibile caricare il calendario.';
        this.loading = false;
      },
    });
  }

  private getMonday(d: Date): Date {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.getFullYear(), d.getMonth(), diff);
  }

  private toDateInputValue(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
}
