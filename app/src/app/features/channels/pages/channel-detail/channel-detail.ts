import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Channel } from '../../../../core/models/channel.model';
import { GeneratedContent } from '../../../../core/models/content.model';
import { ChannelService } from '../../../../core/services/channel.service';
import { ContentCardComponent } from '../../../dashboard/components/content-card/content-card';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-channel-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ContentCardComponent],
  templateUrl: './channel-detail.html',
  styleUrl: './channel-detail.scss',
})
export class ChannelDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private channelService = inject(ChannelService);
  private toast = inject(ToastService);

  channel: Channel | null = null;
  contents: GeneratedContent[] = [];
  total = 0;
  loading = false;
  generating = false;

  newTopic = '';
  newContext = '';

  // Wisdom quotes fields (only used for wisdom_quotes channels)
  quoteTheme = 'wisdom';
  quoteCount = 5;
  fetchingQuotes = false;

  readonly QUOTE_THEMES = [
    'wisdom', 'philosophy', 'life', 'motivational',
    'happiness', 'japanese', 'inspirational', 'sadness',
  ];

  get isWisdomChannel(): boolean {
    return this.channel?.channel_type === 'wisdom_quotes';
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadChannel(id);
    this.loadContent(id);
  }

  loadChannel(id: number): void {
    this.channelService.getById(id).subscribe({
      next: (ch) => (this.channel = ch),
    });
  }

  loadContent(id: number): void {
    this.loading = true;
    this.channelService.getContent(id).subscribe({
      next: (res) => {
        this.contents = res.items;
        this.total = res.total;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onContentChange(updated: GeneratedContent): void {
    const idx = this.contents.findIndex((c) => c.id === updated.id);
    if (idx >= 0) this.contents[idx] = updated;
  }

  generateContent(): void {
    if (!this.channel || !this.newTopic.trim()) return;
    this.generating = true;
    this.channelService.generate(this.channel.id, this.newTopic, this.newContext).subscribe({
      next: (res) => {
        this.toast.show('success', `Generazione avviata — task: ${res.task_id.slice(0, 8)}...`);
        this.newTopic = '';
        this.newContext = '';
        this.generating = false;
      },
      error: () => (this.generating = false),
    });
  }

  runPipeline(): void {
    if (!this.channel) return;
    this.channelService.runPipeline(this.channel.id).subscribe({
      next: (res) => this.toast.show('success', `Pipeline avviata — task: ${res.task_id.slice(0, 8)}...`),
    });
  }

  fetchQuotes(): void {
    if (!this.channel) return;
    this.fetchingQuotes = true;
    this.channelService.fetchQuotes(this.channel.id, { theme: this.quoteTheme, count: this.quoteCount }).subscribe({
      next: (res) => {
        this.toast.show('success', `Fetch citazioni avviato (${res.theme}) — task: ${res.task_id.slice(0, 8)}...`);
        this.fetchingQuotes = false;
      },
      error: () => (this.fetchingQuotes = false),
    });
  }
}
