import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Channel, ChannelType } from '../../../../core/models/channel.model';
import { ChannelService } from '../../../../core/services/channel.service';
import { ChannelCardComponent } from '../../components/channel-card/channel-card';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-channels-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ChannelCardComponent],
  templateUrl: './channels.html',
  styleUrl: './channels.scss',
})
export class ChannelsPage implements OnInit {
  private channelService = inject(ChannelService);
  private toast = inject(ToastService);

  channels: Channel[] = [];
  loading = false;
  showForm = false;

  // New channel form
  form = {
    name: '',
    slug: '',
    channel_type: 'anime_artistic' as ChannelType,
    persona_name: '',
    persona_description: '',
    persona_voice_style: '',
    persona_visual_prompt: '',
    platforms: ['tiktok', 'instagram', 'youtube'],
    tone: '',
  };

  channelTypes: { value: ChannelType; label: string }[] = [
    { value: 'anime_artistic',    label: '🎌 Anime / Artistico' },
    { value: 'lifestyle_fitness', label: '💪 Lifestyle / Fitness' },
    { value: 'educational',       label: '🎓 Educativo' },
    { value: 'politics',          label: '🏛 Politica' },
    { value: 'shopping',          label: '🛍 Shopping' },
    { value: 'sports',            label: '⚽ Sport' },
    { value: 'technology',        label: '💻 Tecnologia' },
    { value: 'finance',           label: '💰 Finanza' },
    { value: 'entertainment',     label: '🎬 Entertainment' },
    { value: 'health',            label: '🩺 Salute' },
    { value: 'science',           label: '🔬 Scienza' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.channelService.list(false).subscribe({
      next: (res) => {
        this.channels = res.items;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  onChannelChange(updated: Channel): void {
    const idx = this.channels.findIndex((c) => c.id === updated.id);
    if (idx >= 0) this.channels[idx] = updated;
  }

  onPipelineTriggered(taskId: string): void {
    this.toast.show(`Pipeline avviata — task: ${taskId.slice(0, 8)}...`, 'success');
  }

  autoSlug(): void {
    this.form.slug = this.form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  submitForm(): void {
    if (!this.form.name || !this.form.slug || !this.form.persona_name) return;

    const body = {
      name: this.form.name,
      slug: this.form.slug,
      channel_type: this.form.channel_type,
      persona: {
        name: this.form.persona_name,
        description: this.form.persona_description,
        voice_style: this.form.persona_voice_style,
        visual_prompt_base: this.form.persona_visual_prompt,
      },
      credentials: {},
      content_config: {
        target_platforms: this.form.platforms,
        languages: Object.fromEntries(this.form.platforms.map((p) => [p, p === 'youtube' ? 'en' : 'it'])),
        default_topics: [],
        tone: this.form.tone,
        image_style: '',
      },
    };

    this.channelService.create(body).subscribe({
      next: (channel) => {
        this.channels.push(channel);
        this.showForm = false;
        this.toast.show(`Canale "${channel.name}" creato con successo`, 'success');
      },
    });
  }

  togglePlatform(platform: string): void {
    const idx = this.form.platforms.indexOf(platform);
    if (idx >= 0) {
      this.form.platforms = this.form.platforms.filter((p) => p !== platform);
    } else {
      this.form.platforms = [...this.form.platforms, platform];
    }
  }
}
