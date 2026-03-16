import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentService } from '../../../../core/services/content.service';
import { GeneratedContent, ContentStatus } from '../../../../core/models/content.model';
import { ContentCardComponent } from '../content-card/content-card';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [CommonModule, ContentCardComponent],
  templateUrl: './content-list.html',
  styleUrl: './content-list.scss',
})
export class ContentListComponent implements OnInit {
  private contentService = inject(ContentService);

  items: GeneratedContent[] = [];
  loading = true;
  error: string | null = null;
  activeFilter: ContentStatus | undefined = undefined;

  filters: { label: string; value: ContentStatus | undefined }[] = [
    { label: 'Tutti', value: undefined },
    { label: 'In revisione', value: 'pending_review' },
    { label: 'Approvati', value: 'approved' },
    { label: 'In pubblicazione', value: 'publishing' },
    { label: 'Pubblicati', value: 'published' },
    { label: 'Scartati', value: 'rejected' },
  ];

  ngOnInit(): void {
    this.load();
  }

  setFilter(value: ContentStatus | undefined): void {
    this.activeFilter = value;
    this.load();
  }

  onContentChange(updated: GeneratedContent): void {
    const idx = this.items.findIndex((i) => i.id === updated.id);
    if (idx !== -1) {
      this.items = [
        ...this.items.slice(0, idx),
        updated,
        ...this.items.slice(idx + 1),
      ];
    }
  }

  private load(): void {
    this.loading = true;
    this.error = null;
    this.contentService.list(20, 0, this.activeFilter).subscribe({
      next: (res) => {
        this.items = res.items;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossibile caricare i contenuti.';
        this.loading = false;
      },
    });
  }
}
