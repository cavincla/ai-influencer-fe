import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { TrendingTopicsComponent } from '../../components/trending-topics/trending-topics';
import { ContentListComponent } from '../../components/content-list/content-list';
import { PipelineService } from '../../../../core/services/pipeline.service';
import { PipelineConfig } from '../../../../core/models/pipeline.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TrendingTopicsComponent, ContentListComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage implements OnInit, OnDestroy {
  private pipelineService = inject(PipelineService);

  config: PipelineConfig | null = null;
  triggerStatus: 'idle' | 'running' | 'done' | 'error' = 'idle';
  activeTaskId: string | null = null;

  // Schedule editor
  editingSchedule = false;
  scheduleHour = 7;
  scheduleMinute = 0;
  savingSchedule = false;

  private pollSub?: Subscription;

  readonly minuteOptions = [0, 15, 30, 45];
  readonly hours = Array.from({ length: 24 }, (_, i) => i);

  ngOnInit(): void {
    this.pipelineService.getConfig().subscribe({
      next: (c) => {
        this.config = c;
        this.scheduleHour = c.pipeline_hour;
        this.scheduleMinute = c.pipeline_minute ?? 0;
      },
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  triggerPipeline(): void {
    this.triggerStatus = 'running';
    this.pipelineService.trigger().subscribe({
      next: (res) => {
        this.activeTaskId = res.task_id;
        this.pollStatus();
      },
      error: () => (this.triggerStatus = 'error'),
    });
  }

  toggleAutoPublish(): void {
    if (!this.config) return;
    this.pipelineService.updateConfig({ auto_publish: !this.config.auto_publish }).subscribe({
      next: (c) => (this.config = c),
    });
  }

  openScheduleEditor(): void {
    this.scheduleHour = this.config?.pipeline_hour ?? 7;
    this.scheduleMinute = this.config?.pipeline_minute ?? 0;
    this.editingSchedule = true;
  }

  saveSchedule(): void {
    this.savingSchedule = true;
    this.pipelineService
      .updateConfig({ pipeline_hour: this.scheduleHour, pipeline_minute: this.scheduleMinute })
      .subscribe({
        next: (c) => {
          this.config = c;
          this.editingSchedule = false;
          this.savingSchedule = false;
        },
        error: () => (this.savingSchedule = false),
      });
  }

  cancelScheduleEdit(): void {
    this.editingSchedule = false;
  }

  get scheduleLabel(): string {
    if (!this.config) return '—';
    const h = String(this.config.pipeline_hour).padStart(2, '0');
    const m = String(this.config.pipeline_minute ?? 0).padStart(2, '0');
    return `${h}:${m} (Roma)`;
  }

  private pollStatus(): void {
    if (!this.activeTaskId) return;
    this.pollSub = interval(3000)
      .pipe(
        switchMap(() => this.pipelineService.getStatus(this.activeTaskId!)),
        takeWhile((s) => s.status !== 'SUCCESS' && s.status !== 'FAILURE', true),
      )
      .subscribe({
        next: (s) => {
          if (s.status === 'SUCCESS') this.triggerStatus = 'done';
          if (s.status === 'FAILURE') this.triggerStatus = 'error';
        },
        error: () => (this.triggerStatus = 'error'),
      });
  }
}
