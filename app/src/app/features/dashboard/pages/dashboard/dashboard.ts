import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { switchMap, takeWhile } from 'rxjs/operators';
import { TrendingTopicsComponent } from '../../components/trending-topics/trending-topics';
import { ContentListComponent } from '../../components/content-list/content-list';
import { PipelineService } from '../../../../core/services/pipeline.service';
import { PipelineConfig } from '../../../../core/models/pipeline.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TrendingTopicsComponent, ContentListComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardPage implements OnInit, OnDestroy {
  private pipelineService = inject(PipelineService);

  config: PipelineConfig | null = null;
  triggerStatus: 'idle' | 'running' | 'done' | 'error' = 'idle';
  activeTaskId: string | null = null;

  private pollSub?: Subscription;

  ngOnInit(): void {
    this.pipelineService.getConfig().subscribe({ next: (c) => (this.config = c) });
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

  private pollStatus(): void {
    if (!this.activeTaskId) return;
    this.pollSub = interval(3000)
      .pipe(
        switchMap(() => this.pipelineService.getStatus(this.activeTaskId!)),
        takeWhile((s) => s.status !== 'SUCCESS' && s.status !== 'FAILURE', true)
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
