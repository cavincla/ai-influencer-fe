import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Channel } from '../../../../core/models/channel.model';
import { ChannelService } from '../../../../core/services/channel.service';

@Component({
  selector: 'app-channel-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './channel-card.html',
  styleUrl: './channel-card.scss',
})
export class ChannelCardComponent {
  @Input({ required: true }) channel!: Channel;
  @Output() channelChange = new EventEmitter<Channel>();
  @Output() pipelineTriggered = new EventEmitter<string>();

  private channelService = inject(ChannelService);

  runningPipeline = false;

  typeLabel: Record<string, string> = {
    anime_artistic:    '🎌 Anime / Artistico',
    lifestyle_fitness: '💪 Lifestyle / Fitness',
    educational:       '🎓 Educativo',
    politics:          '🏛 Politica',
    shopping:          '🛍 Shopping',
    sports:            '⚽ Sport',
    technology:        '💻 Tecnologia',
    finance:           '💰 Finanza',
    entertainment:     '🎬 Entertainment',
    health:            '🩺 Salute',
    science:           '🔬 Scienza',
  };

  typeColor: Record<string, string> = {
    anime_artistic:    'anime',
    lifestyle_fitness: 'fitness',
    educational:       'educational',
    politics:          'politics',
    shopping:          'shopping',
    sports:            'sports',
    technology:        'technology',
    finance:           'finance',
    entertainment:     'entertainment',
    health:            'health',
    science:           'science',
  };

  get platforms(): string[] {
    return this.channel.content_config?.target_platforms ?? [];
  }

  get colorClass(): string {
    return this.typeColor[this.channel.channel_type] ?? 'default';
  }

  runPipeline(): void {
    this.runningPipeline = true;
    this.channelService.runPipeline(this.channel.id).subscribe({
      next: (res) => {
        this.pipelineTriggered.emit(res.task_id);
        this.runningPipeline = false;
      },
      error: () => (this.runningPipeline = false),
    });
  }

  toggleActive(): void {
    if (this.channel.is_active) {
      this.channelService.deactivate(this.channel.id).subscribe({
        next: () => this.channelChange.emit({ ...this.channel, is_active: false }),
      });
    } else {
      this.channelService.update(this.channel.id, { is_active: true }).subscribe({
        next: (updated) => this.channelChange.emit(updated),
      });
    }
  }
}
